import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean up existing seed data if present
  await prisma.quoteAddon.deleteMany();
  await prisma.quoteLineItem.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.featureConfig.deleteMany();
  await prisma.tier.deleteMany();
  await prisma.feature.deleteMany();
  await prisma.product.deleteMany();

  // Create product
  const product = await prisma.product.create({
    data: { name: "Analytics Suite" },
  });
  console.log(`✅ Created product: ${product.name}`);

  // Create tiers
  const starter = await prisma.tier.create({
    data: { productId: product.id, name: "Starter", basePricePerSeat: 25 },
  });
  const growth = await prisma.tier.create({
    data: { productId: product.id, name: "Growth", basePricePerSeat: 50 },
  });
  const enterprise = await prisma.tier.create({
    data: { productId: product.id, name: "Enterprise", basePricePerSeat: 100 },
  });
  console.log(`✅ Created tiers: Starter, Growth, Enterprise`);

  // Create features
  const featureNames = [
    "Real-time dashboards",
    "Custom reports",
    "API access",
    "Single Sign-On (SSO)",
    "Advanced anomaly detection",
    "Dedicated support",
    "White-label option",
    "Custom integrations",
  ];

  const features: Record<string, { id: string }> = {};
  for (const name of featureNames) {
    const f = await prisma.feature.create({
      data: { productId: product.id, name },
    });
    features[name] = f;
  }
  console.log(`✅ Created ${featureNames.length} features`);

  // Create feature configs
  const configs = [
    // Real-time dashboards: all INCLUDED
    { tier: starter, feature: "Real-time dashboards", status: "INCLUDED" },
    { tier: growth, feature: "Real-time dashboards", status: "INCLUDED" },
    { tier: enterprise, feature: "Real-time dashboards", status: "INCLUDED" },

    // Custom reports: Starter UNAVAILABLE, Growth INCLUDED, Enterprise INCLUDED
    { tier: starter, feature: "Custom reports", status: "UNAVAILABLE" },
    { tier: growth, feature: "Custom reports", status: "INCLUDED" },
    { tier: enterprise, feature: "Custom reports", status: "INCLUDED" },

    // API access: Starter UNAVAILABLE, Growth ADDON PER_SEAT $50, Enterprise INCLUDED
    { tier: starter, feature: "API access", status: "UNAVAILABLE" },
    {
      tier: growth,
      feature: "API access",
      status: "ADDON",
      pricingModel: "PER_SEAT",
      priceValue: 50,
    },
    { tier: enterprise, feature: "API access", status: "INCLUDED" },

    // SSO: Starter UNAVAILABLE, Growth ADDON FIXED $200, Enterprise INCLUDED
    { tier: starter, feature: "Single Sign-On (SSO)", status: "UNAVAILABLE" },
    {
      tier: growth,
      feature: "Single Sign-On (SSO)",
      status: "ADDON",
      pricingModel: "FIXED",
      priceValue: 200,
    },
    { tier: enterprise, feature: "Single Sign-On (SSO)", status: "INCLUDED" },

    // Advanced anomaly detection: Starter UNAVAILABLE, Growth ADDON PERCENT 10, Enterprise INCLUDED
    {
      tier: starter,
      feature: "Advanced anomaly detection",
      status: "UNAVAILABLE",
    },
    {
      tier: growth,
      feature: "Advanced anomaly detection",
      status: "ADDON",
      pricingModel: "PERCENT",
      priceValue: 10,
    },
    {
      tier: enterprise,
      feature: "Advanced anomaly detection",
      status: "INCLUDED",
    },

    // Dedicated support: all UNAVAILABLE except Enterprise INCLUDED
    {
      tier: starter,
      feature: "Dedicated support",
      status: "UNAVAILABLE",
    },
    {
      tier: growth,
      feature: "Dedicated support",
      status: "UNAVAILABLE",
    },
    {
      tier: enterprise,
      feature: "Dedicated support",
      status: "INCLUDED",
    },

    // White-label option: Starter UNAVAILABLE, Growth ADDON FIXED $500, Enterprise ADDON FIXED $300
    {
      tier: starter,
      feature: "White-label option",
      status: "UNAVAILABLE",
    },
    {
      tier: growth,
      feature: "White-label option",
      status: "ADDON",
      pricingModel: "FIXED",
      priceValue: 500,
    },
    {
      tier: enterprise,
      feature: "White-label option",
      status: "ADDON",
      pricingModel: "FIXED",
      priceValue: 300,
    },

    // Custom integrations: Starter UNAVAILABLE, Growth ADDON FIXED $1000, Enterprise ADDON PERCENT 5
    {
      tier: starter,
      feature: "Custom integrations",
      status: "UNAVAILABLE",
    },
    {
      tier: growth,
      feature: "Custom integrations",
      status: "ADDON",
      pricingModel: "FIXED",
      priceValue: 1000,
    },
    {
      tier: enterprise,
      feature: "Custom integrations",
      status: "ADDON",
      pricingModel: "PERCENT",
      priceValue: 5,
    },
  ];

  for (const config of configs) {
    await prisma.featureConfig.create({
      data: {
        tierId: config.tier.id,
        featureId: features[config.feature].id,
        status: config.status as "INCLUDED" | "ADDON" | "UNAVAILABLE",
        pricingModel: config.pricingModel as
          | "FIXED"
          | "PER_SEAT"
          | "PERCENT"
          | undefined,
        priceValue: config.priceValue,
      },
    });
  }

  console.log(`✅ Created ${configs.length} feature configs`);
  console.log("🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
