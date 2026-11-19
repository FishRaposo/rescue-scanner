import type { ReactNode } from "react";

/** Accessible data table: caption for screen readers, real th/td semantics. */
export function Table({
  caption,
  headers,
  rows,
  empty = "Nothing here yet.",
}: {
  caption: string;
  headers: string[];
  rows: ReactNode[][];
  empty?: string;
}) {
  return (
    <div className="overflow-x-auto rounded-card border border-border">
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-border bg-elev text-left text-muted">
            {headers.map((h) => (
              <th key={h} scope="col" className="px-4 py-3 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.length === 0 ? (
            <tr>
              <td className="px-4 py-6 text-center text-muted" colSpan={headers.length}>
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((cells, i) => (
              <tr key={i} className="bg-surface text-text">
                {cells.map((c, j) => (
                  <td key={j} className="px-4 py-3">
                    {c}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
