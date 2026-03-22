"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Users2, ChartColumnIncreasing,
  Files, Settings, GraduationCap, CalendarDays
} from "lucide-react";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/people", label: "People", icon: Users },
  { href: "/groups", label: "Groups", icon: Users2 },
  { href: "/reporting", label: "Reporting", icon: ChartColumnIncreasing },
  { href: "/resources", label: "Resources", icon: Files },
  { href: "/sessions", label: "Sessions", icon: CalendarDays },
];

const bottom = [
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "#", label: "Moodle LMS", icon: GraduationCap, disabled: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <nav className="hidden lg:flex lg:w-[270px] lg:min-w-[270px] sticky top-0 h-screen flex-col overflow-y-auto bg-white border-r border-gray-200">
      <div className="flex flex-col flex-grow">
        {/* Logo */}
        <div className="pt-8 pb-2 px-6">
          <Link href="/" className="block">
            {/* EMA Logo — teal wordmark matching production */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:"#143637"}}>
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <div>
                <div className="font-bold text-sm leading-tight" style={{color:"#143637"}}>Trellis</div>
                <div className="text-xs text-gray-400 leading-tight">Every Mother's Advocate</div>
              </div>
            </div>
          </Link>

          {/* Demo badge */}
          <div className="mt-3 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-md text-center">
            ✦ Demo Environment
          </div>
        </div>

        {/* Main nav */}
        <div className="flex-1 px-4 mt-4 space-y-0.5">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  active
                    ? "text-white"
                    : "text-slate-700 hover:bg-gray-100"
                }`}
                style={active ? {background:"#143637"} : {}}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {label}
              </Link>
            );
          })}
        </div>

        {/* Bottom nav */}
        <div className="px-4 pb-8 space-y-0.5 mt-2">
          {bottom.map(({ href, label, icon: Icon, disabled }) => (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                disabled
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-slate-700 hover:bg-gray-100"
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
              {disabled && <span className="text-xs text-gray-300 ml-auto">demo only</span>}
            </Link>
          ))}

          {/* User info strip */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3 px-1">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{background:"#eb462d"}}>
              AD
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-800">Admin Demo</div>
              <div className="text-xs text-gray-400">Administrator</div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
