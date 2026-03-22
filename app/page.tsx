import { supabase } from "@/lib/supabase";

async function getDashboardData() {
  const [
    { count: totalClients },
    { count: activeClients },
    { count: totalAdvocates },
    { count: activePairings },
    { count: sessionsThisMonth },
    { count: upcomingSessions },
    { data: recentSessions },
    { data: affiliates },
  ] = await Promise.all([
    supabase.from("moms").select("*", { count: "exact", head: true }).eq("deleted_at", 0),
    supabase.from("moms").select("*", { count: "exact", head: true }).eq("deleted_at", 0).eq("status", "active"),
    supabase.from("users").select("*", { count: "exact", head: true }).eq("deleted_at", 0).eq("advocate_status", "Active"),
    supabase.from("pairings").select("*", { count: "exact", head: true }).eq("deleted_at", 0).eq("status", "paired"),
    supabase.from("sessions").select("*", { count: "exact", head: true }).eq("deleted_at", 0).eq("status", "Held").gte("date_start", "2026-01-01").lte("date_start", "2026-03-31"),
    supabase.from("sessions").select("*", { count: "exact", head: true }).eq("deleted_at", 0).eq("status", "Planned"),
    supabase.from("sessions").select("id, name, status, date_start, moms(first_name, last_name), users!sessions_assigned_user_id_fkey(first_name, last_name)").eq("deleted_at", 0).order("date_start", { ascending: false }).limit(6),
    supabase.from("affiliates").select("id, name, billing_address_city, billing_address_state").eq("deleted_at", 0).eq("status", "Active"),
  ]);

  return { totalClients, activeClients, totalAdvocates, activePairings, sessionsThisMonth, upcomingSessions, recentSessions, affiliates };
}

const statusColor: Record<string, string> = {
  Held: "bg-green-100 text-green-800",
  Planned: "bg-blue-100 text-blue-800",
  NotHeld: "bg-red-100 text-red-800",
};

export default async function Dashboard() {
  const d = await getDashboardData();

  const kpis = [
    { label: "Total Clients", value: d.totalClients ?? 0, sub: `${d.activeClients ?? 0} active`, color: "border-purple-500", icon: "👩" },
    { label: "Active Advocates", value: d.totalAdvocates ?? 0, sub: "Across all affiliates", color: "border-teal-500", icon: "🤝" },
    { label: "Active Pairings", value: d.activePairings ?? 0, sub: "Advocate–client pairs", color: "border-amber-500", icon: "💛" },
    { label: "Sessions This Quarter", value: d.sessionsThisMonth ?? 0, sub: `${d.upcomingSessions ?? 0} upcoming`, color: "border-indigo-500", icon: "📅" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Platform Dashboard</h1>
        <p className="text-gray-500 mt-1 text-sm">Every Mother's Advocate — Case Management Overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {kpis.map((k) => (
          <div key={k.label} className={`bg-white rounded-xl shadow-sm border-l-4 ${k.color} p-5`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{k.icon}</span>
              <span className="text-3xl font-bold text-gray-900">{k.value}</span>
            </div>
            <div className="text-sm font-semibold text-gray-700">{k.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sessions */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Recent Sessions</h2>
          <div className="space-y-3">
            {(d.recentSessions ?? []).map((s: any) => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <div className="text-sm font-medium text-gray-800">{s.moms?.first_name} {s.moms?.last_name}</div>
                  <div className="text-xs text-gray-400">{s.name} · {s.users?.first_name} {s.users?.last_name}</div>
                  <div className="text-xs text-gray-400">{s.date_start ? new Date(s.date_start).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}</div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor[s.status] ?? "bg-gray-100 text-gray-600"}`}>{s.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Affiliates */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Active Affiliates</h2>
          <div className="space-y-3">
            {(d.affiliates ?? []).map((a: any) => (
              <div key={a.id} className="p-3 bg-purple-50 rounded-lg">
                <div className="text-sm font-medium text-gray-800">{a.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">{a.billing_address_city}, {a.billing_address_state}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="text-xs text-gray-400">3 affiliates · Northeast Florida region</div>
          </div>
        </div>
      </div>

      {/* Demo notice */}
      <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <strong>Demo environment</strong> — All data is fictional. Features marked <span className="bg-amber-200 px-1 rounded text-xs font-mono">DEMO ONLY</span> show UI with mock responses. Moodle LMS integration, email/SMS notifications, and document uploads are not active in this environment.
      </div>
    </div>
  );
}
