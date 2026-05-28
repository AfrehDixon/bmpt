'use client';

import { useState } from 'react';
import { Send, Loader2, CheckCircle2 } from 'lucide-react';

const services = [
  'Accounting & Bookkeeping Solution',
  'Business Structuring & Formalisation',
  'Software Solutions',
  'Training & Support',
  'Business Support',
];

export default function ContactForm({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setStatus('sending');
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to send');
      setStatus('ok');
      form.reset();
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  }

  const field =
    variant === 'dark'
      ? 'w-full rounded-xl border-0 bg-white/95 px-4 py-3 text-sm text-navy placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-300'
      : 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-navy placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100';

  if (status === 'ok') {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl bg-white/95 p-10 text-center">
        <CheckCircle2 className="text-emerald-500" size={48} />
        <h3 className="mt-4 font-display text-xl font-bold text-navy">Message sent successfully!</h3>
        <p className="mt-2 text-sm text-slate-600">
          Thank you for reaching out. Our team will reply within 24 hours.
        </p>
        <button onClick={() => setStatus('idle')} className="btn-ghost mt-6">
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input name="name" required placeholder="Your Name" className={field} />
      <input name="email" type="email" required placeholder="Your Email" className={field} />
      <select name="service" defaultValue="" className={field}>
        <option value="" disabled>
          Select a service
        </option>
        {services.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <input name="subject" placeholder="Subject" className={field} />
      <textarea name="message" required rows={4} placeholder="Message" className={field} />
      {status === 'error' && <p className="text-sm text-red-500">{error || 'An error occurred. Please try again.'}</p>}
      <button type="submit" disabled={status === 'sending'} className="btn-primary w-full">
        {status === 'sending' ? <Loader2 className="animate-spin" size={18} /> : <Send size={16} />}
        {status === 'sending' ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  );
}
