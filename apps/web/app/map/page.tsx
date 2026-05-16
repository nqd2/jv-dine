import { Suspense } from "react";
import { MapSearchPage } from "../components/map-search-page";

export default function MapRoutePage() {
  return (
    <Suspense fallback={<p className="p-8 text-center">Loading...</p>}>
      <MapSearchPage />
    </Suspense>
  );
}
