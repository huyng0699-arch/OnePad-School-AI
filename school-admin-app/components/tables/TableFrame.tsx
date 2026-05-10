"use client";

import { useMemo, useState } from "react";

type Column<T> = { key: keyof T; label: string; sortable?: boolean };

export default function TableFrame<T extends Record<string, any>>({
  rows,
  columns,
  renderRow,
  pageSize = 10,
}: {
  rows: T[];
  columns: Column<T>[];
  renderRow: (row: T) => React.ReactNode;
  pageSize?: number;
}) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<keyof T | "">("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return rows.filter((r) => !q || JSON.stringify(r).toLowerCase().includes(q));
  }, [rows, query]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const cloned = [...filtered];
    cloned.sort((a, b) => {
      const av = String(a[sortKey] ?? "");
      const bv = String(b[sortKey] ?? "");
      const cmp = av.localeCompare(bv, undefined, { numeric: true, sensitivity: "base" });
      return sortDir === "asc" ? cmp : -cmp;
    });
    return cloned;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageRows = sorted.slice((page - 1) * pageSize, page * pageSize);

  function toggleSort(key: keyof T) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  return (
    <div>
      <div className="table-controls">
        <input placeholder="Filter table..." value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} aria-label="Filter table" />
        <span className="footer-note">{sorted.length} records</span>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={String(c.key)}>
                  {c.sortable ? (
                    <button type="button" className="th-sort" onClick={() => toggleSort(c.key)} aria-label={`Sort by ${c.label}`}>
                      {c.label} {sortKey === c.key ? (sortDir === "asc" ? "▲" : "▼") : ""}
                    </button>
                  ) : c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{pageRows.map((row) => renderRow(row))}</tbody>
        </table>
      </div>
      <div className="pager">
        <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
        <span>Page {page} / {totalPages}</span>
        <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</button>
      </div>
    </div>
  );
}
