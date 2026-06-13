"use client";

import { useState } from "react";
import Link from "next/link";

type NavItem = {
  label: string;
  href: string;
  icon: string;
  badge?: number;
};

export default function Sidebar({
  email,
  plan,
  isAdmin,
  activeItem,
}: {
  email: string;
  plan: "free" | "premium";
  isAdmin: boolean;
  activeItem?: string;
}) {
  const [collapsed, setCollapsed] = useState(false);

  const navItems: NavItem[] = [
    { label: "Tarefas", href: "/dashboard", icon: "✦" },
    ...(isAdmin ? [{ label: "Painel Admin", href: "/admin", icon: "⚙" }] : []),
  ];

  return (
    <aside
      className={`relative flex flex-col transition-all duration-300 ${collapsed ? "w-16" : "w-60"}`}
      style={{ background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)", minHeight: "100vh" }}
    >
      {/* Marca d'água */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden opacity-5">
        <svg viewBox="0 0 200 200" className="w-48 h-48">
          {[10,30,50,70,90].map((r, i) => (
            <circle key={i} cx="100" cy="100" r={r} fill="none" stroke="#e91e8c" strokeWidth="2" strokeDasharray="4 3"/>
          ))}
          <line x1="100" y1="10" x2="100" y2="190" stroke="#e91e8c" strokeWidth="1.5"/>
          <line x1="100" y1="100" x2="160" y2="170" stroke="#e91e8c" strokeWidth="1.5"/>
        </svg>
      </div>

      {/* Logo */}
      <div className={`relative flex items-center gap-3 px-4 py-5 border-b border-white/10 ${collapsed ? "justify-center px-2" : ""}`}>
        <div className="shrink-0 w-9 h-9 relative">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {[35,25,15].map((r, i) => (
              <circle key={i} cx="50" cy="42" r={r} fill="none" stroke="#e91e8c" strokeWidth="3"
                strokeDasharray={i === 0 ? "none" : "5 3"} opacity={1 - i * 0.2}/>
            ))}
            <line x1="50" y1="7" x2="50" y2="77" stroke="#e91e8c" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="50" y1="42" x2="72" y2="70" stroke="#e91e8c" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>
        {!collapsed && (
          <div>
            <div className="leading-none">
              <span className="font-black text-white text-base tracking-wide">QUALI</span>
              <span className="font-black text-[#8a8ab0] text-base tracking-wide">GUARD</span>
            </div>
            <div className="text-[9px] text-[#e91e8c] font-semibold tracking-widest mt-0.5">PORTARIA REMOTA</div>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-white/30 hover:text-white transition-colors text-xs shrink-0"
          title={collapsed ? "Expandir" : "Recolher"}>
          {collapsed ? "▶" : "◀"}
        </button>
      </div>

      {/* Nav */}
      <nav className="relative flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => {
          const active = activeItem === item.href;
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                ${active
                  ? "bg-[#e91e8c]/20 text-white border border-[#e91e8c]/40 shadow-[0_0_12px_rgba(233,30,140,0.2)]"
                  : "text-white/60 hover:text-white hover:bg-white/8"
                } ${collapsed ? "justify-center px-0" : ""}`}>
              <span className={`text-base ${active ? "text-[#e91e8c]" : ""}`}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && item.badge && (
                <span className="ml-auto bg-[#e91e8c] text-white text-xs rounded-full px-1.5 py-0.5 leading-none">{item.badge}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      <div className={`relative border-t border-white/10 p-3 ${collapsed ? "flex justify-center" : ""}`}>
        {collapsed ? (
          <div className="w-8 h-8 rounded-full bg-[#e91e8c]/20 border border-[#e91e8c]/40 flex items-center justify-center text-[#e91e8c] text-xs font-bold">
            {email[0]?.toUpperCase()}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#e91e8c]/20 border border-[#e91e8c]/40 flex items-center justify-center text-[#e91e8c] text-xs font-bold shrink-0">
              {email[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-white truncate">{email}</p>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${plan === "premium" ? "bg-[#e91e8c]/20 text-[#e91e8c]" : "bg-white/10 text-white/50"}`}>
                {plan === "premium" ? "✨ Premium" : "Gratuito"}
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
