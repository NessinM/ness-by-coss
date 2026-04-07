import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://creantly.com" },
    { url: "https://creantly.com/scheduling" },
    { url: "https://creantly.com/calendar" },
    { url: "https://creantly.com/email" },
    { url: "https://creantly.com/sms" },
    { url: "https://creantly.com/video" },
    { url: "https://creantly.com/payments" },
    { url: "https://creantly.com/notifications" },
    { url: "https://creantly.com/auth" },
  ];
}
