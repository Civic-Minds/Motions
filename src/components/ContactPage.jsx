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
  { value: 'other', label: 'Something else' },
];
const ISSUE_TYPES = [
  { value: 'Incorrect information', label: 'The information is incorrect' },
  { value: 'Broken link or feature', label: 'A link or feature is broken' },
  { value: 'Suggestion or improvement', label: 'I have a suggestion' },
  { value: 'Something else', label: 'Something else' },
];

export default function ContactPage() {
  const [searchParams] = useSearchParams();
  const motionUrl = searchParams.get('motion') ?? '';
  const presetPageUrl = searchParams.get('page') ?? '';
  const presetSubject = searchParams.get('subject');
  const presetAbout = searchParams.get('about') ?? '';
  const presetIssueType = searchParams.get('type') ?? '';
  const [subject, setSubject] = useState(presetSubject || '');
  const [about, setAbout] = useState(presetAbout);
  const [issueType, setIssueType] = useState(presetIssueType);
  const [pageUrl, setPageUrl] = useState(motionUrl || presetPageUrl);
  const [message, setMessage] = useState('');

  const city = useMemo(() => {
    const cityId = motionUrl.match(/\/(toronto|vancouver)(?:\/|$)/i)?.[1]?.toLowerCase();
    return getJurisdiction(cityId || getLastJurisdiction()).name;
  }, [motionUrl]);

  function handleAboutChange(event) {
    const nextAbout = event.target.value;
    setAbout(nextAbout);
    setPageUrl(nextAbout === 'motion' ? motionUrl : '');
  }

  const prompt = subject === 'Report an issue'
    ? 'What should we check?'
    : subject === 'Privacy request'
      ? 'How can we help with your privacy request?'
      : 'What would you like to tell us?';

  function handleSubmit(event) {
    event.preventDefault();
    const aboutLabel = ISSUE_CONTEXTS.find(option => option.value === about)?.label;
    const referenceUrl = pageUrl;
    const opening = subject === 'Report an issue'
      ? 'Hi, I’d like to report an issue with Motions.'
      : subject === 'Privacy request'
        ? 'Hi, I’d like to make a privacy request.'
        : 'Hi, I have a question about Motions.';
    const body = [
      opening,
      subject === 'Report an issue' ? 'The details below were added automatically. Please leave them in place.' : '',
      subject === 'Report an issue' ? `City: ${city}` : '',
      issueType ? `Issue type: ${issueType}` : '',
      aboutLabel ? `About: ${aboutLabel}` : '',
      referenceUrl ? `Page: ${referenceUrl}` : '',
      subject === 'Report an issue' ? `What should we check?\n${message}` : message,
      'Thanks,',
    ].filter(Boolean).join('\n\n');
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
      ) : subject === 'Report an issue' && !issueType ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="contact-issue-type">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">What can we help with?</span>
            <select id="contact-subject" value={subject} onChange={event => setSubject(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#004a99] focus:ring-2 focus:ring-blue-100">
              {SUBJECTS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label htmlFor="contact-issue-type" className="mt-5 block text-sm font-semibold text-slate-700">What kind of issue is it?</label>
          <select id="contact-issue-type" defaultValue="" onChange={event => setIssueType(event.target.value)} className="mt-5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#004a99] focus:ring-2 focus:ring-blue-100">
            <option value="">Select one</option>
            {ISSUE_TYPES.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </section>
      ) : subject === 'Report an issue' && !about ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="contact-about">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">What can we help with?</span>
            <select id="contact-subject" value={subject} onChange={event => setSubject(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#004a99] focus:ring-2 focus:ring-blue-100">
              {SUBJECTS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label className="mt-5 block">
            <span className="text-sm font-semibold text-slate-700">Issue type</span>
            <select id="contact-issue-type" value={issueType} onChange={event => setIssueType(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#004a99] focus:ring-2 focus:ring-blue-100">
              {ISSUE_TYPES.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label htmlFor="contact-about" className="mt-5 block text-sm font-semibold text-slate-700">What is this about?</label>
          <select id="contact-about" defaultValue="" onChange={handleAboutChange} className="mt-5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#004a99] focus:ring-2 focus:ring-blue-100">
            <option value="">Select one</option>
            {ISSUE_CONTEXTS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </section>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">What can we help with?</span>
            <select id="contact-subject" value={subject} onChange={event => setSubject(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#004a99] focus:ring-2 focus:ring-blue-100">
              {SUBJECTS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          {subject === 'Report an issue' && (
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Issue type</span>
              <select id="contact-issue-type" value={issueType} onChange={event => setIssueType(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#004a99] focus:ring-2 focus:ring-blue-100">
                {ISSUE_TYPES.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
          )}
          {subject === 'Report an issue' && (
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">About</span>
              <select id="contact-about" value={about} onChange={handleAboutChange} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#004a99] focus:ring-2 focus:ring-blue-100">
                {ISSUE_CONTEXTS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
          )}
          {subject === 'Report an issue' && (
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">What page is this about? <span className="font-normal text-slate-400">(optional)</span></span>
              <input type="url" value={pageUrl} onChange={event => setPageUrl(event.target.value)} placeholder="https://motions.watch/..." className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-[#004a99] focus:ring-2 focus:ring-blue-100" />
            </label>
          )}
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">{prompt}</span>
            <textarea value={message} onChange={event => setMessage(event.target.value)} required autoFocus rows={7} className="mt-2 w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-[#004a99] focus:ring-2 focus:ring-blue-100" />
          </label>
          <div className="flex items-center gap-3">
            <button type="submit" className="rounded-lg bg-[#004a99] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#003b7a]">Send email</button>
          </div>
        </form>
      )}

      <p className="text-xs leading-5 text-slate-500">
        The button opens your device’s email app. Messages are not stored by Motions. Do not include passwords or other sensitive information in a general message.
      </p>
    </PageColumn>
  );
}
