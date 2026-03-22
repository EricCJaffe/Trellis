import { supabase } from "@/lib/supabase";
import Link from "next/link";

const programStatusLabel: Record<string, string> = {
  in_program_paired_with_advocate: "In Program — Paired",
  in_program_waiting_to_be_paired_with_advocate: "Waiting for Advocate",
  in_program_group_classes: "Group Classes",
  prospective_mom: "Prospective",
  completed: "Completed",
  paused: "Paused",
  discharged: "Discharged",
  not_set: "Not Set",
};

const statusColor: Record<string, string> = {
  in_program_paired_with_advocate: "bg-green-100 text-green-800",
  in_program_waiting_to_be_paired_with_advocate: "bg-amber-100 text-amber-800",
  prospective_mom: "bg-blue-100 text-blue-800",
  completed: "bg-gray-100 text-gray-600",
  paused: "bg-orange-100 text-orange-700",
  discharged: "bg-red-100 text-red-700",
  not_set: "bg-gray-100 text-gray-500",
};

export default async function ClientsPage() {
  const { data: clients } = await supabase
    .from("moms")
    .select(`
      id, first_name, last_name, email1, phone_other,
      status, program_status, primary_address_city, primary_address_state,
      language_preference_c, date_entered,
      affiliates(name),
      users!moms_assigned_user_id_fkey(first_name, last_name)
    `)
    .eq("deleted_at", 0)
    .order("created_at", { ascending: false });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-500 text-sm mt-1">{clients?.length ?? 0} total clients across all affiliates</p>
        </div>
        <button className="bg-[#143637] text-white text-sm px-4 py-2 rounded-lg font-medium opacity-60 cursor-not-allowed" title="Not active in demo">
          + New Client <span className="text-xs ml-1 opacity-70">DEMO ONLY</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="px-5 py-3 text-left">Client</th>
              <th className="px-5 py-3 text-left">Affiliate</th>
              <th className="px-5 py-3 text-left">Coordinator</th>
              <th className="px-5 py-3 text-left">Program Status</th>
              <th className="px-5 py-3 text-left">Language</th>
              <th className="px-5 py-3 text-left">Enrolled</th>
              <th className="px-5 py-3 text-left"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(clients ?? []).map((c: any) => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="font-medium text-gray-900">{c.first_name} {c.last_name}</div>
                  <div className="text-gray-400 text-xs">{c.email1 ?? "No email"}</div>
                </td>
                <td className="px-5 py-3.5 text-gray-600">{c.affiliates?.name ?? "—"}</td>
                <td className="px-5 py-3.5 text-gray-600">{c.users ? `${c.users.first_name} ${c.users.last_name}` : "—"}</td>
                <td className="px-5 py-3.5">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor[c.program_status] ?? "bg-gray-100 text-gray-500"}`}>
                    {programStatusLabel[c.program_status] ?? c.program_status}
                  </span>
                </td>
                <td className="px-5 py-3.5 capitalize text-gray-600">{c.language_preference_c ?? "English"}</td>
                <td className="px-5 py-3.5 text-gray-400 text-xs">{c.date_entered ? new Date(c.date_entered).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "—"}</td>
                <td className="px-5 py-3.5">
                  <Link href={`/clients/${c.id}`} className="text-purple-600 hover:text-purple-800 text-xs font-medium">View →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
