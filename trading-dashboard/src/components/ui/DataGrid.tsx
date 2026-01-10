import { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { useState } from 'react';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface DataGridProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  searchable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  className?: string;
}

export function DataGrid<T>({
  data,
  columns,
  searchable = true,
  pagination = true,
  pageSize = 10,
  className = '',
}: DataGridProps<T>) {
  const { theme } = useTheme();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const isLight = theme === 'light';

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search */}
      {searchable && (
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
            isLight ? 'text-gray-500' : 'text-gray-400'
          }`} />
          <input
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search all columns..."
            className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
              isLight
                ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                : 'bg-slate-700 border-slate-600 text-white placeholder-gray-400'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
      )}

      {/* Table */}
      <div className={`rounded-lg border overflow-hidden ${
        isLight ? 'border-gray-200' : 'border-slate-700'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={isLight ? 'bg-gray-50' : 'bg-slate-800'}>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isLight ? 'text-gray-500' : 'text-gray-400'
                      } ${header.column.getCanSort() ? 'cursor-pointer select-none' : ''}`}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-2">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())
                        }
                        {header.column.getCanSort() && (
                          <div className="flex flex-col">
                            <ChevronUp 
                              className={`w-3 h-3 ${
                                header.column.getIsSorted() === 'asc' 
                                  ? 'text-blue-500' 
                                  : 'text-gray-400'
                              }`} 
                            />
                            <ChevronDown 
                              className={`w-3 h-3 -mt-1 ${
                                header.column.getIsSorted() === 'desc' 
                                  ? 'text-blue-500' 
                                  : 'text-gray-400'
                              }`} 
                            />
                          </div>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className={`divide-y ${isLight ? 'divide-gray-200 bg-white' : 'divide-slate-700 bg-slate-800'}`}>
              {table.getRowModel().rows.map((row) => (
                <tr 
                  key={row.id}
                  className={`transition-colors ${
                    isLight ? 'hover:bg-gray-50' : 'hover:bg-slate-700'
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td 
                      key={cell.id}
                      className={`px-4 py-3 text-sm ${
                        isLight ? 'text-gray-900' : 'text-white'
                      }`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between">
          <div className={`text-sm ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{' '}
            of {table.getFilteredRowModel().rows.length} results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className={`px-3 py-1 rounded border ${
                isLight
                  ? 'border-gray-300 text-gray-700 hover:bg-gray-50 disabled:text-gray-400'
                  : 'border-slate-600 text-gray-300 hover:bg-slate-700 disabled:text-gray-500'
              } disabled:cursor-not-allowed`}
            >
              Previous
            </button>
            <span className={`text-sm ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className={`px-3 py-1 rounded border ${
                isLight
                  ? 'border-gray-300 text-gray-700 hover:bg-gray-50 disabled:text-gray-400'
                  : 'border-slate-600 text-gray-300 hover:bg-slate-700 disabled:text-gray-500'
              } disabled:cursor-not-allowed`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}