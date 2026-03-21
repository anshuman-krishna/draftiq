## draftiq

this is a personal project built from a simple observation

most service businesses still rely on slow, manual processes to quote, schedule, and close deals

- customers have to call
- wait for callbacks
- book inspections
- go through multiple steps just to get a price

this creates friction on both sides

draftiq is an attempt to remove that friction

it is not just a calculator
it is not just a booking tool

it is a system designed to handle the entire flow
from first interaction to final payment

many systems like this one exist already but i am trying to bring new features to it which cater to both a larger but also to a niche audience.

---

## what this actually is

draftiq is a full stack platform that allows service businesses to

* generate instant quotes through guided configurators
* show transparent pricing in real time
* let customers book installations directly
* accept payments online
* sync everything into their crm
* track performance and optimize conversions
* use ai to assist users in making decisions

it combines

configurators
pricing engines
booking systems
payments
crm integrations
analytics
ai assistance

into one cohesive system

---

## core flow

the system is built around a single idea

a customer should be able to go from interest to confirmed job without friction

the flow looks like this

quote → book → pay → confirm

everything is connected

every step updates the next

---

## configurator engine

this is the entry point

users go through a multi-step flow where they answer guided questions

the system is fully schema-driven

which means

* steps are not hardcoded
* logic is dynamic
* flows can be reused across industries

it supports

single select
multi select
conditional steps
dynamic branching

new industries can be added by defining a new schema

---

## pricing engine

pricing is not static

it is rule-based and database-driven

each option maps to pricing rules

supports

fixed pricing
percentage adjustments
per-unit pricing
tier-based systems

all pricing is calculated in real time

the frontend reflects changes instantly

the backend ensures consistency and security

---

## booking system

once a quote is generated

users can directly schedule installation

features include

date selection
time slots
availability tracking
capacity management

there is also an urgency layer

* limited slots messaging
* last slot indicators

this improves conversion

---

## payments

payments are handled through stripe

users can

* pay full amount
* or pay a deposit

the system includes

payment intents
webhook verification
status tracking
secure handling

no sensitive data touches the backend

---

## admin dashboard

businesses control everything from the dashboard

they can

* update pricing rules
* manage bookings
* adjust availability
* view quotes
* track payments
* monitor integrations

the ui follows the same glass-based design system as the main app

---

## crm integrations

draftiq connects with external systems

currently supports

hubspot
gohighlevel

events are synced automatically

* quote created
* booking confirmed
* payment completed

the system uses a provider-based architecture

which allows adding more integrations later

---

## ai layer

ai is used to assist decision making

it does not replace logic

it enhances it

features include

* package recommendations
* price explanations
* upsell suggestions

ai responses are structured and controlled

it never overrides actual pricing

---

## analytics

every interaction is tracked

the system collects

step views
step completions
booking events
payment events

this allows

* funnel analysis
* conversion tracking
* revenue insights

the admin dashboard visualizes this data

---

## predictive intelligence

the system uses analytics data to generate actionable insights

* conversion probability scoring per session
* drop-off risk detection across funnel steps
* automated recommendations for reducing friction
* a/b testing with deterministic variant assignment

---

## multi-tenant

draftiq supports multiple businesses from a single deployment

* tenant resolution from subdomain, header, or query parameter
* data isolation via tenant scoping on all models
* white-label branding with dynamic theming
* per-tenant configuration and settings

---

## visual system

the ui is built around a glassmorphism design

with

soft pastel colors
layered blur effects
subtle animations

interactions are designed to feel smooth and responsive

not flashy, but refined

---

## getting started

prerequisites: node >= 18, pnpm, mysql

```bash
# install dependencies
pnpm install

# set up environment
cp .env.example .env
cp apps/api/.env.example apps/api/.env
# edit apps/api/.env with your database url and api keys

# run database migrations
pnpm db:migrate

# seed sample data
pnpm db:seed

# start development servers
pnpm dev
```

the frontend runs on http://localhost:3000

the api runs on http://localhost:4000

available scripts

```
pnpm dev          # start both frontend and api
pnpm build        # build both projects
pnpm lint         # type check all packages
pnpm format       # format with prettier
pnpm db:migrate   # run prisma migrations
pnpm db:seed      # seed the database
```

---

## technical overview

this is a modern full stack system

frontend

next.js (app router)
react
typescript
tailwind css
framer motion
zustand

backend

nestjs
prisma
mysql

services include

stripe
openai
crm apis

---

## architecture

the system follows

* modular architecture
* mvc principles
* clear separation of concerns

frontend is feature-based
backend is module-based

core modules include

pricing
booking
payments
integrations
analytics
ai

---

## security

security is built in from the start

* input validation on all endpoints
* sql injection protection via prisma
* xss prevention
* rate limiting
* secure env handling

webhooks are verified properly

no sensitive data is exposed

---

## performance

the system is optimized for speed

* debounced api calls
* event batching
* optimized queries
* minimal re-renders

frontend bundles are kept lean

---

## extensibility

draftiq is not limited to hvac

the system is designed to support

plumbing
solar
roofing
custom services

new industries can be added by defining schemas and pricing rules

---

## current state

the system is fully functional

it includes

* complete customer flow
* admin controls
* integrations
* analytics
* ai features

it is ready to be deployed and used

---

## why this exists

most service businesses still operate with outdated workflows

this creates delays, lost leads, and poor customer experience

draftiq is an attempt to modernize that

by making the process

faster
clearer
and more automated

---

## final note

this is a personal project but it is built with real-world use in mind.

the goal is not just to build features out of my mind but to also create a system that actually improves how businesses operate.

---