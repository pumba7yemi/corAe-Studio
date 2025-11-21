interface Props { params: Promise<{ id: string }> }
export default async function ShipComparePage({ params }: Props) {
  const p = await params;
  return <h1>Compare Ship (stub) – {p.id}</h1>;
}
