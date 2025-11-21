interface Props { params: Promise<{ id: string }> }
export default async function DeployPage({ params }: Props) {
  const p = await params;
  return <h1>Deploy (stub) – {p.id}</h1>;
}
