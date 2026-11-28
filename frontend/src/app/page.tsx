// Home page (server). Fetches the six selected fabrics during server rendering so they — and their photos —
// are in the first HTML response instead of being requested by the browser after JavaScript loads.
import { existsSync } from "node:fs";
import path from "node:path";
import HomePage from "@/features/home/components/HomePage";
import { catalogService } from "@/features/catalog/services/catalog";
import type { FabricSummary } from "@/features/catalog/types";

/** Use the owner's photo when it has been added to public/, otherwise the bundled placeholder. */
function photoOrPlaceholder(photo: string, placeholder: string) {
  return existsSync(path.join(process.cwd(), "public", photo)) ? photo : placeholder;
}

export default async function Page() {
  const heroSrc = photoOrPlaceholder("/assets/hero/hero.jpg", "/assets/hero/hero-placeholder.svg");
  const showroomSrc = photoOrPlaceholder("/assets/showroom/showroom.jpg", "/assets/showroom/showroom-placeholder.svg");

  let fabrics: FabricSummary[] = [];
  try {
    fabrics = (await catalogService.list({ pageSize: 6 })).items;
  } catch {
    // The page still renders (without the fabric row) if the API is briefly unavailable.
  }
  return (
    <>
      {/* The hero is the largest element on arrival: fetch it before the CSS that references it. React hoists this into <head>. */}
      <link rel="preload" as="image" href={heroSrc} fetchPriority="high" />
      <HomePage initialFabrics={fabrics} heroSrc={heroSrc} showroomSrc={showroomSrc} />
    </>
  );
}
