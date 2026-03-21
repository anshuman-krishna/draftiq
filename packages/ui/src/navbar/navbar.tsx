"use client";

import { ReactNode } from "react";

interface NavbarProps {
  logo?: ReactNode;
  actions?: ReactNode;
}

export function Navbar({ logo, actions }: NavbarProps) {
  return (
    <nav className="glass-heavy fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          {logo ?? (
            <span className="text-lg font-bold tracking-tight text-neutral-900">draftiq</span>
          )}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </nav>
  );
}
