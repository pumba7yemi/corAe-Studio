export function calcTotals(
  items: { qty:number; unitPrice:number }[],
  vatPercent=0, discountPct=0
){
  const subtotal = items.reduce((s,i)=>s + i.qty * i.unitPrice, 0);
  const discounted = subtotal * (1 - discountPct/100);
  const vat = discounted * (vatPercent/100);
  const total = discounted + vat;
  return { subtotal:+subtotal.toFixed(2), vat:+vat.toFixed(2), total:+total.toFixed(2) };
}
