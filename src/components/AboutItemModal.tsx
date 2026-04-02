"use client";

import { useEffect, useState } from "react";
import { AboutItemPayload } from "@/services/aboutService";

interface TypeOption {
  value: string;
  label: string;
}

interface AboutItemModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  errorMessage: string;
  itemLabel: string;
  textLabel: string;
  textPlaceholder: string;
  showTypeField?: boolean;
  multiline?: boolean;
  typeOptions?: TypeOption[];
  initialData: AboutItemPayload | null;
  profileId: number | null;
  onClose: () => void;
  onSave: (data: AboutItemPayload) => Promise<void>;
}

export default function AboutItemModal({
  isOpen,
  isSubmitting,
  errorMessage,
  itemLabel,
  textLabel,
  textPlaceholder,
  showTypeField = false,
  multiline = false,
  typeOptions = [],
  initialData,
  profileId,
  onClose,
  onSave,
}: AboutItemModalProps) {
  const [formData, setFormData] = useState<AboutItemPayload>({
    text: "",
    type: typeOptions[0]?.value ?? "",
    live: false,
    profileId: profileId ?? 0,
  });

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    setFormData({
      id: initialData?.id,
      text: initialData?.text ?? "",
      type: initialData?.type ?? typeOptions[0]?.value ?? "",
      live: initialData?.live ?? false,
      profileId: initialData?.profileId ?? profileId ?? 0,
    });

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, initialData, profileId, typeOptions]);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSave(formData);
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
        <div className="border-b border-slate-800 px-5 py-5 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-400">
                About Updation
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-white">
                {initialData?.id ? `Edit ${itemLabel}` : `Add ${itemLabel}`}
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Manage your {itemLabel.toLowerCase()} content from here.
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
          <div className="px-5 pt-4 sm:px-6">
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              {errorMessage}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  {textLabel}
                </label>

                {multiline ? (
                  <textarea
                    required
                    rows={5}
                    value={formData.text}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        text: event.target.value,
                      }))
                    }
                    placeholder={textPlaceholder}
                    className="w-full resize-none rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition-colors focus:border-blue-500"
                  />
                ) : (
                  <input
                    type="text"
                    required
                    value={formData.text}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        text: event.target.value,
                      }))
                    }
                    placeholder={textPlaceholder}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition-colors focus:border-blue-500"
                  />
                )}
              </div>

              {showTypeField && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Section Type
                  </label>

                  <select
                    required
                    value={formData.type ?? ""}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        type: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition-colors focus:border-blue-500"
                  >
                    {typeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <p className="mt-2 text-xs text-slate-500">
                    Only one item can be live at a time for the same type.
                  </p>
                </div>
              )}

              {initialData?.id ? (
                <div className="rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-300">
                  {initialData.live
                    ? "This item is currently live."
                    : "Use the Make Live button from the list to publish this item."}
                </div>
              ) : null}
            </div>
          </div>

          <div className="border-t border-slate-800 bg-slate-900/95 px-5 py-4 sm:px-6">
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
                disabled={isSubmitting || !formData.profileId}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting
                  ? initialData?.id
                    ? "Saving..."
                    : "Creating..."
                  : initialData?.id
                    ? `Save ${itemLabel}`
                    : `Create ${itemLabel}`}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
