import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://ness.com" },
    { url: "https://ness.com/scheduling" },
    { url: "https://ness.com/calendar" },
    { url: "https://ness.com/email" },
    { url: "https://ness.com/sms" },
    { url: "https://ness.com/video" },
    { url: "https://ness.com/payments" },
    { url: "https://ness.com/notifications" },
    { url: "https://ness.com/auth" },
  ];
}
