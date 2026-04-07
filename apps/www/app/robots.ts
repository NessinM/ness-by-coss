import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      allow: "/",
      disallow: "/private/",
      userAgent: "*",
    },
    sitemap: [
      "https://ness.com/sitemap.xml",
      "https://ness.com/origin/sitemap.xml",
      "https://ness.com/ui/sitemap.xml",
    ],
  };
}
