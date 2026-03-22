import { supabase } from "@/lib/supabase";

const statusColors: Record<string, string> = {
  Active: "bg-green-100 text-green-800",
  Prospect: "bg-amber-100 text-amber-800",
  Inactive: "bg-gray-100 text-gray-500",
  Did_Not_Onboard: "bg-red-100 text-red-700",
};

const subStatusLabel: Record<string, string> = {
  Waiting_To_Be_Paired: "Waiting to be Paired",
  Paired: "Paired",
  In_Training: "In Training",
  Training_Completed: "Training Complete",
  Pending_Final_Steps: "Pending Final Steps",
  Interested: "Interested",
};

export default async function AdvocatesPage() {
  const { data: advocates } = await supabase
    .from("users")
    .select(`
      id, first_name, last_name, email, phone_mobile, status,
      advocate_status, advocate_sub_status, advocate_capacity_for_moms,
      affiliates(name),
      user_roles(roles(key))
    `)
    .eq("deleted_at", 0)
    .neq("advocate_status", null)
    .order("first_name");

  // For each advocate count their active pairings
  const { data: pairingCounts } = await supabase
    .from("pairings")
    .select("advocate_user_id")
    .eq("deleted_at", 0)
    .eq("status", "paired");

  const pairingsPerAdvocate: Record<string, number> = {};
  (pairingCounts ?? []).forEach((p: any) => {
    pairingsPerAdvocate[p.advocate_user_id] = (pairingsPerAdvocate[p.advocate_user_id] ?? 0) + 1;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advocates</h1>
          <p className="text-gray-500 text-sm mt-1">{advocates?.length ?? 0} advocates across all affiliates</p>
        </div>
        <button className="bg-[#2D1B69] text-white text-sm px-4 py-2 rounded-lg font-medium opacity-60 cursor-not-allowed">
          + Invite Advocate <span className="text-xs ml-1 opacity-70">DEMO ONLY</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {(advocates ?? []).map((a: any) => {
          const paired = pairingsPerAdvocate[a.id] ?? 0;
          const capacity = a.advocate_capacity_for_moms ?? 3;
          const pct = capacity > 0 ? Math.round((paired / capacity) * 100) : 0;
          return (
            <div key={a.id} className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-semibold text-gray-900">{a.first_name} {a.last_name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{a.affiliates?.name}</div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[a.advocate_status] ?? "bg-gray-100 text-gray-500"}`}>
                  {a.advocate_status}
                </span>
              </div>

              {a.advocate_sub_status && (
                <div className="text-xs text-purple-600 mb-3">{subStatusLabel[a.advocate_sub_status] ?? a.advocate_sub_status?.replace(/_/g," ")}</div>
              )}

              <div className="text-xs text-gray-500 mb-1">
                <span className="font-medium text-gray-700">{a.email}</span>
              </div>
              {a.phone_mobile && <div className="text-xs text-gray-400 mb-3">{a.phone_mobile}</div>}

              {/* Capacity bar */}
              {a.advocate_status === "Active" && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                    <span>Capacity</span>
                    <span className="font-medium">{paired} / {capacity} clients</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${pct >= 100 ? "bg-red-400" : pct >= 67 ? "bg-amber-400" : "bg-green-400"}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                </div>
              )}

              {a.advocate_status === "Prospect" && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1.5 rounded">
                    ⏳ Onboarding in progress — Moodle training required
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
