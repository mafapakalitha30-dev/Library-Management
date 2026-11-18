export const LOW_STOCK_LIMIT = 2; // "low" means fewer than 2 copies

export default function StockBadge({ quantity }) {
  const out = quantity === 0;
  const low = quantity < LOW_STOCK_LIMIT;
  return (
    <span className={`badge ${out ? 'badge-out' : low ? 'badge-low' : 'badge-ok'}`}>
      {out ? 'Out of stock' : low ? `Low: ${quantity}` : `${quantity} in stock`}
    </span>
  );
}
