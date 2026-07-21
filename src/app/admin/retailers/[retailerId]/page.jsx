import RetailerDetailPanel from "@/components/admin/retailers/RetailerDetailPanel";

export default async function Page({ params }) {
  const { retailerId } = await params;
  return <RetailerDetailPanel retailerId={retailerId} />;
}