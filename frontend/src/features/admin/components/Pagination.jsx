import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-between px-10 py-6 border-t border-slate-50 bg-white">
      <div className="flex items-center gap-2">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Page <span className="text-slate-900">{currentPage}</span> of <span className="text-slate-900">{totalPages}</span>
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 bg-white border border-slate-100 rounded-xl text-slate-400 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft size={16} />
        </button>
        
        <div className="flex items-center gap-1">
          {getPages().map((page, i) => (
            <button
              key={i}
              onClick={() => typeof page === 'number' && onPageChange(page)}
              disabled={page === '...'}
              className={`min-w-[40px] h-10 flex items-center justify-center rounded-xl text-[10px] font-black transition-all ${
                page === currentPage
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : page === '...'
                  ? 'text-slate-300 cursor-default'
                  : 'bg-white border border-slate-100 text-slate-400 hover:border-slate-300'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 bg-white border border-slate-100 rounded-xl text-slate-400 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
