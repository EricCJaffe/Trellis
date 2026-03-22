import { supabase } from "@/lib/supabase";

export default async function SessionsPage() {
  const { data: sessions } = await supabase
    .from("sessions")
    .select(`
      id, name, status, session_type, date_start, date_end, location,
      moms(first_name, last_name),
      users!sessions_assigned_user_id_fkey(first_name, last_name),
      pairings(tracks(title)),
      session_notes(status, note)
    `)
    .eq("deleted_at", 0)
    .order("date_start", { ascending: false });

  const held = sessions?.filter(s => s.status === "Held") ?? [];
  const planned = sessions?.filter(s => s.status === "Planned") ?? [];
  const notHeld = sessions?.filter(s => s.status === "NotHeld") ?? [];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sessions</h1>
          <p className="text-gray-500 text-sm mt-1">{sessions?.length ?? 0} total · {held.length} held · {planned.length} upcoming · {notHeld.length} not held</p>
        </div>
        <button className="bg-[#2D1B69] text-white text-sm px-4 py-2 rounded-lg font-medium opacity-60 cursor-not-allowed">
          + Schedule Session <span className="text-xs ml-1 opacity-70">DEMO ONLY</span>
        </button>
      </div>

      {/* Upcoming */}
      {planned.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Upcoming Planned Sessions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {planned.map((s: any) => (
              <div key={s.id} className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Planned</span>
                  <span className="text-xs text-blue-500">{s.session_type?.replace(/_/g," ")}</span>
                </div>
                <div className="font-semibold text-gray-800 text-sm mt-1">{s.moms?.first_name} {s.moms?.last_name}</div>
                <div className="text-xs text-gray-500 mt-1">{s.name}</div>
                <div className="text-xs text-blue-600 mt-2 font-medium">
                  {s.date_start ? new Date(s.date_start).toLocaleDateString("en-US", { weekday:"short", month:"long", day:"numeric", year:"numeric", hour:"2-digit", minute:"2-digit" }) : "—"}
                </div>
                {s.location && <div className="text-xs text-gray-400 mt-1">📍 {s.location}</div>}
                <div className="text-xs text-gray-400 mt-1">Advocate: {s.users?.first_name} {s.users?.last_name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Session history */}
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Session History</h2>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="px-5 py-3 text-left">Date</th>
              <th className="px-5 py-3 text-left">Client</th>
              <th className="px-5 py-3 text-left">Session</th>
              <th className="px-5 py-3 text-left">Advocate</th>
              <th className="px-5 py-3 text-left">Track</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-left">Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(sessions ?? []).filter(s => s.status !== "Planned").map((s: any) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 text-gray-400 text-xs whitespace-nowrap">
                  {s.date_start ? new Date(s.date_start).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" }) : "—"}
                </td>
                <td className="px-5 py-3 font-medium text-gray-800">{s.moms?.first_name} {s.moms?.last_name}</td>
                <td className="px-5 py-3 text-gray-600 text-xs max-w-xs truncate">{s.name}</td>
                <td className="px-5 py-3 text-gray-600">{s.users?.first_name} {s.users?.last_name}</td>
                <td className="px-5 py-3 text-gray-400 text-xs">{s.pairings?.tracks?.title ?? "—"}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${s.status === "Held" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {s.status}
                  </span>
                </td>
                <td className="px-5 py-3">
                  {s.session_notes ? (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${s.session_notes.status === "approved" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                      {s.session_notes.status}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
