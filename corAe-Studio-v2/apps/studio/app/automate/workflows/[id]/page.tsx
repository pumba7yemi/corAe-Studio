interface Props { params: Promise<{ id: string }> }
export default async function WorkflowDetailPage({ params }: Props) {
  const p = await params;
  return <h1>Workflow Detail (stub) – {p.id}</h1>;
}
