"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

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
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
        <Image src="/marca-dagua.png" alt="" fill className="object-cover object-left" />
      </div>

      {/* Logo */}
      <div className={`relative flex items-center gap-3 px-4 py-4 border-b border-white/10 ${collapsed ? "justify-center px-2" : ""}`}>
        {collapsed ? (
          <Image src="/logo-qg.png" alt="QG" width={36} height={36} className="object-contain" />
        ) : (
          <Image src="/logotipo-qualiguard.png" alt="QualiGuard Tecnologia" width={160} height={48} className="object-contain" />
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
