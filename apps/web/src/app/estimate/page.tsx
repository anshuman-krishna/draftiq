"use client";

import Link from "next/link";
import { Navbar } from "@draftiq/ui";
import { Configurator } from "@/features/configurator";

export default function EstimatePage() {
  return (
    <>
      <Navbar
        actions={
          <Link
            href="/"
            className="text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900"
          >
            back to home
          </Link>
        }
      />
      <main className="min-h-screen pb-24 lg:pb-0">
        <Configurator />
      </main>
    </>
  );
}
