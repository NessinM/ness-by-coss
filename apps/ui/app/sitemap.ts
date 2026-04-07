import type { MetadataRoute } from "next";
import { source } from "@/lib/source";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = source.getPages();

  return [
    { url: "https://creantly.com/ui" },
    { url: "https://creantly.com/ui/particles" },
    ...pages.map((page) => ({
      url: `https://creantly.com/ui${page.url}`,
    })),
  ];
}
