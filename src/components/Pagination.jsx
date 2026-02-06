import React from 'react';

export default function Pagination({ page=1, totalPages=1, onChange }){
  if (totalPages <= 1) return null;
  const pages = [];
  for (let i=1;i<=totalPages;i++) pages.push(i);
  return (
    <nav className="pagination">
      {pages.map(p => (
        <button key={p} onClick={() => onChange && onChange(p)} disabled={p===page}>
          {p}
        </button>
      ))}
    </nav>
  );
}
