// Fabric page (server). The fabric and its similar fabrics are fetched in parallel during server rendering.
import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FabricDetail from "@/features/catalog/components/FabricDetail";
import { catalogService } from "@/features/catalog/services/catalog";
import { ApiError } from "@/lib/api/errors";

// generateMetadata and the page both need the fabric: cache() makes it one API call per request.
const getFabric = cache(async (id: string) => {
  try {
    return await catalogService.get(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
});

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const fabric = await getFabric((await params).id);
  const photo = fabric.photos[0]?.src;
  return {
    title: `${fabric.nameEn || fabric.nameAr} | ${fabric.nameAr || fabric.nameEn} — Al-Mostafa`,
    description: fabric.descriptionEn || fabric.descriptionAr || undefined,
    openGraph: photo ? { images: [photo] } : undefined,
  };
}

export default async function Page({ params }: Params) {
  const { id } = await params;
  const [fabric, similar] = await Promise.all([
    getFabric(id),
    catalogService.similar(id, 4).catch(() => []),
  ]);
  return <FabricDetail fabric={fabric} similar={similar} />;
}
