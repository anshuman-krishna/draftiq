"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Navbar } from "@draftiq/ui";
import { staggerContainer, staggerItem, fadeIn } from "@/lib/motion";

const features = [
  {
    title: "instant pricing",
    description: "see your estimate update in real-time as you configure.",
  },
  {
    title: "transparent breakdown",
    description: "every line item explained. no hidden fees, no surprises.",
  },
  {
    title: "book in minutes",
    description: "from quote to scheduled appointment in a single flow.",
  },
];

export default function Home() {
  return (
    <>
      <Navbar
        actions={
          <Link
            href="/estimate"
            className="rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-neutral-800"
          >
            get estimate
          </Link>
        }
      />

      <main className="relative">
        {/* hero */}
        <section className="flex min-h-screen flex-col items-center justify-center px-4 pt-16">
          <motion.div
            className="max-w-3xl text-center"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.p
              className="mb-5 text-sm font-medium uppercase tracking-widest text-neutral-500"
              variants={staggerItem}
            >
              intelligent quoting for service businesses
            </motion.p>

            <motion.h1
              className="mb-6 text-5xl font-bold leading-tight tracking-tight text-neutral-900 sm:text-6xl lg:text-7xl"
              variants={staggerItem}
            >
              configure smarter.
              <br />
              quote faster.
              <br />
              <span className="text-primary">close instantly.</span>
            </motion.h1>

            <motion.p
              className="mx-auto mb-10 max-w-lg text-lg text-neutral-500"
              variants={staggerItem}
            >
              replace manual quoting with an intelligent pricing engine that
              converts visitors into customers.
            </motion.p>

            <motion.div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center" variants={staggerItem}>
              <Link
                href="/estimate"
                className="inline-flex items-center gap-2 rounded-2xl bg-neutral-900 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
              >
                start your estimate
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3.5 8H12.5M12.5 8L8.5 4M12.5 8L8.5 12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
              <span className="text-sm text-neutral-400">
                takes about 2 minutes
              </span>
            </motion.div>
          </motion.div>

          {/* preview card */}
          <motion.div
            className="glass-medium mt-16 w-full max-w-2xl rounded-3xl p-8"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.5 }}
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <div className="h-2 w-2 rounded-full bg-secondary" />
              <div className="h-2 w-2 rounded-full bg-accent" />
              <div className="ml-2 h-px flex-1 bg-neutral-200" />
              <span className="text-xs text-neutral-400">live preview</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-white/50 px-4 py-3">
                <span className="text-sm text-neutral-500">home size</span>
                <span className="text-sm font-medium text-neutral-900">2,400 sq ft</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white/50 px-4 py-3">
                <span className="text-sm text-neutral-500">system type</span>
                <span className="text-sm font-medium text-neutral-900">high-efficiency</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white/50 px-4 py-3">
                <span className="text-sm text-neutral-500">estimated total</span>
                <span className="text-lg font-bold text-neutral-900">$6,600</span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* features */}
        <section className="mx-auto max-w-5xl px-4 py-24 sm:px-6">
          <motion.div
            className="grid gap-6 sm:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                className="glass-light rounded-2xl p-6"
                variants={staggerItem}
              >
                <h3 className="mb-2 text-base font-semibold text-neutral-900">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-neutral-500">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* cta */}
        <section className="mx-auto max-w-3xl px-4 pb-24 text-center">
          <motion.div
            className="glass-medium rounded-3xl px-8 py-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="mb-4 text-3xl font-bold text-neutral-900">
              ready to get your estimate?
            </h2>
            <p className="mx-auto mb-8 max-w-md text-neutral-500">
              answer a few questions about your home and get an instant,
              transparent quote.
            </p>
            <Link
              href="/estimate"
              className="inline-flex items-center gap-2 rounded-2xl bg-neutral-900 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
            >
              start now
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3.5 8H12.5M12.5 8L8.5 4M12.5 8L8.5 12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </motion.div>
        </section>
      </main>
    </>
  );
}
