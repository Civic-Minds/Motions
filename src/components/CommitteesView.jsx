import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Star, Calendar } from 'lucide-react';
import { getCommittee, COMMITTEE_NAMES, TOPIC_LIGHT, COMMITTEE_DESCRIPTIONS } from '../constants/data';
import { nameToSlug } from '../utils/slug';
import { cn } from '../lib/utils';

function committeeToSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function CommitteesView({ motions, meetings = [], followedCommittees = [], onToggleFollow }) {
  const { committeeSlug } = useParams();
  const navigate = useNavigate();

  const primaryMotions = useMemo(() => motions.filter(m => !m.parentId), [motions]);

  const committees = useMemo(() => {
    const map = {};
    primaryMotions.forEach(m => {
      const name = m.committee || getCommittee(m.id);
      if (!map[name]) map[name] = { name, motions: [] };
      map[name].motions.push(m);
    });

    return Object.values(map)
      .map(c => {
        const adopted = c.motions.filter(m => m.status === 'Adopted').length;
        const substantive = c.motions.filter(m => !m.trivial).length;
        const topicCounts = c.motions.reduce((acc, m) => {
          acc[m.topic] = (acc[m.topic] || 0) + 1;
          return acc;
        }, {});
        const topTopics = Object.entries(topicCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([t]) => t);
        const latest = c.motions
          .map(m => m.date)
          .sort((a, b) => new Date(b) - new Date(a))[0];

        // Derive members: councillors who voted on this committee's motions most often
        const voteCounts = {};
        c.motions.forEach(m => {
          Object.entries(m.votes ?? {}).forEach(([name, vote]) => {
            if (vote === 'YES' || vote === 'NO') {
              voteCounts[name] = (voteCounts[name] || 0) + 1;
            }
          });
        });
        const threshold = Math.max(1, c.motions.length * 0.25);
        const members = Object.entries(voteCounts)
          .filter(([, count]) => count >= threshold)
          .sort((a, b) => b[1] - a[1])
          .map(([name]) => name);

        return {
          ...c,
          slug: committeeToSlug(c.name),
          total: c.motions.length,
          adopted,
          adoptionRate: Math.round((adopted / c.motions.length) * 100),
          substantive,
          topTopics,
          latest,
          members,
          description: COMMITTEE_DESCRIPTIONS[c.name] ?? 'A Toronto city committee reviewing motions and policy.',
        };
      })
      .sort((a, b) => {
        const aFollowed = followedCommittees.includes(a.name);
        const bFollowed = followedCommittees.includes(b.name);
        if (aFollowed && !bFollowed) return -1;
        if (!aFollowed && bFollowed) return 1;
        return b.total - a.total;
      });
  }, [motions]);

  const TODAY = new Date().toISOString().slice(0, 10);

  // Bodies that appear in meetings data but have no motions — advisory boards, tribunals, etc.
  const meetingsOnlyBodies = useMemo(() => {
    const committeeNames = new Set(committees.map(c => c.name));
    const bodyMap = {};
    meetings.forEach(m => {
      if (committeeNames.has(m.committee)) return; // already covered in main grid
      if (!bodyMap[m.committee]) bodyMap[m.committee] = { name: m.committee, meetings: [] };
      bodyMap[m.committee].meetings.push(m);
    });
    return Object.values(bodyMap)
      .map(b => {
        const upcoming = b.meetings.filter(m => m.date >= TODAY);
        const next = upcoming.sort((a, z) => a.date.localeCompare(z.date))[0] ?? null;
        return { ...b, slug: committeeToSlug(b.name), upcomingCount: upcoming.length, next };
      })
      .sort((a, b) => {
        // Bodies with upcoming meetings first, then alphabetical
        if (a.upcomingCount > 0 && b.upcomingCount === 0) return -1;
        if (a.upcomingCount === 0 && b.upcomingCount > 0) return 1;
        return a.name.localeCompare(b.name);
      });
  }, [committees, meetings]);

  const selectedCommittee = committeeSlug
    ? committees.find(c => c.slug === committeeSlug) ?? null
    : null;

  // Check if the slug matches a meetings-only body (no motions)
  const selectedBody = !selectedCommittee && committeeSlug
    ? meetingsOnlyBodies.find(b => b.slug === committeeSlug) ?? null
    : null;

  const committeeMotions = useMemo(() => {
    if (!selectedCommittee) return [];
    return [...selectedCommittee.motions]
      .sort((a, b) => {
        const dateDiff = new Date(b.date) - new Date(a.date);
        if (dateDiff !== 0) return dateDiff;
        return (b.significance ?? 0) - (a.significance ?? 0);
      });
  }, [selectedCommittee]);

  return (
    <div className="space-y-6">

      {/* ── Meetings-only body detail ── */}
      {selectedBody && (
        <div className="space-y-4 max-w-5xl mx-auto">
          <button
            onClick={() => navigate('/committees')}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
          <h1 className="text-xl font-bold text-slate-900">{selectedBody.name}</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                    Meetings · {selectedBody.meetings.length} total
                  </p>
                </div>
                <div className="divide-y divide-slate-100">
                  {[...selectedBody.meetings]
                    .sort((a, b) => {
                      const aUp = a.date >= TODAY;
                      const bUp = b.date >= TODAY;
                      if (aUp && !bUp) return -1;   // upcoming before past
                      if (!aUp && bUp) return 1;
                      if (aUp) return a.date.localeCompare(b.date);   // upcoming: nearest first
                      return b.date.localeCompare(a.date);             // past: most recent first
                    })
                    .map((m, i) => (
                      <button
                        key={i}
                        onClick={() => m.meetingReference ? navigate(`/meetings/${m.meetingReference}`) : null}
                        className={cn(
                          "w-full flex items-center gap-4 px-5 py-3.5 text-left transition-colors",
                          m.meetingReference ? "hover:bg-slate-50 group" : "cursor-default"
                        )}
                      >
                        <div className="shrink-0 w-10 text-center">
                          <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">
                            {new Date(m.date + 'T12:00:00').toLocaleString('en-CA', { month: 'short' })}
                          </p>
                          <p className="text-lg font-black text-slate-700 leading-tight">
                            {new Date(m.date + 'T12:00:00').getDate()}
                          </p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-sm font-medium text-slate-700 transition-colors", m.meetingReference && "group-hover:text-[#004a99]")}>
                            {m.displayDate}
                          </p>
                          <div className="flex items-center gap-3 mt-0.5">
                            {m.startTime && <span className="text-[11px] text-slate-400">{m.startTime}</span>}
                            {m.agendaItems?.length > 0 && (
                              <span className="text-[11px] text-slate-400">{m.agendaItems.length} agenda items</span>
                            )}
                            {m.date >= TODAY
                              ? <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">Upcoming</span>
                              : <span className="text-[10px] text-slate-300">Past</span>
                            }
                          </div>
                        </div>
                        {m.meetingReference && (
                          <ArrowRight className="w-4 h-4 text-slate-200 group-hover:text-[#004a99] shrink-0 transition-colors" />
                        )}
                      </button>
                    ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-8">
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Total meetings</span>
                  <span className="text-2xl font-black text-slate-900">{selectedBody.meetings.length}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Upcoming</span>
                  <span className="text-sm font-bold text-emerald-600">{selectedBody.upcomingCount}</span>
                </div>
              </div>
              <button
                onClick={() => navigate(`/meetings?committee=${selectedBody.slug}`)}
                className="w-full text-left px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-500 hover:border-[#004a99]/40 hover:text-[#004a99] transition-colors flex items-center justify-between"
              >
                <span>View all meetings</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedCommittee && (
        <div className="space-y-3 mb-2">
          <button
            onClick={() => navigate('/committees')}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900">{selectedCommittee.name}</h1>
              <p className="text-sm text-slate-500 mt-1 max-w-xl leading-relaxed">{selectedCommittee.description}</p>
            </div>
            <button
              onClick={() => onToggleFollow(selectedCommittee.name)}
              className={cn(
                "shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all border",
                followedCommittees.includes(selectedCommittee.name)
                  ? "bg-amber-50 border-amber-200 text-amber-700"
                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
              )}
            >
              <Star className={cn("w-3.5 h-3.5", followedCommittees.includes(selectedCommittee.name) && "fill-current text-amber-500")} />
              {followedCommittees.includes(selectedCommittee.name) ? 'Following' : 'Follow'}
            </button>
          </div>
        </div>
      )}

      {!selectedCommittee && !selectedBody ? (
        /* ── Committee grid ── */
        <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {committees.map((c, i) => (
            <motion.button
              key={c.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => navigate(`/committees/${c.slug}`)}
              className="bg-white border border-slate-200 rounded-2xl p-5 text-left hover:border-[#004a99]/40 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold text-slate-900 text-sm leading-snug group-hover:text-[#004a99] transition-colors">
                  {c.name}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggleFollow(c.name); }}
                    className={cn(
                      "p-1.5 rounded-lg transition-colors border",
                      followedCommittees.includes(c.name)
                        ? "bg-amber-50 border-amber-200 text-amber-500"
                        : "bg-slate-50 border-slate-100 text-slate-300 hover:text-slate-500"
                    )}
                  >
                    <Star className={cn("w-3.5 h-3.5", followedCommittees.includes(c.name) && "fill-current")} />
                  </button>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#004a99] shrink-0 transition-colors" />
                </div>
              </div>

              <p className="mt-2 text-[11px] text-slate-400 line-clamp-2 leading-normal">
                {c.description}
              </p>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-black text-slate-900 leading-none">{c.total}</span>
                <span className="text-xs text-slate-400">motions</span>
              </div>

              {/* Adoption bar */}
              <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all"
                  style={{ width: `${c.adoptionRate}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[10px] text-slate-400">{c.adoptionRate}% adopted</span>
                <span className="text-[10px] text-slate-400">{c.substantive} substantive</span>
              </div>

              {/* Top topics */}
              {c.topTopics.length > 0 && (
                <div className="flex gap-1.5 mt-3 flex-wrap">
                  {c.topTopics.map(t => (
                    <span key={t} className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", TOPIC_LIGHT[t] || 'bg-slate-100 text-slate-500')}>
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </motion.button>
          ))}
        </div>

        {/* ── Boards & other bodies ── */}
        {meetingsOnlyBodies.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">
              Boards &amp; Other Bodies
            </p>
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
              {meetingsOnlyBodies.map((b, i) => (
                <button
                  key={b.name}
                  onClick={() => navigate(`/committees/${b.slug}`)}
                  className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors group text-left"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 group-hover:text-[#004a99] transition-colors truncate">
                      {b.name}
                    </p>
                    {b.next && (
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Next: {b.next.displayDate}
                      </p>
                    )}
                  </div>
                  {b.upcomingCount > 0 && (
                    <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                      {b.upcomingCount} upcoming
                    </span>
                  )}
                  <ArrowRight className="w-4 h-4 text-slate-200 group-hover:text-[#004a99] shrink-0 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        )}
        </div>
      ) : (selectedCommittee) ? (
        /* ── Committee detail ── */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start max-w-5xl mx-auto">

          {/* LEFT: Motions */}
          <div className="lg:col-span-2 space-y-2">
            {committeeMotions.map((m, i) => (
              <motion.button
                key={m.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.3) }}
                onClick={() => navigate(`/motions/${m.id}`)}
                className="w-full text-left bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3 hover:border-[#004a99]/40 hover:shadow-sm transition-all group"
              >
                <div className={cn("w-1 self-stretch rounded-full shrink-0", m.status === 'Adopted' ? 'bg-emerald-400' : 'bg-rose-400')} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 group-hover:text-[#004a99] transition-colors line-clamp-2 leading-snug">{m.title}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", m.status === 'Adopted' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700')}>{m.status}</span>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full", TOPIC_LIGHT[m.topic] || 'bg-slate-100 text-slate-600')}>{m.topic}</span>
                    {m.significance >= 60 && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">Notable</span>}
                    <span className="text-xs text-slate-400 ml-auto">{m.date}</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#004a99] shrink-0 mt-0.5 transition-colors" />
              </motion.button>
            ))}
          </div>

          {/* RIGHT: Sidebar */}
          <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-8">

            {/* Stats */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Motions</span>
                <span className="text-2xl font-black text-slate-900">{selectedCommittee.total}</span>
              </div>
              <div>
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Adopted</span>
                  <span className="text-sm font-bold text-emerald-600">{selectedCommittee.adoptionRate}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${selectedCommittee.adoptionRate}%` }} />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Substantive</span>
                <span className="text-sm font-bold text-[#004a99]">{selectedCommittee.substantive}</span>
              </div>
            </div>

            {/* Upcoming meetings */}
            {(() => {
              const upcoming = meetings
                .filter(m => m.committee === selectedCommittee.name && m.date >= TODAY)
                .sort((a, b) => a.date.localeCompare(b.date));
              if (!upcoming.length) return null;
              return (
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Upcoming Meetings</p>
                    </div>
                    <button
                      onClick={() => navigate(`/meetings?committee=${selectedCommittee.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`)}
                      className="text-[11px] font-semibold text-[#004a99]/60 hover:text-[#004a99] transition-colors"
                    >
                      See all
                    </button>
                  </div>
                  <div className="space-y-1">
                    {upcoming.map((m, i) => {
                      const inner = (
                        <>
                          <span className="text-sm text-slate-700 font-medium">{m.displayDate}</span>
                          <div className="flex items-center gap-2">
                            {m.agendaItems?.length > 0 && (
                              <span className="text-xs text-slate-400">{m.agendaItems.length} items</span>
                            )}
                            <span className="text-xs font-semibold text-[#004a99]">{m.startTime}</span>
                          </div>
                        </>
                      );
                      return m.meetingReference ? (
                        <button key={i} onClick={() => navigate(`/meetings/${m.meetingReference}`)}
                          className="w-full flex items-center justify-between hover:bg-slate-50 -mx-2 px-2 py-1.5 rounded-lg transition-colors">
                          {inner}
                        </button>
                      ) : (
                        <div key={i} className="flex items-center justify-between py-1.5">{inner}</div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Members */}
            {selectedCommittee.members.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Members</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCommittee.members.map(name => (
                    <button
                      key={name}
                      onClick={() => navigate(`/councillors/${nameToSlug(name)}`)}
                      className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 hover:bg-[#004a99] hover:text-white transition-colors"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      ) : null}

    </div>
  );
}
