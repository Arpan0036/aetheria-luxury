import type { MetadataRoute } from "next";
import { DEFAULT_SITE_URL } from "@/lib/seo/json-ld";

export default function robots(): MetadataRoute.Robots {
  const base = DEFAULT_SITE_URL;

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/shop",
          "/product/",
          "/about",
          "/contact",
          "/shipping-returns",
          "/privacy",
          "/terms",
        ],
        disallow: ["/admin", "/checkout", "/account", "/order/", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
