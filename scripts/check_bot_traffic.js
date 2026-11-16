// Hourly bot-traffic check (CIV-1762, CIV-1778). Counts Vercel requests over
// the last 24 hours for each project in PROJECTS (motions, atlas, atlas-beta,
// all in the ryan-hannas-projects team). For each project over its own
// threshold, it opens a `bot-traffic` GitHub issue titled with that project
// (or comments on that project's open one, at most every 6h) listing the top
// user agents, networks, bots, IP prefixes and paths, so the crawler's
// identity is saved before Vercel's detailed request data expires. New issues
// are assigned to ryanphanna so GitHub emails him.
//
// Thresholds are about 3x a normal busy day, from 30 days of daily counts
// (2026-10-17 to 2026-11-16), so ordinary days never alert.
//
// Env:
//   VERCEL_TOKEN            team-scoped Vercel token (optional locally if the CLI is logged in)
//   BOT_TRAFFIC_THRESHOLDS  per-project overrides, e.g. "atlas=10000,motions=20000"
//   BOT_TRAFFIC_THRESHOLD   legacy override for motions only
//   DRY_RUN=1               print the report instead of touching GitHub issues
//   GH_TOKEN                used by the gh CLI (locally, taken from the
//                           ryanphanna gh login when unset)
//   GH_REPO                 defaults to Civic-Minds/Motions
//
// Runs hourly in GitHub Actions (.github/workflows/bot-traffic-alert.yml).
// Under every threshold it makes no GitHub calls.

import { execFileSync } from 'node:child_process';

const VERCEL_CLI = 'vercel@65.16.0';
const SCOPE = 'ryan-hannas-projects';
const WINDOW = '24h';
const LABEL = 'bot-traffic';
// Normal busy day (30-day high outside spikes) -> threshold:
//   motions    ~10K/day  -> 30,000 (bot days ran 40K-190K)
//   atlas      ~5.8K/day -> 18,000 (bot days ran 34K and 93K)
//   atlas-beta ~6.4K/day -> 20,000
const PROJECTS = { motions: 30000, atlas: 18000, 'atlas-beta': 20000 };
const ASSIGNEE = 'ryanphanna';

function thresholds() {
  const out = { ...PROJECTS };
  if (process.env.BOT_TRAFFIC_THRESHOLD) out.motions = Number(process.env.BOT_TRAFFIC_THRESHOLD);
  for (const pair of (process.env.BOT_TRAFFIC_THRESHOLDS || '').split(',')) {
    const [name, value] = pair.split('=').map((x) => x && x.trim());
    if (name && name in out && Number(value) > 0) out[name] = Number(value);
  }
  return out;
}

const issuePrefix = (project) => `Bot traffic (${project}):`;
const DRY_RUN = process.env.DRY_RUN === '1';
const COMMENT_COOLDOWN_HOURS = 6;
const COUNT_KEY = 'vercel_request_count_count';
const GH_ACCOUNT = 'ryanphanna';

process.env.GH_REPO ||= 'Civic-Minds/Motions';

function metrics(project, extraArgs = []) {
  const args = [
    '-y', VERCEL_CLI, 'metrics', 'vercel.request.count',
    '--since', WINDOW, '--scope', SCOPE, '--project', project, '--json',
    ...extraArgs,
  ];
  if (process.env.VERCEL_TOKEN) args.push('--token', process.env.VERCEL_TOKEN);
  const out = execFileSync('npx', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 32 * 1024 * 1024,
  });
  return JSON.parse(out);
}

function top(project, dimension, limit = 10) {
  const result = metrics(project, ['--group-by', dimension, '-n', String(limit)]);
  return (result.summary || [])
    .map((row) => ({ key: row[dimension] || '(none)', count: row[COUNT_KEY] || 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

// Group IPs into prefixes (/24 for IPv4, /48 for IPv6). The repo is public,
// so full addresses are never written to the issue.
function ipPrefix(ip) {
  if (!ip || ip === '(none)') return '(none)';
  if (ip.includes(':')) return `${ip.split(':').slice(0, 3).join(':')}::/48`;
  return `${ip.split('.').slice(0, 3).join('.')}.0/24`;
}

function topPrefixes(project, limit = 10) {
  const totals = new Map();
  for (const { key, count } of top(project, 'clientIp', 100)) {
    const prefix = ipPrefix(key);
    totals.set(prefix, (totals.get(prefix) || 0) + count);
  }
  return [...totals.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

function table(title, rows) {
  const clean = (s) => String(s).replace(/\|/g, '\\|').replace(/`/g, "'").slice(0, 200);
  const lines = rows.map((r) => `| ${r.count.toLocaleString('en-US')} | \`${clean(r.key)}\` |`);
  return [`### ${title}`, '', '| Requests | Value |', '| ---: | --- |', ...lines, ''].join('\n');
}

// Locally, pin gh to the ryanphanna login without switching the active
// account (reads the stored token; no API call).
function ensureGhToken() {
  if (process.env.GH_TOKEN) return;
  process.env.GH_TOKEN = execFileSync('gh', ['auth', 'token', '--user', GH_ACCOUNT], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
  }).trim();
}

function gh(args) {
  return execFileSync('gh', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
}

// Returns a report for a project over its threshold, or null.
function checkProject(project, threshold) {
  const totalResult = metrics(project);
  const total = totalResult.summary?.[0]?.[COUNT_KEY] ?? 0;
  const { startTime, endTime } = totalResult.query || {};
  console.log(`[${project}] Requests ${startTime} to ${endTime}: ${total} (threshold ${threshold})`);
  if (total <= threshold) return null;

  const body = [
    `**${total.toLocaleString('en-US')} requests** to the ${project} project between ${startTime} and ${endTime} (threshold ${threshold.toLocaleString('en-US')}).`,
    '',
    table('Top user agents', top(project, 'clientUserAgent')),
    table('Top networks (ASN)', top(project, 'asnName')),
    table('Top verified/known bots', top(project, 'botName')),
    table('Top IP prefixes', topPrefixes(project)),
    table('Top paths', top(project, 'requestPath')),
    '_Posted by the hourly bot-traffic check (`scripts/check_bot_traffic.js`, GitHub Actions)._',
  ].join('\n');
  return { project, total, body };
}

// Issues opened before CIV-1778 were titled "Bot traffic: ..." and were
// always about motions.
function belongsTo(issue, project) {
  if (issue.title.startsWith(issuePrefix(project))) return true;
  return project === 'motions' && /^Bot traffic: /.test(issue.title);
}

function report({ project, total, body }, openIssues) {
  const issue = openIssues.find((i) => belongsTo(i, project));
  if (!issue) {
    const title = `${issuePrefix(project)} ${total.toLocaleString('en-US')} requests in 24h`;
    gh(['issue', 'create', '--title', title, '--label', LABEL, '--assignee', ASSIGNEE, '--body', body]);
    console.log(`[${project}] Opened a new bot-traffic issue.`);
    return;
  }
  const times = [issue.createdAt, ...(issue.comments || []).map((c) => c.createdAt)].map((t) => Date.parse(t));
  const hoursSince = (Date.now() - Math.max(...times)) / 3_600_000;
  if (hoursSince < COMMENT_COOLDOWN_HOURS) {
    console.log(`[${project}] Issue #${issue.number} was updated ${hoursSince.toFixed(1)}h ago; skipping (cooldown ${COMMENT_COOLDOWN_HOURS}h).`);
    return;
  }
  gh(['issue', 'comment', String(issue.number), '--body', body]);
  console.log(`[${project}] Commented on issue #${issue.number}.`);
}

function main() {
  const reports = [];
  let failed = false;
  for (const [project, threshold] of Object.entries(thresholds())) {
    try {
      const r = checkProject(project, threshold);
      if (r) reports.push(r);
    } catch (err) {
      failed = true;
      console.error(`[${project}] Check failed: ${err.message}`);
    }
  }

  if (reports.length === 0) {
    console.log('Under every threshold, nothing to report.');
  } else if (DRY_RUN) {
    for (const r of reports) {
      console.log(`\nDRY_RUN [${r.project}]: would open "${issuePrefix(r.project)} ..." (assignee ${ASSIGNEE}) or comment; body:\n`);
      console.log(r.body);
    }
  } else {
    ensureGhToken();
    gh(['label', 'create', LABEL, '--color', 'B60205', '--description', 'Automated bot-traffic alert', '--force']);
    const openIssues = JSON.parse(gh(['issue', 'list', '--label', LABEL, '--state', 'open', '--json', 'number,title,createdAt,comments', '--limit', '50']));
    for (const r of reports) report(r, openIssues);
  }

  if (failed) process.exitCode = 1;
}

main();
