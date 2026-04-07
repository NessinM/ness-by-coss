import type { MetadataRoute } from "next";
import { source } from "@/lib/source";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = source.getPages();

  return [
    { url: "https://ness.com/ui" },
    { url: "https://ness.com/ui/particles" },
    ...pages.map((page) => ({
      url: `https://ness.com/ui${page.url}`,
    })),
  ];
}
