"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Search, Plus, Users, User, UserCheck } from "lucide-react";

type Tab = "moms" | "advocates" | "coordinators";

const programStatusLabel: Record<string, string> = {
  in_program_paired_with_advocate: "Paired",
  in_program_waiting_to_be_paired_with_advocate: "Waiting",
  prospective_mom: "Prospective",
  completed: "Completed",
  paused: "Paused",
  discharged: "Discharged",
  not_set: "Not Set",
};

const statusChip = (s: string) => {
  const map: Record<string, string> = {
    in_program_paired_with_advocate: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    in_program_waiting_to_be_paired_with_advocate: "bg-amber-50 text-amber-700 border border-amber-200",
    prospective_mom: "bg-blue-50 text-blue-700 border border-blue-200",
    completed: "bg-gray-100 text-gray-500 border border-gray-200",
    paused: "bg-orange-50 text-orange-700 border border-orange-200",
  };
  return map[s] ?? "bg-gray-100 text-gray-500 border border-gray-200";
};

export default function PeoplePage() {
  const [tab, setTab] = useState<Tab>("moms");
  const [search, setSearch] = useState("");
  const [moms, setMoms] = useState<any[]>([]);
  const [advocates, setAdvocates] = useState<any[]>([]);
  const [coordinators, setCoordinators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      supabase.from("moms").select(`id,first_name,last_name,email1,phone_other,status,program_status,primary_address_city,primary_address_state,language_preference_c,date_entered,affiliates(name),users!moms_assigned_user_id_fkey(first_name,last_name)`).eq("deleted_at",0).order("first_name"),
      supabase.from("users").select(`id,first_name,last_name,email,phone_mobile,status,advocate_status,advocate_sub_status,advocate_capacity_for_moms,affiliates(name),user_roles(roles(key))`).eq("deleted_at",0).not("advocate_status","is",null).order("first_name"),
      supabase.from("users").select(`id,first_name,last_name,email,phone_mobile,status,affiliates(name),user_roles(roles(key))`).eq("deleted_at",0).order("first_name"),
    ]).then(([m, a, u]) => {
      setMoms(m.data ?? []);
      setAdvocates(a.data ?? []);
      setCoordinators((u.data ?? []).filter((u: any) => u.user_roles?.some((r: any) => r.roles?.key === "coordinator")));
      setLoading(false);
    });
  }, []);

  const q = search.toLowerCase();
  const filteredMoms = moms.filter(m => `${m.first_name} ${m.last_name} ${m.affiliates?.name}`.toLowerCase().includes(q));
  const filteredAdvocates = advocates.filter(a => `${a.first_name} ${a.last_name} ${a.affiliates?.name}`.toLowerCase().includes(q));
  const filteredCoords = coordinators.filter(c => `${c.first_name} ${c.last_name} ${c.affiliates?.name}`.toLowerCase().includes(q));

  const tabs: {key: Tab; label: string; count: number; icon: any}[] = [
    { key: "moms", label: "Moms", count: moms.length, icon: User },
    { key: "advocates", label: "Advocates", count: advocates.length, icon: UserCheck },
    { key: "coordinators", label: "Coordinators", count: coordinators.length, icon: Users },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-semibold text-gray-900">People</h1>
        <button className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg text-white font-medium opacity-50 cursor-not-allowed" style={{background:"#143637"}}>
          <Plus className="w-4 h-4" /> Add New <span className="text-xs opacity-70 ml-1">demo only</span>
        </button>
      </div>
      <p className="text-gray-500 text-sm mb-6">Find your Supervisors, Advocates, Coordinators, and Moms all in one place.</p>

      {/* Tabs + Search */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab===t.key ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
              <t.icon className="w-4 h-4" />{t.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab===t.key ? "text-white" : "bg-gray-200 text-gray-500"}`}
                style={tab===t.key ? {background:"#eb462d"} : {}}>{t.count}</span>
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…"
            className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white w-56 focus:outline-none focus:ring-2 focus:ring-teal-200" />
        </div>
      </div>

      {/* Moms table */}
      {tab === "moms" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? <div className="p-8 text-center text-gray-400 text-sm">Loading…</div> : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3 text-left">Name</th>
                  <th className="px-5 py-3 text-left">Affiliate</th>
                  <th className="px-5 py-3 text-left">Coordinator</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Language</th>
                  <th className="px-5 py-3 text-left">Enrolled</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredMoms.map((m: any) => (
                  <tr key={m.id} className="hover:bg-[#fefbf9] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0" style={{background:"#eb462d"}}>
                          {m.first_name?.[0]}{m.last_name?.[0]}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{m.first_name} {m.last_name}</div>
                          <div className="text-gray-400 text-xs">{m.email1 ?? m.phone_other ?? "—"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 text-xs">{m.affiliates?.name ?? "—"}</td>
                    <td className="px-5 py-3.5 text-gray-600 text-xs">{m.users ? `${m.users.first_name} ${m.users.last_name}` : "—"}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusChip(m.program_status)}`}>
                        {programStatusLabel[m.program_status] ?? m.program_status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 capitalize text-gray-500 text-xs">{m.language_preference_c ?? "English"}</td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">{m.date_entered ? new Date(m.date_entered).toLocaleDateString("en-US",{month:"short",year:"numeric"}) : "—"}</td>
                    <td className="px-5 py-3.5">
                      <Link href={`/people/${m.id}`} className="text-xs font-medium hover:underline" style={{color:"#143637"}}>View →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Advocates cards */}
      {tab === "advocates" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? <div className="col-span-3 p-8 text-center text-gray-400 text-sm">Loading…</div> :
            filteredAdvocates.map((a: any) => {
              const statusColor = a.advocate_status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : a.advocate_status === "Prospect" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-gray-100 text-gray-500 border-gray-200";
              return (
                <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm" style={{background:"#143637"}}>
                        {a.first_name?.[0]}{a.last_name?.[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">{a.first_name} {a.last_name}</div>
                        <div className="text-xs text-gray-400">{a.affiliates?.name}</div>
                      </div>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${statusColor}`}>{a.advocate_status}</span>
                  </div>
                  <div className="text-xs text-gray-500 mb-1">{a.email}</div>
                  {a.phone_mobile && <div className="text-xs text-gray-400 mb-3">{a.phone_mobile}</div>}
                  {a.advocate_status === "Active" && (
                    <div className="pt-3 border-t border-gray-100">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Capacity</span><span className="font-medium">{a.advocate_capacity_for_moms ?? 3} max clients</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full" style={{width:"60%",background:"#143637"}} />
                      </div>
                    </div>
                  )}
                  {a.advocate_status === "Prospect" && (
                    <div className="pt-3 border-t border-gray-100 text-xs text-amber-600 bg-amber-50 px-2 py-1.5 rounded-md">
                      ⏳ Onboarding — Moodle training required
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}

      {/* Coordinators table */}
      {tab === "coordinators" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? <div className="p-8 text-center text-gray-400 text-sm">Loading…</div> : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide border-b border-gray-100">
                <tr><th className="px-5 py-3 text-left">Name</th><th className="px-5 py-3 text-left">Affiliate</th><th className="px-5 py-3 text-left">Email</th><th className="px-5 py-3 text-left">Phone</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredCoords.map((c: any) => (
                  <tr key={c.id} className="hover:bg-[#fefbf9]">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold" style={{background:"#143637"}}>
                          {c.first_name?.[0]}{c.last_name?.[0]}
                        </div>
                        <span className="font-medium text-gray-900">{c.first_name} {c.last_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs">{c.affiliates?.name ?? "—"}</td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs">{c.email}</td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">{c.phone_mobile ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
