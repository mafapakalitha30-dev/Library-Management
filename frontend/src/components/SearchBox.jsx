// Filters a list of books by title, author, genre or ISBN.
export function filterBooks(books, query) {
  const q = query.trim().toLowerCase();
  if (!q) return books;
  return books.filter((b) =>
    [b.title, b.author, b.genre, b.isbn].some((field) => (field || '').toLowerCase().includes(q))
  );
}

export default function SearchBox({ value, onChange }) {
  return (
    <label className="field search">
      <span>Search books</span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Title, author, genre or ISBN"
      />
    </label>
  );
}