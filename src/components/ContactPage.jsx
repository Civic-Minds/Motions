import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageMeta } from './PageMeta';
import PageColumn from './PageColumn';
import { getJurisdiction } from '../constants/jurisdictions';
import { getLastJurisdiction } from '../utils/storage';

const CONTACT_EMAIL = 'hey@ryanisnota.pro';
const SUBJECTS = [
  { value: 'General question', label: 'I have a question' },
  { value: 'Report an issue', label: 'I have an issue' },
  { value: 'Privacy request', label: 'I have a privacy request' },
];
const ISSUE_CONTEXTS = [
  { value: 'motion', label: 'A motion' },
  { value: 'meeting', label: 'A meeting' },
];

export default function ContactPage() {
  const [searchParams] = useSearchParams();
  const motionUrl = searchParams.get('motion') ?? '';
  const pageTitle = searchParams.get('title') ?? '';
  const presetSubject = searchParams.get('subject');
  const presetAbout = searchParams.get('about') ?? '';
  const [subject, setSubject] = useState(presetSubject || '');
  const [about, setAbout] = useState(presetAbout);
  const [message, setMessage] = useState('');

  const city = useMemo(() => {
    const cityId = motionUrl.match(/\/(toronto|vancouver)(?:\/|$)/i)?.[1]?.toLowerCase();
    return getJurisdiction(cityId || getLastJurisdiction()).name;
  }, [motionUrl]);

  const prompt = subject === 'Report an issue'
    ? 'What should we check?'
    : subject === 'Privacy request'
      ? 'How can we help with your privacy request?'
      : 'What would you like to tell us?';

  function handleSubmit(event) {
    event.preventDefault();
    const body = [
      `City: ${city}`,
      `Reason: ${subject}`,
      about ? `About: ${about}` : '',
      message,
      motionUrl ? `\nMotion URL: ${motionUrl}` : '',
    ].join('\n\n');
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Motions — ${subject}`)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <PageColumn className="space-y-7 pb-20">
      <PageMeta title="Contact | Motions" description="Contact Motions with a question, issue report, or privacy request." />
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Contact Motions</h1>
        <p className="mt-2 leading-relaxed text-slate-500">
          A quick way to ask a question, report an issue, or make a privacy request.
        </p>
      </div>

      {!subject ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="contact-reason">
          <label htmlFor="contact-subject" className="block text-lg font-semibold text-slate-900">What can we help with?</label>
          <select id="contact-subject" defaultValue="" onChange={event => setSubject(event.target.value)} className="mt-5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#004a99] focus:ring-2 focus:ring-blue-100">
            <option value="">Select a reason</option>
            {SUBJECTS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </section>
      ) : subject === 'Report an issue' && !about ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="contact-about">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Reason</span>
            <select id="contact-subject" value={subject} onChange={event => setSubject(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#004a99] focus:ring-2 focus:ring-blue-100">
              {SUBJECTS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label htmlFor="contact-about" className="mt-5 block text-sm font-semibold text-slate-700">What is this about?</label>
          <select id="contact-about" defaultValue="" onChange={event => setAbout(event.target.value)} className="mt-5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#004a99] focus:ring-2 focus:ring-blue-100">
            <option value="">Select one</option>
            {ISSUE_CONTEXTS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </section>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Reason</span>
            <select id="contact-subject" value={subject} onChange={event => setSubject(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#004a99] focus:ring-2 focus:ring-blue-100">
              {SUBJECTS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          {subject === 'Report an issue' && (
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">About</span>
              <select id="contact-about" value={about} onChange={event => setAbout(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#004a99] focus:ring-2 focus:ring-blue-100">
                {ISSUE_CONTEXTS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
          )}
          {motionUrl && (
            <div className="rounded-lg bg-slate-50 px-3 py-2.5 text-sm text-slate-500">
              <span className="block">Page link</span>
              <a href={motionUrl} target="_blank" rel="noreferrer" className="mt-1 block font-semibold text-[#004a99] hover:underline">
                {pageTitle || `Open ${about || 'source'} page`} ↗
              </a>
              <code className="mt-1 block break-all text-xs text-slate-500">{motionUrl}</code>
            </div>
          )}
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">{prompt}</span>
            <textarea value={message} onChange={event => setMessage(event.target.value)} required autoFocus rows={7} className="mt-2 w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-[#004a99] focus:ring-2 focus:ring-blue-100" />
          </label>
          <div className="flex items-center gap-3">
            <button type="submit" className="rounded-lg bg-[#004a99] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#003b7a]">Send email</button>
            <button type="button" onClick={() => setSubject('')} className="text-sm font-semibold text-slate-500 hover:text-slate-900">Back</button>
          </div>
        </form>
      )}

      <p className="text-xs leading-5 text-slate-500">
        The button opens your device’s email app. Messages are not stored by Motions. Do not include passwords or other sensitive information in a general message.
      </p>
    </PageColumn>
  );
}
