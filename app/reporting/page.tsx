import { supabase } from "@/lib/supabase";
import { TrendingUp, Users, Heart, Target, Calendar, Award } from "lucide-react";

async function getReportData() {
  const [
    { data: moms },
    { data: sessions },
    { data: goals },
    { data: affiliates },
    { data: pairings },
    { data: advocates },
  ] = await Promise.all([
    supabase.from("moms").select("id,program_status,status,language_preference_c,date_entered,affiliates(name)").eq("deleted_at", 0),
    supabase.from("sessions").select("id,status,date_start,session_type,mom_id").eq("deleted_at", 0),
    supabase.from("goals").select("id,status,category,mom_id").eq("deleted_at", 0),
    supabase.from("affiliates").select("id,name").eq("deleted_at", 0).eq("status", "Active"),
    supabase.from("pairings").select("id,status,mom_id,advocate_id").eq("deleted_at", 0),
    supabase.from("users").select("id,advocate_status,advocate_capacity_for_moms").eq("deleted_at", 0).not("advocate_status", "is", null),
  ]);

  return { moms: moms ?? [], sessions: sessions ?? [], goals: goals ?? [], affiliates: affiliates ?? [], pairings: pairings ?? [], advocates: advocates ?? [] };
}

function BarChart({ data, color = "#143637" }: { data: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-2 h-36 mt-2">
      {data.map(d => (
        <div key={d.label} className="flex flex-col items-center gap-1 flex-1 min-w-0">
          <div className="text-xs font-semibold text-gray-700">{d.value}</div>
          <div
            className="w-full rounded-t-md transition-all"
            style={{ height: `${(d.value / max) * 100}px`, background: color, minHeight: d.value > 0 ? "4px" : "2px", opacity: d.value > 0 ? 1 : 0.2 }}
          />
          <div className="text-xs text-gray-500 text-center leading-tight w-full truncate" title={d.label}>{d.label}</div>
        </div>
      ))}
    </div>
  );
}

function DonutSlice({ percent, color, label }: { percent: number; color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
      <span className="text-xs text-gray-500 flex-1 truncate">{label}</span>
      <span className="text-xs font-semibold text-gray-800">{percent}%</span>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
      </div>
      <div className="text-sm font-semibold text-gray-700">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  );
}

export default async function ReportingPage() {
  const { moms, sessions, goals, affiliates, pairings, advocates } = await getReportData();

  // Program status breakdown
  const statusGroups = moms.reduce<Record<string, number>>((acc, m) => {
    const key = m.program_status ?? "not_set";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const statusLabels: Record<string, string> = {
    in_program_paired_with_advocate: "Paired",
    in_program_waiting_to_be_paired_with_advocate: "Waiting",
    prospective_mom: "Prospective",
    completed: "Completed",
    paused: "Paused",
    discharged: "Discharged",
    not_set: "Not Set",
  };

  const programStatusData = Object.entries(statusGroups).map(([k, v]) => ({
    label: statusLabels[k] ?? k,
    value: v,
  })).sort((a, b) => b.value - a.value);

  // Sessions by month
  const sessionsByMonth = sessions.reduce<Record<string, { held: number; planned: number }>>((acc, s) => {
    if (!s.date_start) return acc;
    const d = new Date(s.date_start);
    const key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    if (!acc[key]) acc[key] = { held: 0, planned: 0 };
    if (s.status === "Held") acc[key].held++;
    if (s.status === "Planned") acc[key].planned++;
    return acc;
  }, {});

  const monthKeys = Object.keys(sessionsByMonth).slice(-6);
  const sessionsTrendData = monthKeys.map(k => ({ label: k, value: sessionsByMonth[k].held }));

  // Clients by affiliate
  const clientsByAffiliate = moms.reduce<Record<string, number>>((acc, m) => {
    const name = (m.affiliates as any)?.name ?? "Unknown";
    acc[name] = (acc[name] ?? 0) + 1;
    return acc;
  }, {});

  const affiliateData = Object.entries(clientsByAffiliate)
    .map(([label, value]) => ({ label: label.replace("Every Mother's Advocate — ", "").replace("Every Mother's Advocate - ", ""), value }))
    .sort((a, b) => b.value - a.value);

  // Goals completion
  const completedGoals = goals.filter(g => g.status === "completed").length;
  const inProgressGoals = goals.filter(g => g.status === "in_progress").length;
  const pendingGoals = goals.filter(g => g.status === "pending" || g.status === "not_started").length;
  const goalsCompletionRate = goals.length > 0 ? Math.round((completedGoals / goals.length) * 100) : 0;

  // Goals by category
  const goalsByCategory = goals.reduce<Record<string, number>>((acc, g) => {
    const cat = g.category ?? "General";
    acc[cat] = (acc[cat] ?? 0) + 1;
    return acc;
  }, {});

  const goalCategoryData = Object.entries(goalsByCategory)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Advocate capacity
  const activeAdvocates = advocates.filter(a => a.advocate_status === "Active").length;
  const prospectAdvocates = advocates.filter(a => a.advocate_status === "Prospect").length;
  const activePairings = pairings.filter(p => p.status === "paired").length;
  const totalCapacity = activeAdvocates * 3;

  // Language breakdown
  const languages = moms.reduce<Record<string, number>>((acc, m) => {
    const lang = m.language_preference_c ?? "English";
    acc[lang] = (acc[lang] ?? 0) + 1;
    return acc;
  }, {});

  const langTotal = Object.values(languages).reduce((a, b) => a + b, 0);
  const langColors = ["#143637", "#eb462d", "#f2a035", "#10b981", "#6366f1"];
  const langData = Object.entries(languages).map(([label, value], i) => ({
    label,
    value,
    percent: Math.round((value / langTotal) * 100),
    color: langColors[i % langColors.length],
  }));

  const heldSessions = sessions.filter(s => s.status === "Held").length;
  const plannedSessions = sessions.filter(s => s.status === "Planned").length;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-semibold text-gray-900">Reporting</h1>
        <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg font-medium">
          ✦ Demo Data — Q1 2026
        </div>
      </div>
      <p className="text-gray-500 text-sm mb-8">Program-wide metrics and outcomes for Every Mother's Advocate</p>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard icon={Heart} label="Total Clients" value={moms.length} sub={`${moms.filter(m => m.status === "active").length} active in program`} color="#eb462d" />
        <StatCard icon={Users} label="Active Advocates" value={activeAdvocates} sub={`${prospectAdvocates} in onboarding`} color="#143637" />
        <StatCard icon={Calendar} label="Sessions Held" value={heldSessions} sub={`${plannedSessions} planned upcoming`} color="#f2a035" />
        <StatCard icon={Target} label="Goals Completion" value={`${goalsCompletionRate}%`} sub={`${completedGoals} of ${goals.length} goals met`} color="#10b981" />
      </div>

      {/* Row 1: Program Status + Sessions Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Program Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4" style={{ color: "#143637" }} />
            <h2 className="font-semibold text-gray-800 text-sm">Client Program Status</h2>
          </div>
          <p className="text-xs text-gray-400 mb-2">Distribution across all program stages</p>
          <BarChart data={programStatusData} color="#143637" />
        </div>

        {/* Sessions Trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4" style={{ color: "#eb462d" }} />
            <h2 className="font-semibold text-gray-800 text-sm">Sessions Held by Month</h2>
          </div>
          <p className="text-xs text-gray-400 mb-2">Completed advocacy sessions over time</p>
          {sessionsTrendData.length > 0 ? (
            <BarChart data={sessionsTrendData} color="#eb462d" />
          ) : (
            <div className="h-36 flex items-center justify-center text-gray-300 text-sm">No session data</div>
          )}
        </div>
      </div>

      {/* Row 2: Affiliates + Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Clients by Affiliate */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-4 h-4" style={{ color: "#f2a035" }} />
            <h2 className="font-semibold text-gray-800 text-sm">Clients by Affiliate</h2>
          </div>
          <p className="text-xs text-gray-400 mb-2">Active clients enrolled per affiliate organization</p>
          <BarChart data={affiliateData} color="#f2a035" />
        </div>

        {/* Language Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 text-sm mb-1">Language Preference</h2>
          <p className="text-xs text-gray-400 mb-4">Client language distribution</p>
          <div className="space-y-2.5">
            {langData.map(l => (
              <div key={l.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">{l.label}</span>
                  <span className="font-semibold text-gray-800">{l.value}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="h-2 rounded-full" style={{ width: `${l.percent}%`, background: l.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Goals + Advocate Capacity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Goals by Category */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4" style={{ color: "#10b981" }} />
            <h2 className="font-semibold text-gray-800 text-sm">Goals by Category</h2>
          </div>
          <p className="text-xs text-gray-400 mb-2">Top goal areas across all clients</p>
          <BarChart data={goalCategoryData} color="#10b981" />
        </div>

        {/* Goals Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 text-sm mb-1">Goals Progress</h2>
          <p className="text-xs text-gray-400 mb-4">Completion status across all client goals</p>
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-28 h-28">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#143637" strokeWidth="12"
                  strokeDasharray={`${goalsCompletionRate * 2.51} 251`}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-xl font-bold text-gray-900">{goalsCompletionRate}%</div>
                <div className="text-xs text-gray-400">Complete</div>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Completed</span>
              <span className="font-semibold">{completedGoals}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-400 inline-block" /> In Progress</span>
              <span className="font-semibold">{inProgressGoals}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-gray-200 inline-block" /> Pending</span>
              <span className="font-semibold">{pendingGoals}</span>
            </div>
          </div>
        </div>

        {/* Advocate Capacity */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4" style={{ color: "#143637" }} />
            <h2 className="font-semibold text-gray-800 text-sm">Advocate Capacity</h2>
          </div>
          <p className="text-xs text-gray-400 mb-4">Active advocate caseload utilization</p>
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Caseload Filled</span>
              <span className="font-semibold">{activePairings} / {totalCapacity} slots</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div
                className="h-3 rounded-full transition-all"
                style={{ width: `${totalCapacity > 0 ? Math.min((activePairings / totalCapacity) * 100, 100) : 0}%`, background: "#143637" }}
              />
            </div>
            <div className="text-xs text-gray-400 mt-1">{totalCapacity > 0 ? Math.round((activePairings / totalCapacity) * 100) : 0}% capacity utilized</div>
          </div>
          <div className="space-y-3 pt-3 border-t border-gray-100">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Active Advocates</span>
              <span className="font-semibold text-gray-800">{activeAdvocates}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">In Onboarding</span>
              <span className="font-semibold text-amber-600">{prospectAdvocates}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Active Pairings</span>
              <span className="font-semibold text-gray-800">{activePairings}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Waiting for Match</span>
              <span className="font-semibold" style={{ color: "#eb462d" }}>
                {moms.filter(m => m.program_status === "in_program_waiting_to_be_paired_with_advocate").length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Demo notice */}
      <div className="mt-8 border border-amber-200 bg-amber-50 rounded-xl p-4 text-center">
        <p className="text-xs text-amber-700">
          <strong>Demo Environment</strong> — All data is synthetic. Production reporting includes export to CSV/PDF,
          date range filters, affiliate drill-downs, and Moodle training completion tracking.
        </p>
      </div>
    </div>
  );
}
