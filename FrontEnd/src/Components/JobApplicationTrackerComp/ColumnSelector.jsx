import React from "react";

export default function ColumnSelector({
  isOpen,
  onClose,
  columns,
  visibleColumns,
  onToggleColumn,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-900 border border-black/[0.08] dark:border-white/[0.1] rounded-3xl p-6 w-full max-w-md shadow-xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
          <h3 className="font-['Outfit'] text-lg font-bold text-[#1a1a1a] dark:text-zinc-100">
            Customize Columns
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#EDEEF5] dark:bg-zinc-800 flex items-center justify-center text-[#8e8e8e] dark:text-zinc-400 hover:text-[#1a1a1a] dark:hover:text-zinc-100 transition"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
          {columns.map((col) => {
            const checked = visibleColumns.includes(col.key);
            return (
              <label
                key={col.key}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-black/[0.03] dark:hover:bg-white/[0.05] cursor-pointer transition"
              >
                <span className="text-xs font-medium text-[#1a1a1a] dark:text-zinc-200">
                  {col.label}
                </span>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleColumn(col.key)}
                  className="w-4 h-4 rounded border-black/[0.2] dark:border-white/[0.2] text-[#1a1a1a] dark:text-[#9fff00] focus:ring-black dark:focus:ring-white/20 accent-[#1a1a1a] dark:accent-[#9fff00] cursor-pointer"
                />
              </label>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-black/[0.06] dark:border-white/[0.08] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#1a1a1a] hover:bg-black dark:bg-[#9fff00] dark:hover:bg-[#8fee00] text-white dark:text-black text-xs font-semibold rounded-full shadow-xs transition hover:scale-[1.02]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
