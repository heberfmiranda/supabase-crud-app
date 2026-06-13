"use client";

import { useState } from "react";
import Link from "next/link";

type NavItem = {
  label: string;
  href: string;
  icon: string;
  badge?: number;
};

function QGIcon({ size = 36 }: { size?: number }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="44" fill="none" stroke="white" strokeWidth="6"/>
      <text x="50" y="68" textAnchor="middle" fontFamily="Arial Black, Arial, sans-serif"
        fontWeight="900" fontSize="52" fill="white" letterSpacing="-2">QG</text>
    </svg>
  );
}

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
            <circle key={i} cx="100" cy="100" r={r} fill="none" stroke="#4a86c8" strokeWidth="2" strokeDasharray="4 3"/>
          ))}
          <line x1="100" y1="10" x2="100" y2="190" stroke="#4a86c8" strokeWidth="1.5"/>
          <line x1="100" y1="100" x2="160" y2="170" stroke="#4a86c8" strokeWidth="1.5"/>
        </svg>
      </div>

      {/* Logo */}
      <div className={`relative flex items-center gap-3 px-4 py-5 border-b border-white/10 ${collapsed ? "justify-center px-2" : ""}`}>
        <div className="shrink-0">
          <QGIcon size={collapsed ? 32 : 36} />
        </div>
        {!collapsed && (
          <div>
            <div className="leading-none">
              <span className="font-black text-white text-base tracking-wide">QUALI</span>
              <span className="font-black text-[#8a8ab0] text-base tracking-wide">GUARD</span>
            </div>
            <div className="text-[9px] text-[#4a86c8] font-semibold tracking-widest mt-0.5">TECNOLOGIA</div>
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
                  ? "bg-[#4a86c8]/20 text-white border border-[#4a86c8]/40 shadow-[0_0_12px_rgba(74,134,200,0.2)]"
                  : "text-white/60 hover:text-white hover:bg-white/8"
                } ${collapsed ? "justify-center px-0" : ""}`}>
              <span className={`text-base ${active ? "text-[#4a86c8]" : ""}`}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && item.badge && (
                <span className="ml-auto bg-[#4a86c8] text-white text-xs rounded-full px-1.5 py-0.5 leading-none">{item.badge}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      <div className={`relative border-t border-white/10 p-3 ${collapsed ? "flex justify-center" : ""}`}>
        {collapsed ? (
          <div className="w-8 h-8 rounded-full bg-[#4a86c8]/20 border border-[#4a86c8]/40 flex items-center justify-center text-[#4a86c8] text-xs font-bold">
            {email[0]?.toUpperCase()}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#4a86c8]/20 border border-[#4a86c8]/40 flex items-center justify-center text-[#4a86c8] text-xs font-bold shrink-0">
              {email[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-white truncate">{email}</p>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${plan === "premium" ? "bg-[#4a86c8]/20 text-[#4a86c8]" : "bg-white/10 text-white/50"}`}>
                {plan === "premium" ? "✨ Premium" : "Gratuito"}
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
