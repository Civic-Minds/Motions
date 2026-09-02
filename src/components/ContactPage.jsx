import React, { useState } from 'react';

const CONTACT_EMAIL = 'hey@ryanisnota.pro';

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const subject = encodeURIComponent(`[Motions] ${form.get('subject')}`);
    const body = encodeURIComponent(
      `Name: ${form.get('name')}\n\n${form.get('message')}`
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    setSent(true);
  }

  return (
    <article className="mx-auto max-w-2xl py-8 sm:py-14">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#004a99]">Civic Minds</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Contact Motions</h1>
      <p className="mt-4 text-base leading-7 text-slate-600">
        Have a question, found an issue, or need to make a privacy request? Send us a note.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Name</span>
          <input name="name" required autoComplete="name" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-[#004a99] focus:ring-2 focus:ring-blue-100" />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Subject</span>
          <select name="subject" className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#004a99] focus:ring-2 focus:ring-blue-100">
            <option>General question</option>
            <option>Report an issue</option>
            <option>Privacy request</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Message</span>
          <textarea name="message" required rows={7} className="mt-2 w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-[#004a99] focus:ring-2 focus:ring-blue-100" />
        </label>
        <button type="submit" className="rounded-lg bg-[#004a99] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#003b7a]">
          Open email draft
        </button>
        {sent && (
          <p className="text-sm text-slate-600" role="status">
            Your email app should have opened with the message ready to send. This temporary destination will be replaced with a Civic Minds address later.
          </p>
        )}
      </form>

      <p className="mt-5 text-xs leading-5 text-slate-500">
        Do not include passwords or other sensitive information in a general message. This form currently opens your device’s email app; messages are not stored by Motions.
      </p>
    </article>
  );
}
