import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/constants/site";

// Generated per request so SITE_URL can be set when the container starts.
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/cart", "/payment"] },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
