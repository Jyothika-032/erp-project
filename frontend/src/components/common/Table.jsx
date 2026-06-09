import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal, Edit, Trash2 } from 'lucide-react';

const Table = ({ 
  columns, 
  data, 
  onEdit, 
  onDelete, 
  actions = true,
  renderActions,
  pagination = true,
  currentPage = 1,
  totalPages = 1,
  onPageChange
}) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm shadow-slate-200/50">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              {columns.map((col, index) => (
                <th 
                  key={index} 
                  className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest"
                >
                  {col.header}
                </th>
              ))}
              {(actions || renderActions) && (
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.map((row, rowIndex) => (
              <tr 
                key={rowIndex} 
                className="hover:bg-slate-50/80 transition-colors group"
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="px-6 py-4">
                    {col.render ? col.render(row) : (
                      <span className="text-sm font-medium text-slate-600">
                        {row[col.accessor]}
                      </span>
                    )}
                  </td>
                ))}
                {(actions || renderActions) && (
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 transition-opacity">
                      {renderActions ? renderActions(row) : (
                        <>
                          {onEdit && (
                            <button 
                              onClick={() => onEdit(row)}
                              className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                            >
                              <Edit size={16} strokeWidth={2.5} />
                            </button>
                          )}
                          {onDelete && (
                            <button 
                              onClick={() => onDelete(row)}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 size={16} strokeWidth={2.5} />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && totalPages > 1 && (
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-500">
            Showing <span className="text-slate-700 font-bold">1 to {data.length}</span> of <span className="text-slate-700 font-bold">100</span> entries
          </p>
          
          <div className="flex items-center gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="p-2 text-slate-400 hover:text-primary hover:bg-white rounded-lg border border-transparent hover:border-slate-200 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            >
              <ChevronLeft size={18} strokeWidth={2.5} />
            </button>
            
            {[...Array(totalPages)].map((_, i) => (
              <button 
                key={i}
                onClick={() => onPageChange(i + 1)}
                className={`
                  w-9 h-9 rounded-lg text-sm font-bold transition-all
                  ${currentPage === i + 1 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'text-slate-500 hover:bg-white border border-transparent hover:border-slate-200'}
                `}
              >
                {i + 1}
              </button>
            ))}

            <button 
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="p-2 text-slate-400 hover:text-primary hover:bg-white rounded-lg border border-transparent hover:border-slate-200 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            >
              <ChevronRight size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export { Table }; export default Table;
