const LABELS = { RESTOCK: 'Stock added', BORROW: 'Borrowed', RETURN: 'Returned' };

export default function TransactionHistory({ transactions, onDelete }) {
  if (!transactions.length) return <p className="muted">No transactions recorded yet.</p>;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr><th>Date</th><th>Book</th><th>Action</th><th>Qty</th><th>Member</th><th>Note</th><th></th></tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id}>
              <td data-label="Date">{new Date(t.created_at).toLocaleString()}</td>
              <td data-label="Book">{t.book_title}</td>
              <td data-label="Action"><span className={`tag tag-${t.type.toLowerCase()}`}>{LABELS[t.type]}</span></td>
              <td data-label="Qty">{t.type === 'BORROW' ? `−${t.quantity}` : `+${t.quantity}`}</td>
              <td data-label="Member">{t.user_name || '—'}</td>
              <td data-label="Note">{t.notes || ''}</td>
              <td className="row-actions">
                <button className="btn btn-small btn-danger" onClick={() => onDelete(t)}>Undo</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
