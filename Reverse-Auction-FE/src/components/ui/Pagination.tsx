import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (value: React.SetStateAction<number>) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  setCurrentPage,
}: PaginationProps) {
  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <button
        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
        disabled={currentPage === 1}
        className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => setCurrentPage(p)}
          className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
            currentPage === p
              ? "bg-[#375F97] text-white shadow-md"
              : "border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          {p}
        </button>
      ))}

      {/* <span className="text-slate-400 text-sm font-medium px-1">...</span> */}

      {/* <button
        onClick={() => setCurrentPage(totalPages)}
        className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
          currentPage === totalPages
            ? "bg-[#375F97] text-white shadow-md"
            : "border border-slate-200 text-slate-600 hover:bg-slate-50"
        }`}
      >
        {totalPages}
      </button> */}

      <button
        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        disabled={currentPage === totalPages}
        className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
