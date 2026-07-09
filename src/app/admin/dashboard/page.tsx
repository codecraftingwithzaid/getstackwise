import { getSupabaseAdmin, CONTENT_QUEUE_TABLE, POST_PERFORMANCE_TABLE } from '@/lib/supabase';
import type { QueueItem } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { QueueActions, PipelineTrigger } from './actions';

export const dynamic = 'force-dynamic'; // always fresh; never cached/indexed

const STATUS_ORDER = ['flagged', 'drafted', 'approved', 'queued', 'published', 'rejected'] as const;

async function getData() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { queue: [] as QueueItem[], perf: [], configured: false };

  const [{ data: queue }, { data: perf }] = await Promise.all([
    supabase
      .from(CONTENT_QUEUE_TABLE)
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(100),
    supabase
      .from(POST_PERFORMANCE_TABLE)
      .select('slug, clicks, impressions, avg_position, recorded_at')
      .order('recorded_at', { ascending: false })
      .limit(25),
  ]);

  return { queue: (queue ?? []) as QueueItem[], perf: perf ?? [], configured: true };
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  );
}

export default async function AdminDashboard() {
  const { queue, perf, configured } = await getData();

  const counts = STATUS_ORDER.reduce<Record<string, number>>((acc, s) => {
    acc[s] = queue.filter((q) => q.status === s).length;
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Content Pipeline</h1>
        <PipelineTrigger />
      </div>

      {!configured && (
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-800">
          Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and
          SUPABASE_SERVICE_ROLE_KEY to see live queue data.
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
        {STATUS_ORDER.map((s) => (
          <StatCard key={s} label={s} value={counts[s] ?? 0} />
        ))}
      </div>

      {/* Flagged drafts needing manual review */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">Needs review (flagged)</h2>
        <div className="space-y-3">
          {queue.filter((q) => q.status === 'flagged').length === 0 && (
            <p className="text-sm text-muted-foreground">Nothing flagged. 🎉</p>
          )}
          {queue
            .filter((q) => q.status === 'flagged')
            .map((item) => (
              <div key={item.id} className="rounded-lg border bg-card p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-medium">{item.title || item.topic}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {item.category} · {item.source} · score {Number(item.score).toFixed(2)}
                    </div>
                    {item.flags && item.flags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {item.flags.map((f) => (
                          <span
                            key={f}
                            className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-700"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <QueueActions id={item.id} />
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* Recent performance */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">Recent Search Console data</h2>
        {perf.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No performance data yet. Run the monitoring stage.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="p-3">Slug</th>
                  <th className="p-3">Clicks</th>
                  <th className="p-3">Impressions</th>
                  <th className="p-3">Avg position</th>
                  <th className="p-3">Recorded</th>
                </tr>
              </thead>
              <tbody>
                {perf.map((p, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-3 font-mono text-xs">{p.slug}</td>
                    <td className="p-3">{p.clicks}</td>
                    <td className="p-3">{p.impressions}</td>
                    <td className="p-3">{p.avg_position ? Number(p.avg_position).toFixed(1) : '—'}</td>
                    <td className="p-3 text-muted-foreground">
                      {formatDate(p.recorded_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Full queue */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">Full queue</h2>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3">Topic / Title</th>
                <th className="p-3">Category</th>
                <th className="p-3">Status</th>
                <th className="p-3">Updated</th>
              </tr>
            </thead>
            <tbody>
              {queue.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="p-3">{item.title || item.topic}</td>
                  <td className="p-3">{item.category}</td>
                  <td className="p-3">
                    <span className="rounded bg-muted px-2 py-0.5 text-xs">{item.status}</span>
                  </td>
                  <td className="p-3 text-muted-foreground">{formatDate(item.updated_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
