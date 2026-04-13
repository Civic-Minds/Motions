import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { getCommittee, COMMITTEE_NAMES, TOPIC_LIGHT } from '../constants/data';
import { nameToSlug } from '../utils/slug';
import { cn } from '../lib/utils';

function committeeToSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function CommitteesView({ motions }) {
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
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [motions]);

  const selectedCommittee = committeeSlug
    ? committees.find(c => c.slug === committeeSlug) ?? null
    : null;

  const committeeMotions = useMemo(() => {
    if (!selectedCommittee) return [];
    return [...selectedCommittee.motions]
      .sort((a, b) => (b.significance ?? 0) - (a.significance ?? 0));
  }, [selectedCommittee]);

  return (
    <div className="space-y-6">

      {selectedCommittee && (
        <h1 className="text-2xl font-bold text-slate-900">{selectedCommittee.name}</h1>
      )}

      {!selectedCommittee ? (
        /* ── Committee grid ── */
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
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#004a99] shrink-0 mt-0.5 transition-colors" />
              </div>

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
      ) : (
        /* ── Committee detail ── */
        <div className="space-y-4">

          {/* Stats strip */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white border border-slate-200 rounded-2xl p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Motions</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{selectedCommittee.total}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Adopted</p>
              <p className="text-3xl font-black text-emerald-600 mt-1">{selectedCommittee.adoptionRate}%</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Substantive</p>
              <p className="text-3xl font-black text-[#004a99] mt-1">{selectedCommittee.substantive}</p>
            </div>
          </div>

          {/* Members */}
          {selectedCommittee.members.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Members</p>
              <div className="flex flex-wrap gap-2">
                {selectedCommittee.members.map(name => (
                  <button
                    key={name}
                    onClick={() => navigate(`/councillors/${nameToSlug(name)}`)}
                    className="text-xs font-medium px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 hover:bg-[#004a99] hover:text-white transition-colors"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Motions */}
          <div className="space-y-2">
            {committeeMotions.map((m, i) => (
              <motion.button
                key={m.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.3) }}
                onClick={() => navigate(`/motions/${m.id}`)}
                className="w-full text-left bg-white border border-slate-200 rounded-2xl p-4 flex items-start gap-3 hover:border-[#004a99]/40 hover:shadow-sm transition-all group"
              >
                <div className={cn("w-1 self-stretch rounded-full shrink-0", m.status === 'Adopted' ? 'bg-emerald-400' : 'bg-rose-400')} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 group-hover:text-[#004a99] transition-colors line-clamp-2 leading-snug">{m.title}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", m.status === 'Adopted' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700')}>{m.status}</span>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full", TOPIC_LIGHT[m.topic] || 'bg-slate-100 text-slate-600')}>{m.topic}</span>
                    {m.significance >= 90 && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">High Impact</span>}
                    {m.significance >= 60 && m.significance < 90 && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">Notable</span>}
                    <span className="text-xs text-slate-400 ml-auto">{m.date}</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#004a99] shrink-0 mt-0.5 transition-colors" />
              </motion.button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
