import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/constants/site";
import { catalogService } from "@/features/catalog/services/catalog";
import type { Fabric } from "@/features/catalog/types";

// Built on request (and cached by crawlers) so newly added fabrics appear without a rebuild.
export const dynamic = "force-dynamic";

const STATIC_PAGES = ["", "/fabrics", "/bespoke", "/about", "/contact", "/care-guide", "/faq", "/shipping-policy", "/privacy"];

async function allVisibleFabrics(): Promise<Fabric[]> {
  const fabrics: Fabric[] = [];
  for (let page = 1; page <= 50; page++) {
    const result = await catalogService.list({ page, pageSize: 100 });
    fabrics.push(...result.items);
    if (page >= result.totalPages) break;
  }
  return fabrics;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const pages: MetadataRoute.Sitemap = STATIC_PAGES.map((path) => ({ url: `${base}${path}` }));

  try {
    const fabrics = await allVisibleFabrics();
    return [...pages, ...fabrics.map((f) => ({ url: `${base}/fabrics/${f.id}`, lastModified: f.updatedAt }))];
  } catch {
    // If the API is briefly unavailable, still serve the static pages.
    return pages;
  }
}
