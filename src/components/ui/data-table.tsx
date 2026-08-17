import * as React from 'react'
import { cn } from '@/lib/utils'

interface DataTableProps<TData> {
  columns: Array<{
    header: string
    accessorKey: string
    cell?: (row: { original: TData }) => React.ReactNode
  }>
  data: TData[]
  searchKey?: string
  emptyState?: React.ReactNode
  className?: string
}

export function DataTable<TData>({
  columns,
  data,
  searchKey,
  emptyState,
  className,
}: DataTableProps<TData>) {
  return (
    <div className={cn('space-y-4', className)}>
      {searchKey && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder={`Search ${searchKey}...`}
            className="input max-w-sm"
          />
        </div>
      )}

      <div className="rounded-md border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.accessorKey}
                  className="px-4 py-3 text-left font-medium text-slate-500"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {data.length > 0 ? (
              data.map((row, index) => (
                <tr key={index} className="hover:bg-slate-50">
                  {columns.map((column) => (
                    <td key={column.accessorKey} className="px-4 py-3">
                      {column.cell
                        ? column.cell({ original: row })
                        : (row as Record<string, unknown>)[column.accessorKey]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8">
                  {emptyState || (
                    <div className="text-center text-sm text-slate-500">
                      No results found.
                    </div>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
