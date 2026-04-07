import type { MetadataRoute } from "next";
import { categories } from "@/config/components";

export default function sitemap(): MetadataRoute.Sitemap {
  const home = {
    url: "https://creantly.com/origin",
  };
  const search = {
    url: "https://creantly.com/origin/search",
  };
  const easings = {
    url: "https://creantly.com/origin/easings",
  };
  const categoryPages = categories.map((category) => ({
    url: `https://creantly.com/origin/${category.slug}`,
  }));

  return [home, ...categoryPages, search, easings];
}
