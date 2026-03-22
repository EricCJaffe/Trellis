import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Heart, Users, Link2, CalendarCheck } from "lucide-react";

async function getDashboardData() {
  const [
    { count: totalClients },
    { count: activeClients },
    { count: totalAdvocates },
    { count: activePairings },
    { count: sessionsThisQuarter },
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
    supabase.from("sessions").select("id, name, status, date_start, mom_id, moms(first_name, last_name), users!sessions_assigned_user_id_fkey(first_name, last_name)").eq("deleted_at", 0).order("date_start", { ascending: false }).limit(6),
    supabase.from("affiliates").select("id, name, billing_address_city, billing_address_state").eq("deleted_at", 0).eq("status", "Active"),
  ]);

  return { totalClients, activeClients, totalAdvocates, activePairings, sessionsThisQuarter, upcomingSessions, recentSessions, affiliates };
}

const sessionStatusChip: Record<string, string> = {
  Held: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  Planned: "bg-blue-50 text-blue-700 border border-blue-200",
  NotHeld: "bg-red-50 text-red-700 border border-red-200",
};

export default async function Dashboard() {
  const d = await getDashboardData();

  const kpis = [
    { label: "Total Clients", value: d.totalClients ?? 0, sub: `${d.activeClients ?? 0} active`, icon: Heart, color: "#eb462d", href: "/people" },
    { label: "Active Advocates", value: d.totalAdvocates ?? 0, sub: "Across all affiliates", icon: Users, color: "#143637", href: "/people" },
    { label: "Active Pairings", value: d.activePairings ?? 0, sub: "Advocate–client pairs", icon: Link2, color: "#f2a035", href: "/people" },
    { label: "Sessions Q1 2026", value: d.sessionsThisQuarter ?? 0, sub: `${d.upcomingSessions ?? 0} planned upcoming`, icon: CalendarCheck, color: "#10b981", href: "/sessions" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Platform Dashboard</h1>
        <p className="text-gray-500 mt-1 text-sm">Every Mother's Advocate — Case Management Overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <Link key={k.label} href={k.href} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow block">
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${k.color}18` }}>
                  <Icon className="w-5 h-5" style={{ color: k.color }} />
                </div>
                <div className="text-3xl font-bold text-gray-900">{k.value}</div>
              </div>
              <div className="text-sm font-semibold text-gray-700">{k.label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{k.sub}</div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sessions */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Recent Sessions</h2>
            <Link href="/sessions" className="text-xs font-medium hover:underline" style={{ color: "#143637" }}>View all →</Link>
          </div>
          <div className="space-y-1">
            {(d.recentSessions ?? []).map((s: any) => (
              <div key={s.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0" style={{ background: "#eb462d" }}>
                      {s.moms?.first_name?.[0]}{s.moms?.last_name?.[0]}
                    </div>
                    <Link href={`/people/${s.mom_id}`} className="text-sm font-medium text-gray-800 hover:underline">
                      {s.moms?.first_name} {s.moms?.last_name}
                    </Link>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5 ml-8">{s.name} · {s.users?.first_name} {s.users?.last_name} · {s.date_start ? new Date(s.date_start).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}</div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${sessionStatusChip[s.status] ?? "bg-gray-100 text-gray-600 border border-gray-200"}`}>{s.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Affiliates */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Active Affiliates</h2>
            <Link href="/groups" className="text-xs font-medium hover:underline" style={{ color: "#143637" }}>View all →</Link>
          </div>
          <div className="space-y-3">
            {(d.affiliates ?? []).map((a: any, i: number) => (
              <div key={a.id} className="p-3 rounded-lg border border-gray-100" style={{ background: i % 2 === 0 ? "#fefbf9" : "white" }}>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: "#143637" }}>
                    {a.name?.charAt(0)}
                  </div>
                  <div className="text-sm font-medium text-gray-800 leading-snug">{a.name}</div>
                </div>
                {(a.billing_address_city || a.billing_address_state) && (
                  <div className="text-xs text-gray-400 mt-1 ml-8">{[a.billing_address_city, a.billing_address_state].filter(Boolean).join(", ")}</div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="text-xs text-gray-400">{d.affiliates?.length ?? 0} active affiliates</div>
          </div>
        </div>
      </div>

      {/* Demo notice */}
      <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800">
        <strong>Demo environment</strong> — All data is fictional and for demonstration purposes only. Features marked <span className="bg-amber-200 px-1 rounded font-mono">demo only</span> show UI with mock responses. Moodle LMS integration, email/SMS notifications, and document uploads are not active.
      </div>
    </div>
  );
}
