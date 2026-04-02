"use client";

import { useEffect, useState } from "react";

interface EditCategoryModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  errorMessage: string;
  initialName: string;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
}

export default function EditCategoryModal({
  isOpen,
  isSubmitting,
  errorMessage,
  initialName,
  onClose,
  onSave,
}: EditCategoryModalProps) {
  const [categoryName, setCategoryName] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setCategoryName(initialName);

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, initialName]);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSave(categoryName.trim());
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 px-4 py-8 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-[28px] border border-slate-700 bg-slate-900 p-6 text-white shadow-[0_32px_80px_-30px_rgba(15,23,42,0.95)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-400">
              Technical Expertise
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Edit Category</h2>
            <p className="mt-2 text-sm text-slate-400">
              Rename your current skill category.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300 transition-colors hover:border-slate-500 hover:text-white"
          >
            Close
          </button>
        </div>

        {errorMessage && (
          <div className="mb-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Category Name
            </label>
            <input
              type="text"
              required
              value={categoryName}
              onChange={(event) => setCategoryName(event.target.value)}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition-colors focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-medium text-slate-300 transition-colors hover:border-slate-500 hover:text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Saving..." : "Save Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
