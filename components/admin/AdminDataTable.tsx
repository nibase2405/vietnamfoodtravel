import { AdminRowActions, type AdminRowAction } from "@/components/admin/AdminRowActions";

export function AdminDataTable({
  columns,
  rows,
  getActions
}: {
  columns: string[];
  rows: Record<string, unknown>[];
  getActions?: (row: Record<string, unknown>) => AdminRowAction[];
}) {
  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted">
          <tr>
            {columns.map((column) => <th key={column} className="px-4 py-3 font-medium">{column}</th>)}
            {getActions ? <th className="px-4 py-3 font-medium">actions</th> : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-t">
              {columns.map((column) => <td key={column} className="px-4 py-3">{String(row[column] ?? "")}</td>)}
              {getActions ? <td className="px-4 py-3"><AdminRowActions actions={getActions(row)} /></td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
