"use client";

import { useEffect, useState } from "react";
import { SkillItem, UpdateSkillPayload } from "@/services/skillService";

interface EditSkillModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  errorMessage: string;
  skill: SkillItem | null;
  categoryName?: string;
  onClose: () => void;
  onSave: (payload: UpdateSkillPayload) => Promise<void>;
}

export default function EditSkillModal({
  isOpen,
  isSubmitting,
  errorMessage,
  skill,
  categoryName,
  onClose,
  onSave,
}: EditSkillModalProps) {
  const [skillName, setSkillName] = useState("");
  const [level, setLevel] = useState("80");

  useEffect(() => {
    if (!isOpen || !skill) return;

    setSkillName(skill.name);
    setLevel(String(skill.level ?? 80));
  }, [isOpen, skill]);

  if (!isOpen || !skill) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    await onSave({
      name: skillName.trim(),
      level: Number(level),
      categoryId: skill.categoryId,
    });
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
            <h2 className="mt-3 text-2xl font-semibold text-white">Edit Skill</h2>
            <p className="mt-2 text-sm text-slate-400">
              Update the skill name and proficiency level.
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
              Skill Category
            </label>
            <input
              type="text"
              value={categoryName ?? skill.categoryName ?? ""}
              readOnly
              className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-400 outline-none"
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
              disabled={isSubmitting}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
