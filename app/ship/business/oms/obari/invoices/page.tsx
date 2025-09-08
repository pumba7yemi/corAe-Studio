import { Card } from '@/ui/components/Card';
import { Button } from '@/ui/components/Button';

export default function Page() {
  return (
    <>
      <section>
        <h1>Invoices</h1>
        <p className="muted">Invoice management module</p>
      </section>

      <div className="grid" style={{gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))'}}>
        <Card title="Invoices Starter" subtitle="This page was scaffolded by the Dev Agent">
          <div className="row">
            <Button variant="primary">Primary</Button>
            <Button>Secondary</Button>
          </div>
        </Card>
      </div>
    </>
  );
}
