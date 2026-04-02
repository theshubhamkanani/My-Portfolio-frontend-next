"use client";

import { useEffect, useState } from "react";
import { CreateSkillCategoryPayload } from "@/services/skillService";

interface AddSkillModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  errorMessage: string;
  profileId: number | null;
  onClose: () => void;
  onCreate: (payload: CreateSkillCategoryPayload) => Promise<void>;
}

export default function AddSkillModal({
  isOpen,
  isSubmitting,
  errorMessage,
  profileId,
  onClose,
  onCreate,
}: AddSkillModalProps) {
  const [categoryName, setCategoryName] = useState("");
  const [skillName, setSkillName] = useState("");
  const [level, setLevel] = useState("80");

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    setCategoryName("");
    setSkillName("");
    setLevel("80");

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    await onCreate({
      name: categoryName.trim(),
      profileId: profileId ?? undefined,
      skills: [
        {
          name: skillName.trim(),
          level: Number(level),
        },
      ],
    });
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/65 px-4 py-8 backdrop-blur-md"
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
            <h2 className="mt-3 text-2xl font-semibold text-white">Add Skill</h2>
            <p className="mt-2 text-sm text-slate-400">
              Create a new skill category and add the first skill inside it.
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
              Skill Category Name
            </label>
            <input
              type="text"
              required
              value={categoryName}
              onChange={(event) => setCategoryName(event.target.value)}
              placeholder="e.g. Frontend Development"
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition-colors focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Skill Name
            </label>
            <input
              type="text"
              required
              value={skillName}
              onChange={(event) => setSkillName(event.target.value)}
              placeholder="e.g. React.js"
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition-colors focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Skill Level
            </label>
            <div className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-slate-400">Proficiency</span>
                <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
                  {level}%
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={level}
                onChange={(event) => setLevel(event.target.value)}
                className="h-2 w-full cursor-pointer accent-blue-500"
              />

              <input
                type="number"
                min="0"
                max="100"
                required
                value={level}
                onChange={(event) => setLevel(event.target.value)}
                className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none transition-colors focus:border-blue-500"
              />
            </div>
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
              disabled={isSubmitting || !profileId}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
