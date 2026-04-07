## draftiq

a quoting and booking platform for service businesses. started as an hvac configurator, being built to work across industries.

the basic problem: getting a price from a service company is still painfully slow. you call, you wait, someone comes out, you get a number days later. both sides lose time and money in the process. draftiq tries to compress that into a single guided flow, configure what you need, see pricing, book, pay.

---

## what it does

- multi-step configurator that walks customers through service selection
- real-time pricing that updates as they make choices
- booking with availability, time slots, and capacity tracking
- stripe payments (full or deposit)
- crm sync with hubspot and gohighlevel
- admin dashboard for managing everything
- analytics across the full funnel
- ai-assisted recommendations (package suggestions, price explanations)

the whole point is one unbroken flow: **quote → book → pay → done.**

---

## configurator

the configurator is schema-driven. steps, questions, and branching logic are all defined in config — nothing is hardcoded to a specific industry. supports single/multi select, conditional visibility, and dynamic branching. adding a new industry means writing a new schema, not new code.

---

## pricing

rule-based, not static. each option maps to pricing rules that can be fixed, percentage-based, per-unit, or tiered. everything calculates in real time on the backend, and the frontend reflects it instantly. the goal is transparent pricing; customers see exactly what they're paying for and why.

---

## booking and payments

once a quote is generated, customers pick a date and time slot. there's availability tracking and capacity limits built in, plus urgency indicators (limited slots, last available) to nudge conversion.

payments go through stripe. supports full payments and deposits, with webhook verification and status tracking. no card data touches our backend.

---

## admin

businesses manage their own pricing rules, availability, bookings, and integrations from the dashboard. same design language as the customer-facing side.

---

## multi-tenant

supports multiple businesses from one deployment. tenant resolution works via subdomain, header, or query param. data is isolated per tenant, and branding is white-labeled with dynamic theming.

---

## analytics and predictions

every step, booking, and payment is tracked. the admin dashboard shows funnel analysis, drop-off points, and revenue data. there's also a predictive layer; conversion probability scoring, drop-off risk detection, and a/b testing with deterministic variant assignment.

---

## tech stack

**frontend:** next.js (app router), react, typescript, tailwind, framer motion, zustand

**backend:** nestjs, prisma, mysql

**services:** stripe, openai, crm apis

architecture is modular; feature-based on the frontend, module-based on the backend. standard stuff: input validation everywhere, rate limiting, secure env handling, sql injection protection via prisma.

---

## getting started

prerequisites: node >= 18, pnpm, mysql

```bash
pnpm install

cp .env.example .env
cp apps/api/.env.example apps/api/.env
# edit apps/api/.env with your database url and api keys

pnpm db:migrate
pnpm db:seed
pnpm dev
```

frontend runs on `localhost:3000`, api on `localhost:4000`.

```
pnpm dev          # start both frontend and api
pnpm build        # build both projects
pnpm lint         # type check all packages
pnpm format       # format with prettier
pnpm db:migrate   # run prisma migrations
pnpm db:seed      # seed the database
```

---

## extensibility

not locked to hvac. the pricing engine and configurator are industry-agnostic by design. plumbing, solar, roofing, custom services; it's a matter of adding schemas and rules. the long-term idea is a no-code pricing engine that any service business can set up themselves.

---

## why

most service businesses still run on phone calls and spreadsheets for quoting. it works, but it's slow and it leaks leads. this is a personal project but it's built with real use in mind; not just features for the sake of features, but stuff that actually tightens the gap between "interested" and "booked."
