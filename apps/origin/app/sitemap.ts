import type { MetadataRoute } from "next";
import { categories } from "@/config/components";

export default function sitemap(): MetadataRoute.Sitemap {
  const home = {
    url: "https://ness.com/origin",
  };
  const search = {
    url: "https://ness.com/origin/search",
  };
  const easings = {
    url: "https://ness.com/origin/easings",
  };
  const categoryPages = categories.map((category) => ({
    url: `https://ness.com/origin/${category.slug}`,
  }));

  return [home, ...categoryPages, search, easings];
}
