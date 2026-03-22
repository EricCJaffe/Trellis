import { supabase } from "@/lib/supabase";
import { Users2, MapPin, Phone, Mail } from "lucide-react";

export default async function GroupsPage() {
  const { data: groups } = await supabase
    .from("advocacy_groups")
    .select(`
      id, name, description, status, meeting_day, meeting_time, location,
      affiliates(name),
      users!advocacy_groups_coordinator_id_fkey(first_name, last_name, email)
    `)
    .eq("deleted_at", 0)
    .order("name");

  const { data: affiliates } = await supabase
    .from("affiliates")
    .select("id, name, billing_address_city, billing_address_state, phone_office, website, status")
    .eq("deleted_at", 0)
    .eq("status", "Active")
    .order("name");

  const statusChip = (s: string) =>
    s === "Active" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
    s === "Inactive" ? "bg-gray-100 text-gray-400 border border-gray-200" :
    "bg-amber-50 text-amber-700 border border-amber-200";

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-2">
        <h1 className="text-2xl font-semibold text-gray-900">Groups</h1>
        <p className="text-gray-500 text-sm mt-1">Advocacy groups and affiliate organizations in the network</p>
      </div>

      {/* Affiliates Section */}
      <div className="mt-8 mb-2">
        <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: "#eb462d" }} />
          Affiliate Organizations
        </h2>
        <p className="text-xs text-gray-400 mb-4">Partner organizations delivering the EMA program</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        {(affiliates ?? []).map((a: any) => (
          <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ background: "#143637" }}>
                {a.name?.charAt(0) ?? "A"}
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusChip(a.status)}`}>{a.status}</span>
            </div>
            <h3 className="font-semibold text-gray-900 text-sm mb-1 leading-snug">{a.name}</h3>
            {(a.billing_address_city || a.billing_address_state) && (
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
                <MapPin className="w-3.5 h-3.5" />
                {[a.billing_address_city, a.billing_address_state].filter(Boolean).join(", ")}
              </div>
            )}
            {a.phone_office && (
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Phone className="w-3.5 h-3.5" />
                {a.phone_office}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Advocacy Groups Section */}
      {(groups ?? []).length > 0 && (
        <>
          <div className="mb-4">
            <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: "#143637" }} />
              Advocacy Groups
              <span className="text-xs text-gray-400 font-normal ml-1">{groups?.length} groups</span>
            </h2>
            <p className="text-xs text-gray-400 mb-4">Ongoing group programs coordinated by affiliates</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3 text-left">Group Name</th>
                  <th className="px-5 py-3 text-left">Affiliate</th>
                  <th className="px-5 py-3 text-left">Coordinator</th>
                  <th className="px-5 py-3 text-left">Schedule</th>
                  <th className="px-5 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(groups ?? []).map((g: any) => (
                  <tr key={g.id} className="hover:bg-[#fefbf9] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: "#143637" }}>
                          <Users2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{g.name}</div>
                          {g.description && <div className="text-xs text-gray-400 truncate max-w-xs">{g.description}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">{g.affiliates?.name ?? "—"}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">
                      {g.users ? `${g.users.first_name} ${g.users.last_name}` : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">
                      {g.meeting_day && g.meeting_time ? `${g.meeting_day} at ${g.meeting_time}` : g.meeting_day ?? "—"}
                      {g.location && <div className="text-gray-400">{g.location}</div>}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusChip(g.status)}`}>{g.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {(groups ?? []).length === 0 && (
        <div className="bg-white rounded-xl border border-dashed border-gray-200 p-10 text-center">
          <Users2 className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <div className="text-sm font-medium text-gray-500">No advocacy groups set up yet</div>
          <div className="text-xs text-gray-400 mt-1">Groups will appear here when configured by coordinators</div>
        </div>
      )}
    </div>
  );
}
