import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";

const programStatusLabel: Record<string, string> = {
  in_program_paired_with_advocate: "In Program — Paired",
  in_program_waiting_to_be_paired_with_advocate: "Waiting for Advocate",
  prospective_mom: "Prospective",
  completed: "Completed",
  paused: "Paused",
  discharged: "Discharged",
  not_set: "Not Set",
};

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const [{ data: client }, { data: pairings }, { data: sessions }, { data: goals }] = await Promise.all([
    supabase.from("moms").select(`*, affiliates(name), users!moms_assigned_user_id_fkey(first_name, last_name)`).eq("id", params.id).eq("deleted_at", 0).single(),
    supabase.from("pairings").select(`*, users!pairings_advocate_user_id_fkey(first_name, last_name), tracks(title)`).eq("mom_id", params.id).eq("deleted_at", 0),
    supabase.from("sessions").select(`*, users!sessions_assigned_user_id_fkey(first_name, last_name), session_notes(note, status)`).eq("mom_id", params.id).eq("deleted_at", 0).order("date_start", { ascending: false }),
    supabase.from("goals").select("*").eq("mom_id", params.id).eq("deleted_at", 0).order("created_at"),
  ]);

  if (!client) notFound();

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <Link href="/clients" className="text-purple-600 text-sm hover:underline">← All Clients</Link>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{client.first_name} {client.last_name}</h1>
            <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
              <span>{client.affiliates?.name}</span>
              {client.primary_address_city && <span>· {client.primary_address_city}, {client.primary_address_state}</span>}
              {client.language_preference_c && <span className="capitalize">· {client.language_preference_c}</span>}
            </div>
          </div>
          <span className="bg-purple-100 text-purple-800 text-xs px-3 py-1.5 rounded-full font-medium">
            {programStatusLabel[client.program_status] ?? client.program_status}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-5 border-t border-gray-100">
          <div><div className="text-xs text-gray-400 uppercase tracking-wide">Phone</div><div className="text-sm font-medium mt-1">{client.phone_other ?? "—"}</div></div>
          <div><div className="text-xs text-gray-400 uppercase tracking-wide">Email</div><div className="text-sm font-medium mt-1 truncate">{client.email1 ?? "—"}</div></div>
          <div><div className="text-xs text-gray-400 uppercase tracking-wide">Coordinator</div><div className="text-sm font-medium mt-1">{client.users ? `${client.users.first_name} ${client.users.last_name}` : "—"}</div></div>
          <div><div className="text-xs text-gray-400 uppercase tracking-wide">Date Enrolled</div><div className="text-sm font-medium mt-1">{client.date_entered ? new Date(client.date_entered).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—"}</div></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Pairing */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Advocate Pairing</h2>
          {pairings && pairings.length > 0 ? (
            <div className="space-y-3">
              {pairings.map((p: any) => (
                <div key={p.id} className="p-4 bg-purple-50 rounded-lg">
                  <div className="font-medium text-gray-800">{p.users ? `${p.users.first_name} ${p.users.last_name}` : "Unassigned"}</div>
                  <div className="text-sm text-gray-500 mt-1">{p.tracks?.title ?? "—"}</div>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs bg-white border border-purple-200 text-purple-700 px-2 py-0.5 rounded-full capitalize">{p.status?.replace(/_/g," ")}</span>
                    {p.track_status && <span className="text-xs bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full capitalize">{p.track_status?.replace(/_/g," ")}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-400 italic">No active pairing</div>
          )}
        </div>

        {/* Goals */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Goals ({goals?.length ?? 0})</h2>
          {goals && goals.length > 0 ? (
            <div className="space-y-2">
              {goals.map((g: any) => (
                <div key={g.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
                  <div className={`mt-0.5 w-4 h-4 rounded-full flex-shrink-0 border-2 flex items-center justify-center ${g.done_date ? "bg-green-500 border-green-500" : "border-gray-300"}`}>
                    {g.done_date && <span className="text-white text-xs">✓</span>}
                  </div>
                  <div>
                    <div className={`text-sm font-medium ${g.done_date ? "line-through text-gray-400" : "text-gray-800"}`}>{g.name}</div>
                    {g.due_date && <div className="text-xs text-gray-400 mt-0.5">Due {new Date(g.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-400 italic">No goals set</div>
          )}
        </div>
      </div>

      {/* Sessions */}
      <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
        <h2 className="font-semibold text-gray-800 mb-4">Sessions ({sessions?.length ?? 0})</h2>
        {sessions && sessions.length > 0 ? (
          <div className="space-y-3">
            {sessions.map((s: any) => (
              <div key={s.id} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-sm text-gray-800">{s.name}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {s.date_start ? new Date(s.date_start).toLocaleDateString("en-US", { weekday:"short", month:"long", day:"numeric", year:"numeric" }) : "—"}
                      {s.users && ` · ${s.users.first_name} ${s.users.last_name}`}
                    </div>
                    {s.session_notes?.note && (
                      <div className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded italic">
                        "{s.session_notes.note.substring(0, 120)}{s.session_notes.note.length > 120 ? "…" : ""}"
                      </div>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ml-4 flex-shrink-0 ${s.status === "Held" ? "bg-green-100 text-green-700" : s.status === "Planned" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"}`}>
                    {s.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-400 italic">No sessions recorded</div>
        )}
      </div>
    </div>
  );
}
