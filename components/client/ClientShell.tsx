"use client";

import { useState } from "react";
import { ClientSidebar } from "@/components/client/ClientSidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { DirBoundary } from "@/components/layout/DirBoundary";

export function ClientShell({
  name,
  role,
  children,
}: {
  name: string;
  role: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    // Full viewport, no page scroll → sidebar + topbar stay fixed, only main scrolls.
    <DirBoundary className="flex h-dvh overflow-hidden bg-surface">
      <ClientSidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuToggle={() => setOpen(true)} name={name} role={role} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </DirBoundary>
  );
}
