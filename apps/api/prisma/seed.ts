import { PrismaClient, PricingRuleType } from "@prisma/client";

const prisma = new PrismaClient();

interface SeedRule {
  key: string;
  label: string;
  type: PricingRuleType;
  value: number;
  category: string;
  baseKey?: string;
}

const hvacRules: SeedRule[] = [
  { key: "base:small", label: "base installation", type: "FIXED", value: 3200, category: "base" },
  { key: "base:medium", label: "base installation", type: "FIXED", value: 4800, category: "base" },
  { key: "base:large", label: "base installation", type: "FIXED", value: 6500, category: "base" },
  { key: "base:xlarge", label: "base installation", type: "FIXED", value: 8200, category: "base" },
  { key: "system:standard", label: "standard system", type: "FIXED", value: 0, category: "system" },
  { key: "system:high-efficiency", label: "high efficiency upgrade", type: "FIXED", value: 1800, category: "system" },
  { key: "system:premium", label: "premium upgrade", type: "FIXED", value: 3500, category: "system" },
  { key: "duct:good", label: "ductwork — good", type: "FIXED", value: 0, category: "duct" },
  { key: "duct:fair", label: "duct sealing", type: "FIXED", value: 800, category: "duct" },
  { key: "duct:poor", label: "duct repair", type: "FIXED", value: 1600, category: "duct" },
  { key: "duct:replace", label: "duct replacement", type: "FIXED", value: 3200, category: "duct" },
  { key: "addon:thermostat", label: "smart thermostat", type: "FIXED", value: 350, category: "addon" },
  { key: "addon:purifier", label: "air purifier", type: "FIXED", value: 650, category: "addon" },
  { key: "addon:humidifier", label: "whole-home humidifier", type: "FIXED", value: 450, category: "addon" },
  { key: "addon:warranty", label: "extended warranty", type: "FIXED", value: 500, category: "addon" },
  { key: "addon:maintenance", label: "annual maintenance plan", type: "FIXED", value: 299, category: "addon" },
  { key: "addon:zoning", label: "zone control system", type: "FIXED", value: 1200, category: "addon" },
];

async function seedPricingRules() {
  console.log("seeding pricing rules...");
  for (const rule of hvacRules) {
    await prisma.pricingRule.upsert({
      where: { key: rule.key },
      update: { label: rule.label, type: rule.type, value: rule.value, category: rule.category, baseKey: rule.baseKey ?? null },
      create: { key: rule.key, label: rule.label, type: rule.type, value: rule.value, category: rule.category, baseKey: rule.baseKey ?? null },
    });
  }
  const count = await prisma.pricingRule.count();
  console.log(`seeded ${count} pricing rules`);
}

async function seedAvailability() {
  console.log("seeding availability...");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 1; i <= 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    // skip sundays (day 0)
    if (date.getDay() === 0) continue;

    // saturdays get fewer slots
    const totalSlots = date.getDay() === 6 ? 4 : 6;

    await prisma.availability.upsert({
      where: { date },
      update: { totalSlots },
      create: { date, totalSlots },
    });
  }

  const count = await prisma.availability.count();
  console.log(`seeded ${count} availability days`);
}

async function seedIntegrationConfigs() {
  console.log("seeding integration configs...");
  const providers = ["hubspot", "ghl"];

  for (const provider of providers) {
    await prisma.integrationConfig.upsert({
      where: { provider },
      update: {},
      create: { provider, isEnabled: false },
    });
  }

  console.log(`seeded ${providers.length} integration configs`);
}

async function main() {
  await seedPricingRules();
  await seedAvailability();
  await seedIntegrationConfigs();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
