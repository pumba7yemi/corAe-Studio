export default function Home() {
  return (
    <div className="container stack">
      <h1 className="text-3xl font-bold">corAe Studio</h1>
      <p className="muted">OBARI UI scaffold</p>
      <div className="row">
        <a className="btn" href="/orders">Orders</a>
          <a className="btn" href="/bookings">Bookings</a>
          <a className="btn" href="/active">Active</a>
          <a className="btn" href="/report">Reports</a>
          <a className="btn" href="/invoices">Invoices</a>
      </div>
    </div>
  );
}
