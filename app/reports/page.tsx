import { supabase } from "@/lib/supabase";

export default async function ReportsPage() {
  const [
    { data: programStatusData },
    { data: affiliateData },
    { data: sessionsByMonth },
    { data: goalData },
  ] = await Promise.all([
    supabase.from("moms").select("program_status").eq("deleted_at", 0),
    supabase.from("moms").select("affiliate_id, affiliates(name)").eq("deleted_at", 0),
    supabase.from("sessions").select("date_start, status").eq("deleted_at", 0).eq("status","Held"),
    supabase.from("goals").select("done_date").eq("deleted_at", 0),
  ]);

  // Program status breakdown
  const statusCounts: Record<string, number> = {};
  (programStatusData ?? []).forEach((r: any) => {
    const k = r.program_status ?? "not_set";
    statusCounts[k] = (statusCounts[k] ?? 0) + 1;
  });

  const statusLabels: Record<string, string> = {
    in_program_paired_with_advocate: "Paired",
    in_program_waiting_to_be_paired_with_advocate: "Waiting for Advocate",
    prospective_mom: "Prospective",
    completed: "Completed",
    paused: "Paused",
    discharged: "Discharged",
    not_set: "Not Set",
  };

  // Clients per affiliate
  const affCounts: Record<string, {name: string; count: number}> = {};
  (affiliateData ?? []).forEach((r: any) => {
    const id = r.affiliate_id ?? "unknown";
    const name = r.affiliates?.name ?? "Unknown";
    if (!affCounts[id]) affCounts[id] = { name, count: 0 };
    affCounts[id].count++;
  });

  // Goals completion
  const totalGoals = goalData?.length ?? 0;
  const completedGoals = goalData?.filter((g: any) => g.done_date).length ?? 0;
  const goalPct = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  const colors = ["bg-purple-500","bg-teal-500","bg-amber-500","bg-blue-500","bg-green-500","bg-red-400","bg-indigo-500"];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Platform-wide data summary — demo data only</p>
      </div>

      {/* Missing dashboards notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
        <strong>Reporting roadmap note:</strong> The full reporting suite includes 52 required reports across 6 dashboard groups. 7 of 10 dashboard groups are currently built in the production system. Three dashboards — Demographics, Client Engagement Summary, and Affiliate Comparisons — are in the 60-day build queue. PowerBI integration is also pending.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Program Status Breakdown */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-5">Client Program Status</h2>
          <div className="space-y-3">
            {Object.entries(statusCounts).sort((a,b) => b[1]-a[1]).map(([k, v], i) => {
              const total = programStatusData?.length ?? 1;
              const pct = Math.round((v / total) * 100);
              return (
                <div key={k}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{statusLabels[k] ?? k}</span>
                    <span className="font-semibold text-gray-900">{v} <span className="text-gray-400 font-normal text-xs">({pct}%)</span></span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={`h-2 rounded-full ${colors[i % colors.length]}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Clients by Affiliate */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-5">Clients by Affiliate</h2>
          <div className="space-y-4">
            {Object.values(affCounts).sort((a,b) => b.count-a.count).map((a, i) => (
              <div key={a.name} className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${colors[i % colors.length]}`} />
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{a.name}</span>
                    <span className="font-semibold">{a.count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={`h-2 rounded-full ${colors[i % colors.length]}`} style={{ width: `${Math.round((a.count / (affiliateData?.length ?? 1)) * 100)}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Goals + Sessions stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-5 text-center">
          <div className="text-4xl font-bold text-purple-600 mb-1">{totalGoals}</div>
          <div className="text-sm font-medium text-gray-700">Total Goals Set</div>
          <div className="text-xs text-gray-400 mt-1">{completedGoals} completed ({goalPct}%)</div>
          <div className="mt-3 w-full bg-gray-100 rounded-full h-2">
            <div className="h-2 rounded-full bg-purple-500" style={{ width: `${goalPct}%` }} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 text-center">
          <div className="text-4xl font-bold text-teal-600 mb-1">{sessionsByMonth?.length ?? 0}</div>
          <div className="text-sm font-medium text-gray-700">Sessions Held</div>
          <div className="text-xs text-gray-400 mt-1">All time in demo dataset</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 text-center">
          <div className="text-4xl font-bold text-amber-600 mb-1">10</div>
          <div className="text-sm font-medium text-gray-700">Active Pairings</div>
          <div className="text-xs text-gray-400 mt-1">8 in-program · 2 completed</div>
        </div>
      </div>

      {/* Placeholder sections for missing dashboards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { title: "Demographics Dashboard", desc: "Race, age, language, family size breakdowns across the client population.", status: "In Build Queue" },
          { title: "Client Engagement Summary", desc: "Connection rates, response times, session frequency, and engagement scores.", status: "In Build Queue" },
          { title: "Affiliate Comparisons", desc: "Side-by-side performance metrics across affiliate locations.", status: "In Build Queue" },
        ].map(d => (
          <div key={d.title} className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">{d.status}</span>
            </div>
            <div className="font-semibold text-gray-700 text-sm mb-1">{d.title}</div>
            <div className="text-xs text-gray-400">{d.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
