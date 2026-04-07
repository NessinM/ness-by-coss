import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      allow: "/",
      disallow: "/private/",
      userAgent: "*",
    },
    sitemap: [
      "https://creantly.com/sitemap.xml",
      "https://creantly.com/origin/sitemap.xml",
      "https://creantly.com/ui/sitemap.xml",
    ],
  };
}
