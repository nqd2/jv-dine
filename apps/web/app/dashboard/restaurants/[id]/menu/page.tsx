import { MenuManagementPage } from "../../../../components/menu-management-page";

export default async function RestaurantMenuRoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <MenuManagementPage restaurantId={id} />;
}
