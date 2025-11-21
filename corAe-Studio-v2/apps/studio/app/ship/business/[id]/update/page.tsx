interface Props { params: Promise<{ id: string }> }
export default async function ShipUpdatePage({ params }: Props) {
  const p = await params;
  return <h1>Update Ship (stub) – {p.id}</h1>;
}
