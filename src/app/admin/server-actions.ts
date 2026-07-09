'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin, CONTENT_QUEUE_TABLE } from '@/lib/supabase';

export async function approveDraft(id: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false, error: 'Supabase not configured' };
  // Manual override: send a flagged draft back into the approved lane.
  const { error } = await supabase
    .from(CONTENT_QUEUE_TABLE)
    .update({ status: 'approved', updated_at: new Date().toISOString() })
    .eq('id', id);
  revalidatePath('/admin/dashboard');
  return { ok: !error, error: error?.message };
}

export async function rejectDraft(id: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false, error: 'Supabase not configured' };
  const { error } = await supabase
    .from(CONTENT_QUEUE_TABLE)
    .update({ status: 'rejected', updated_at: new Date().toISOString() })
    .eq('id', id);
  revalidatePath('/admin/dashboard');
  return { ok: !error, error: error?.message };
}

export async function saveDraftEdit(id: string, markdown: string, metaDescription: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false, error: 'Supabase not configured' };
  const { error } = await supabase
    .from(CONTENT_QUEUE_TABLE)
    .update({
      draft_markdown: markdown,
      meta_description: metaDescription,
      status: 'drafted', // re-run through the gate after an edit
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
  revalidatePath('/admin/dashboard');
  return { ok: !error, error: error?.message };
}
