import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Phone, Mail, MapPin, Calendar, MessageSquare, Target, Heart } from "lucide-react";
import AiSummaryPanel from "@/components/AiSummaryPanel";

export default async function MomProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [{ data: mom }, { data: pairing }, { data: goals }, { data: sessions }] = await Promise.all([
    supabase
      .from("moms")
      .select(`
        id, first_name, last_name, email1, phone_other,
        status, program_status, primary_address_city, primary_address_state,
        language_preference_c, date_entered, due_date_c, number_of_kids_c,
        risk_level_c, emergency_contact_name_c, emergency_contact_phone_c,
        affiliates(name),
        users!moms_assigned_user_id_fkey(id, first_name, last_name, email, phone_mobile)
      `)
      .eq("id", id)
      .single(),
    supabase
      .from("pairings")
      .select(`
        id, status, date_paired,
        tracks(title, description),
        users!pairings_advocate_id_fkey(id, first_name, last_name, email, phone_mobile, advocate_status)
      `)
      .eq("mom_id", id)
      .eq("deleted_at", 0)
      .eq("status", "paired")
      .single(),
    supabase
      .from("goals")
      .select("id, title, status, category, due_date, completed_date")
      .eq("mom_id", id)
      .eq("deleted_at", 0)
      .order("status"),
    supabase
      .from("sessions")
      .select(`
        id, name, status, session_type, date_start, location,
        users!sessions_assigned_user_id_fkey(first_name, last_name),
        session_notes(id, status, note, ai_summary, ai_generated_at)
      `)
      .eq("mom_id", id)
      .eq("deleted_at", 0)
      .order("date_start", { ascending: false }),
  ]);

  if (!mom) notFound();

  // Supabase infers joined relations as arrays; cast to any for safe access
  const momAny = mom as any;

  const programStatusLabel: Record<string, string> = {
    in_program_paired_with_advocate: "Paired with Advocate",
    in_program_waiting_to_be_paired_with_advocate: "Waiting for Advocate",
    prospective_mom: "Prospective",
    completed: "Completed",
    paused: "Paused",
    discharged: "Discharged",
    not_set: "Not Set",
  };

  const statusChipClass: Record<string, string> = {
    in_program_paired_with_advocate: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    in_program_waiting_to_be_paired_with_advocate: "bg-amber-50 text-amber-700 border border-amber-200",
    prospective_mom: "bg-blue-50 text-blue-700 border border-blue-200",
    completed: "bg-gray-100 text-gray-500 border border-gray-200",
    paused: "bg-orange-50 text-orange-700 border border-orange-200",
  };

  const completedGoals = (goals ?? []).filter(g => g.status === "completed").length;
  const totalGoals = (goals ?? []).length;
  const heldSessions = (sessions ?? []).filter(s => s.status === "Held").length;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Back */}
      <Link href="/people" className="flex items-center gap-2 text-sm mb-6 hover:underline" style={{ color: "#143637" }}>
        <ArrowLeft className="w-4 h-4" /> Back to People
      </Link>

      {/* Profile Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0" style={{ background: "#eb462d" }}>
            {momAny.first_name?.[0]}{momAny.last_name?.[0]}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900">{momAny.first_name} {momAny.last_name}</h1>
                <div className="text-sm text-gray-400 mt-0.5">{momAny.affiliates?.name}</div>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusChipClass[momAny.program_status ?? ""] ?? "bg-gray-100 text-gray-500 border border-gray-200"}`}>
                {programStatusLabel[momAny.program_status ?? ""] ?? momAny.program_status}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
              {momAny.email1 && <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-gray-400" />{momAny.email1}</span>}
              {momAny.phone_other && <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-gray-400" />{momAny.phone_other}</span>}
              {(momAny.primary_address_city || momAny.primary_address_state) && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {[momAny.primary_address_city, momAny.primary_address_state].filter(Boolean).join(", ")}
                </span>
              )}
              {momAny.date_entered && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  Enrolled {new Date(momAny.date_entered).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-5 pt-5 border-t border-gray-100 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: "#143637" }}>{heldSessions}</div>
            <div className="text-xs text-gray-400 mt-0.5">Sessions Held</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: "#143637" }}>{completedGoals}/{totalGoals}</div>
            <div className="text-xs text-gray-400 mt-0.5">Goals Complete</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: "#143637" }}>{momAny.language_preference_c ?? "English"}</div>
            <div className="text-xs text-gray-400 mt-0.5">Language</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="space-y-5">
          {/* Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-800 text-sm mb-4 flex items-center gap-2">
              <Heart className="w-4 h-4" style={{ color: "#eb462d" }} /> Client Details
            </h2>
            <dl className="space-y-2.5 text-sm">
              {momAny.due_date_c && (
                <div className="flex justify-between">
                  <dt className="text-gray-400">Due Date</dt>
                  <dd className="text-gray-700 font-medium">{new Date(momAny.due_date_c).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</dd>
                </div>
              )}
              {momAny.number_of_kids_c != null && (
                <div className="flex justify-between">
                  <dt className="text-gray-400">Children</dt>
                  <dd className="text-gray-700 font-medium">{momAny.number_of_kids_c}</dd>
                </div>
              )}
              {momAny.risk_level_c && (
                <div className="flex justify-between">
                  <dt className="text-gray-400">Risk Level</dt>
                  <dd className={`font-medium text-xs px-2 py-0.5 rounded-full ${momAny.risk_level_c === "High" ? "bg-red-100 text-red-700" : momAny.risk_level_c === "Medium" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                    {momAny.risk_level_c}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Coordinator */}
          {momAny.users && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-800 text-sm mb-3">Coordinator</h2>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0" style={{ background: "#143637" }}>
                  {(momAny.users as any).first_name?.[0]}{(momAny.users as any).last_name?.[0]}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-800">{(momAny.users as any).first_name} {(momAny.users as any).last_name}</div>
                  <div className="text-xs text-gray-400">{(momAny.users as any).email}</div>
                </div>
              </div>
            </div>
          )}

          {/* Pairing */}
          {pairing && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-800 text-sm mb-3">Current Pairing</h2>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0" style={{ background: "#eb462d" }}>
                  {(pairing.users as any)?.first_name?.[0]}{(pairing.users as any)?.last_name?.[0]}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-800">{(pairing.users as any)?.first_name} {(pairing.users as any)?.last_name}</div>
                  <div className="text-xs text-gray-400">Advocate</div>
                </div>
              </div>
              {(pairing.tracks as any)?.title && (
                <div className="text-xs bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-gray-600">
                  📚 Track: <span className="font-medium">{(pairing.tracks as any).title}</span>
                </div>
              )}
              {pairing.date_paired && (
                <div className="text-xs text-gray-400 mt-2">
                  Paired since {new Date(pairing.date_paired).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Goals */}
          {totalGoals > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-800 text-sm mb-1 flex items-center gap-2">
                <Target className="w-4 h-4" style={{ color: "#143637" }} /> Goals
                <span className="ml-auto text-xs text-gray-400">{completedGoals} of {totalGoals} complete</span>
              </h2>
              <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4">
                <div className="h-1.5 rounded-full transition-all" style={{ width: `${totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0}%`, background: "#143637" }} />
              </div>
              <div className="space-y-2">
                {(goals ?? []).map((g: any) => (
                  <div key={g.id} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                    <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${g.status === "completed" ? "border-emerald-500 bg-emerald-500" : "border-gray-200"}`}>
                      {g.status === "completed" && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm ${g.status === "completed" ? "line-through text-gray-400" : "text-gray-700"}`}>{g.title}</div>
                      {g.category && <div className="text-xs text-gray-400 mt-0.5">{g.category}</div>}
                    </div>
                    {g.due_date && (
                      <div className="text-xs text-gray-400 flex-shrink-0">{new Date(g.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Session History */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-800 text-sm mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" style={{ color: "#143637" }} /> Session History
            </h2>
            {(sessions ?? []).length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No sessions recorded yet</p>
            ) : (
              <div className="space-y-3">
                {(sessions ?? []).map((s: any) => {
                  const note = s.session_notes?.[0];
                  const statusColors: Record<string, string> = {
                    Held: "bg-emerald-50 text-emerald-700 border border-emerald-200",
                    Planned: "bg-blue-50 text-blue-700 border border-blue-200",
                    NotHeld: "bg-red-50 text-red-700 border border-red-200",
                  };
                  return (
                    <div key={s.id} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <div className="text-sm font-medium text-gray-800">{s.name}</div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {s.date_start ? new Date(s.date_start).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }) : "—"}
                            {s.users && ` · ${s.users.first_name} ${s.users.last_name}`}
                            {s.location && ` · ${s.location}`}
                          </div>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${statusColors[s.status] ?? "bg-gray-100 text-gray-500 border border-gray-200"}`}>
                          {s.status}
                        </span>
                      </div>
                      {note?.note && (
                        <div className="mt-2 text-xs text-gray-500 bg-gray-50 rounded-md px-3 py-2">
                          <p className="line-clamp-3 italic">"{note.note}"</p>
                        </div>
                      )}
                      {/* AI Analysis Panel — shows pre-seeded summary or on-demand generation */}
                      {note && s.status === "Held" && (
                        <AiSummaryPanel
                          noteId={note.id}
                          noteText={note.note ?? ""}
                          existingSummary={note.ai_summary ?? null}
                          existingGeneratedAt={note.ai_generated_at ?? null}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
