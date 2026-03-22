"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/", label: "Dashboard", icon: "🏠" },
  { href: "/clients", label: "Clients", icon: "👩" },
  { href: "/advocates", label: "Advocates", icon: "🤝" },
  { href: "/sessions", label: "Sessions", icon: "📅" },
  { href: "/reports", label: "Reports", icon: "📊" },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <div className="w-60 bg-[#2D1B69] flex flex-col min-h-full shadow-xl">
      {/* Logo area */}
      <div className="px-6 py-5 border-b border-purple-700">
        <div className="text-white font-bold text-lg leading-tight">Trellis</div>
        <div className="text-purple-300 text-xs mt-0.5">Every Mother's Advocate</div>
      </div>

      {/* Demo badge */}
      <div className="mx-4 mt-3 mb-1 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1.5 rounded-full text-center">
        ✦ DEMO ENVIRONMENT
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ href, label, icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-white/20 text-white"
                  : "text-purple-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="text-base">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer note */}
      <div className="px-4 py-4 border-t border-purple-700">
        <div className="text-purple-400 text-xs leading-relaxed">
          Demo data only — no real client information
        </div>
      </div>
    </div>
  );
}
