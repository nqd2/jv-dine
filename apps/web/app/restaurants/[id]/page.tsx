import { Suspense } from "react";
import { RestaurantDetailPage } from "../../components/restaurant-detail-page";

export default async function RestaurantDetailRoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={<p className="p-8 text-center">Loading...</p>}>
      <RestaurantDetailPage restaurantId={id} />
    </Suspense>
  );
}
