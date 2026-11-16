// Hourly bot-traffic check (CIV-1762). Counts Vercel requests for the
// motions project over the last 24 hours. Over the threshold, it opens a
// `bot-traffic` GitHub issue (or comments on the open one) listing the top
// user agents, networks, bots, IP prefixes and paths, so the crawler's
// identity is saved before Vercel's detailed request data expires.
//
// Env:
//   VERCEL_TOKEN            Vercel token (optional locally if the CLI is logged in)
//   BOT_TRAFFIC_THRESHOLD   requests per 24h that trigger an alert (default 30000)
//   DRY_RUN=1               print the report instead of touching GitHub issues
//   GH_TOKEN                used by the gh CLI in GitHub Actions

import { execFileSync } from 'node:child_process';

const VERCEL_CLI = 'vercel@65.16.0';
const SCOPE = 'ryan-hannas-projects';
const PROJECT = 'motions';
const WINDOW = '24h';
const LABEL = 'bot-traffic';
const THRESHOLD = Number(process.env.BOT_TRAFFIC_THRESHOLD || 30000);
const DRY_RUN = process.env.DRY_RUN === '1';
const COMMENT_COOLDOWN_HOURS = 6;
const COUNT_KEY = 'vercel_request_count_count';

function metrics(extraArgs = []) {
  const args = [
    '-y', VERCEL_CLI, 'metrics', 'vercel.request.count',
    '--since', WINDOW, '--scope', SCOPE, '--project', PROJECT, '--json',
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

function top(dimension, limit = 10) {
  const result = metrics(['--group-by', dimension, '-n', String(limit)]);
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

function topPrefixes(limit = 10) {
  const totals = new Map();
  for (const { key, count } of top('clientIp', 100)) {
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

function gh(args) {
  return execFileSync('gh', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
}

function main() {
  const totalResult = metrics();
  const total = totalResult.summary?.[0]?.[COUNT_KEY] ?? 0;
  const { startTime, endTime } = totalResult.query || {};
  console.log(`Requests ${startTime} to ${endTime}: ${total} (threshold ${THRESHOLD})`);

  if (total <= THRESHOLD) {
    console.log('Under threshold, nothing to report.');
    return;
  }

  const body = [
    `**${total.toLocaleString('en-US')} requests** to the motions project between ${startTime} and ${endTime} (threshold ${THRESHOLD.toLocaleString('en-US')}).`,
    '',
    table('Top user agents', top('clientUserAgent')),
    table('Top networks (ASN)', top('asnName')),
    table('Top verified/known bots', top('botName')),
    table('Top IP prefixes', topPrefixes()),
    table('Top paths', top('requestPath')),
    '_Posted by the hourly bot-traffic check (`.github/workflows/bot-traffic-alert.yml`)._',
  ].join('\n');

  if (DRY_RUN) {
    console.log('\nDRY_RUN: issue body would be:\n');
    console.log(body);
    return;
  }

  gh(['label', 'create', LABEL, '--color', 'B60205', '--description', 'Automated bot-traffic alert', '--force']);
  const open = JSON.parse(gh(['issue', 'list', '--label', LABEL, '--state', 'open', '--json', 'number,createdAt,comments', '--limit', '1']));

  if (open.length === 0) {
    const title = `Bot traffic: ${total.toLocaleString('en-US')} requests in 24h`;
    gh(['issue', 'create', '--title', title, '--label', LABEL, '--body', body]);
    console.log('Opened a new bot-traffic issue.');
    return;
  }

  const issue = open[0];
  const times = [issue.createdAt, ...(issue.comments || []).map((c) => c.createdAt)].map((t) => Date.parse(t));
  const hoursSince = (Date.now() - Math.max(...times)) / 3_600_000;
  if (hoursSince < COMMENT_COOLDOWN_HOURS) {
    console.log(`Issue #${issue.number} was updated ${hoursSince.toFixed(1)}h ago; skipping (cooldown ${COMMENT_COOLDOWN_HOURS}h).`);
    return;
  }
  gh(['issue', 'comment', String(issue.number), '--body', body]);
  console.log(`Commented on issue #${issue.number}.`);
}

main();
