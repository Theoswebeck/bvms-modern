import React, { useState, useMemo } from 'react';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
} from 'lucide-react';

/**
 * Reusable University of Kigali DataTable Component
 * Provides:
 * - "Show [5 / 10 / 25 / 50 / 100] entries" page size selector
 * - Instant search across all row fields
 * - Column header click sorting (asc / desc)
 * - CSV Export button
 * - "Showing X to Y of Z entries" summary & page number buttons
 */
export default function DataTable({
  columns = [],
  data = [],
  keyField = 'id',
  searchPlaceholder = 'Search records...',
  defaultPageSize = 10,
  exportFileName = 'UoK_BVMS_Export',
  onRowClick = null,
  rowClassName = null,
  emptyMessage = 'No matching records found in table.',
  headerRight = null,
}) {
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  // 1. Filter rows by search query
  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      Object.values(row).some(
        (val) => val !== null && val !== undefined && String(val).toLowerCase().includes(q)
      )
    );
  }, [data, search]);

  // 2. Sort rows by active sortKey
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const valA = a[sortKey] ?? '';
      const valB = b[sortKey] ?? '';
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDir === 'asc' ? valA - valB : valB - valA;
      }
      return sortDir === 'asc'
        ? String(valA).localeCompare(String(valB), undefined, { numeric: true })
        : String(valB).localeCompare(String(valA), undefined, { numeric: true });
    });
  }, [filteredData, sortKey, sortDir]);

  // 3. Paginate
  const totalEntries = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedData = sortedData.slice(startIndex, startIndex + pageSize);

  const handleSort = (key) => {
    if (!key) return;
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const handleExportCsv = () => {
    const exportCols = columns.filter((c) => c.accessor);
    const escapeCell = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;
    const headers = exportCols.map((c) => escapeCell(c.header));
    const rows = sortedData.map((row) =>
      exportCols.map((c) => escapeCell(row[c.accessor])).join(',')
    );
    const csvString = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${exportFileName}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Top DataTable Controls Bar */}
      <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Show N entries */}
        <div className="flex items-center gap-2 text-slate-600 font-medium">
          <span>Show</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-bold text-slate-800 outline-none focus:border-[#6d1323]"
          >
            {[5, 10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span>entries</span>
        </div>

        {/* Right: Search box, optional custom header actions & CSV Export */}
        <div className="flex flex-wrap items-center gap-2.5">
          {headerRight}
          <div className="relative w-56 sm:w-64">
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 outline-none focus:border-[#6d1323] focus:ring-2 focus:ring-[#6d1323]/15"
            />
          </div>
          <button
            type="button"
            onClick={handleExportCsv}
            title="Export table to CSV"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold transition"
          >
            <Download size={14} />
            <span className="hidden sm:inline">CSV</span>
          </button>
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#6d1323] text-white uppercase tracking-wider text-[11px] select-none">
              {columns.map((col, i) => {
                const isSortable = Boolean(col.accessor) && col.sortable !== false;
                const isSorted = sortKey === col.accessor;
                return (
                  <th
                    key={i}
                    onClick={() => isSortable && handleSort(col.accessor)}
                    className={`py-3 px-4 font-bold ${
                      isSortable ? 'cursor-pointer hover:bg-[#580f1c] transition' : ''
                    } ${col.className || ''}`}
                  >
                    <div
                      className={`inline-flex items-center gap-1.5 ${
                        col.className?.includes('text-right') ? 'justify-end w-full' : ''
                      }`}
                    >
                      <span>{col.header}</span>
                      {isSortable && (
                        <span className="opacity-75">
                          {!isSorted ? (
                            <ArrowUpDown size={12} />
                          ) : sortDir === 'asc' ? (
                            <ArrowUp size={12} className="text-[#e39600]" />
                          ) : (
                            <ArrowDown size={12} className="text-[#e39600]" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-10 px-4 text-center text-slate-400 font-medium">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => {
                const globalIndex = startIndex + idx;
                const customRowCls = rowClassName ? rowClassName(row) : 'hover:bg-slate-50';
                return (
                  <tr
                    key={row[keyField] ?? globalIndex}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={`transition ${onRowClick ? 'cursor-pointer' : ''} ${customRowCls}`}
                  >
                    {columns.map((col, colIdx) => (
                      <td key={colIdx} className={`py-3 px-4 ${col.cellClassName || ''}`}>
                        {col.render ? col.render(row, globalIndex) : row[col.accessor]}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom DataTable Pagination Footer */}
      <div className="px-4 py-3 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-600">
        <div>
          Showing{' '}
          <strong className="text-slate-900">
            {totalEntries === 0 ? 0 : startIndex + 1}
          </strong>{' '}
          to{' '}
          <strong className="text-slate-900">
            {Math.min(startIndex + pageSize, totalEntries)}
          </strong>{' '}
          of <strong className="text-slate-900">{totalEntries}</strong> entries
          {search.trim() && data.length !== totalEntries && (
            <span className="text-slate-400"> (filtered from {data.length} total entries)</span>
          )}
        </div>

        {/* Page Buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={safePage === 1}
            onClick={() => setCurrentPage(1)}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
            title="First Page"
          >
            <ChevronsLeft size={14} />
          </button>
          <button
            type="button"
            disabled={safePage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 font-semibold disabled:opacity-40 inline-flex items-center gap-1"
          >
            <ChevronLeft size={13} />
            <span>Prev</span>
          </button>

          {[...Array(totalPages)].map((_, i) => {
            const pNum = i + 1;
            if (
              totalPages > 7 &&
              pNum !== 1 &&
              pNum !== totalPages &&
              Math.abs(pNum - safePage) > 1
            ) {
              if (pNum === 2 || pNum === totalPages - 1) {
                return (
                  <span key={pNum} className="px-1 text-slate-400">
                    ...
                  </span>
                );
              }
              return null;
            }
            return (
              <button
                key={pNum}
                type="button"
                onClick={() => setCurrentPage(pNum)}
                className={`px-2.5 py-1 rounded-lg font-bold border transition ${
                  safePage === pNum
                    ? 'bg-[#6d1323] text-white border-[#6d1323]'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {pNum}
              </button>
            );
          })}

          <button
            type="button"
            disabled={safePage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 font-semibold disabled:opacity-40 inline-flex items-center gap-1"
          >
            <span>Next</span>
            <ChevronRight size={13} />
          </button>
          <button
            type="button"
            disabled={safePage === totalPages}
            onClick={() => setCurrentPage(totalPages)}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
            title="Last Page"
          >
            <ChevronsRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
