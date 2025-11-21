interface Props { params: Promise<{ id: string }> }
export default async function BuildLogDetailPage({ params }: Props) {
  const p = await params;
  return <h1>Build Log Detail (stub) – {p.id}</h1>;
}
