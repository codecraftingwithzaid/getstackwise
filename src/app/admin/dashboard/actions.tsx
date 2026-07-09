'use client';

import { useState, useTransition } from 'react';
import { approveDraft, rejectDraft } from '../server-actions';

export function QueueActions({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex shrink-0 gap-2">
      <button
        disabled={pending}
        onClick={() => startTransition(() => void approveDraft(id))}
        className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
      >
        Approve
      </button>
      <button
        disabled={pending}
        onClick={() => startTransition(() => void rejectDraft(id))}
        className="rounded-md border px-3 py-1.5 text-xs font-medium disabled:opacity-50"
      >
        Reject
      </button>
    </div>
  );
}

export function PipelineTrigger() {
  const [state, setState] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  async function trigger() {
    setState('running');
    setMsg('');
    try {
      const res = await fetch('/api/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stages: ['trends', 'draft', 'gate'] }),
      });
      const json = await res.json();
      if (res.ok) {
        setState('done');
        setMsg(json.message || 'Pipeline run started.');
      } else {
        setState('error');
        setMsg(json.error || 'Failed to trigger pipeline.');
      }
    } catch {
      setState('error');
      setMsg('Network error.');
    }
  }

  return (
    <div className="text-right">
      <button
        onClick={trigger}
        disabled={state === 'running'}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        {state === 'running' ? 'Running…' : 'Force-run pipeline'}
      </button>
      {msg && (
        <p className={`mt-1 text-xs ${state === 'error' ? 'text-red-600' : 'text-green-600'}`}>
          {msg}
        </p>
      )}
    </div>
  );
}
