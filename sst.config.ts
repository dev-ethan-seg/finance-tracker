/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "finance-tracker",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {
    const site = new sst.aws.Nextjs("FinanceTrackerSite", {
      environment: {
        AUTH_DISCORD_ID: process.env.AUTH_DISCORD_ID || "",
        AUTH_DISCORD_SECRET: process.env.AUTH_DISCORD_SECRET || "",
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "",
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || "",
        DATABASE_URL: process.env.DATABASE_URL || "",
      },
    });

    return {
      url: site.url,
    };
  },
});