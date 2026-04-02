"use client";

import { useEffect, useState } from "react";
import { Education } from "@/services/educationService";

interface EducationModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  errorMessage: string;
  profileId: number | null;
  onClose: () => void;
  onSave: (data: Education) => Promise<void>;
  initialData?: Education | null;
}

const createEmptyEducation = (profileId?: number | null): Education => ({
  degreeName: "",
  instituteName: "",
  fromDate: "",
  toDate: "",
  shortDescription: "",
  profileId: profileId ?? undefined,
});

export default function EducationModal({
  isOpen,
  isSubmitting,
  errorMessage,
  profileId,
  onClose,
  onSave,
  initialData,
}: EducationModalProps) {
  const [formData, setFormData] = useState<Education>(
    createEmptyEducation(profileId)
  );
  const [isPresent, setIsPresent] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    if (initialData) {
      setFormData({
        ...initialData,
        toDate: initialData.toDate ?? "",
        profileId: initialData.profileId ?? profileId ?? undefined,
      });
      setIsPresent(!initialData.toDate);
    } else {
      setFormData(createEmptyEducation(profileId));
      setIsPresent(false);
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, initialData, profileId]);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    await onSave({
      ...formData,
      profileId: formData.profileId ?? profileId ?? undefined,
      toDate: isPresent ? null : formData.toDate,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[70] overflow-y-auto bg-slate-950/70 px-3 py-3 backdrop-blur-md sm:px-4 sm:py-6"
      onClick={onClose}
    >
      <div
        className="mx-auto flex w-full max-w-3xl flex-col overflow-hidden rounded-[30px] border border-slate-700 bg-slate-900 text-white shadow-[0_32px_80px_-30px_rgba(15,23,42,0.95)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="shrink-0 border-b border-slate-800 px-5 py-5 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-400">
                Education
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-white">
                {initialData ? "Edit Education" : "Add Education"}
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Add your academic journey in the same premium admin style.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300 transition-colors hover:border-slate-500 hover:text-white"
            >
              Close
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="shrink-0 px-5 pt-4 sm:px-6">
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              {errorMessage}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
            <div className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Degree Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.degreeName}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        degreeName: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition-colors focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Institute Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.instituteName}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        instituteName: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition-colors focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    From Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.fromDate}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        fromDate: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition-colors focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    To Date
                  </label>
                  <input
                    type="date"
                    required={!isPresent}
                    disabled={isPresent}
                    value={formData.toDate ?? ""}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        toDate: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition-colors focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>

              <label className="flex w-max cursor-pointer items-center gap-2 rounded-full border border-slate-800 bg-slate-950 px-4 py-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-blue-600"
                  checked={isPresent}
                  onChange={(event) => {
                    const checked = event.target.checked;
                    setIsPresent(checked);

                    if (checked) {
                      setFormData((prev) => ({
                        ...prev,
                        toDate: "",
                      }));
                    }
                  }}
                />
                <span>I am currently studying here</span>
              </label>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Description
                </label>
                <textarea
                  required
                  rows={5}
                  value={formData.shortDescription}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      shortDescription: event.target.value,
                    }))
                  }
                  placeholder="Write about your studies, achievements, specialization, or highlights..."
                  className="w-full resize-none rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition-colors focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="shrink-0 border-t border-slate-800 bg-slate-900/95 px-5 py-4 sm:px-6">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-medium text-slate-300 transition-colors hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !profileId}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting
                  ? initialData
                    ? "Saving..."
                    : "Creating..."
                  : initialData
                    ? "Save Changes"
                    : "Create Education"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
