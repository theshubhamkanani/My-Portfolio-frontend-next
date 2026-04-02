"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { AdminProfile } from "@/services/aboutService";

interface AboutProfileModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  errorMessage: string;
  mode: "create" | "edit";
  initialData: AdminProfile | null;
  onClose: () => void;
  onSave: (data: AdminProfile, imageFile?: File | null) => Promise<void>;
}

const createEmptyProfile = (): AdminProfile => ({
  fullName: "",
  profilePhotoUrl: null,
  titleLine: "",
  githubLink: "",
  linkedinLink: "",
  email: "",
  heroHeadline: null,
  heroDescription: null,
  aboutHeadline: null,
  aboutDescription: null,
  highlights: [],
});


const getMonogram = (value: string) => {
  const parts = value.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (parts.length === 0) return "PF";
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
};

export default function AboutProfileModal({
  isOpen,
  isSubmitting,
  errorMessage,
  mode,
  initialData,
  onClose,
  onSave,
}: AboutProfileModalProps) {
  const [formData, setFormData] = useState<AdminProfile>(createEmptyProfile());
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const nextFormData = initialData ? { ...initialData } : createEmptyProfile();

    setFormData(nextFormData);
    setSelectedImageFile(null);
    setPreviewUrl(nextFormData.profilePhotoUrl ?? "");

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, initialData]);

  useEffect(() => {
    if (!selectedImageFile) return;

    const objectUrl = URL.createObjectURL(selectedImageFile);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedImageFile]);

  if (!isOpen) return null;

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;

    setSelectedImageFile(file);
  };

  const handleRemoveImage = () => {
    setSelectedImageFile(null);
    setPreviewUrl("");
    setFormData((prev) => ({
      ...prev,
      profilePhotoUrl: null,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    await onSave(
      {
        ...formData,
        fullName: formData.fullName.trim(),
        titleLine: formData.titleLine.trim(),
        githubLink: formData.githubLink.trim(),
        linkedinLink: formData.linkedinLink.trim(),
        email: formData.email.trim(),
        profilePhotoUrl: formData.profilePhotoUrl?.trim() || null,
      },
      selectedImageFile
    );
  };

  const displayImageUrl = previewUrl || formData.profilePhotoUrl?.trim() || "";
  const displayName = formData.fullName.trim() || "Profile Preview";

  return (
    <div
      className="fixed inset-0 z-[70] overflow-y-auto bg-slate-950/70 px-3 py-3 backdrop-blur-md sm:px-4 sm:py-6"
      onClick={onClose}
    >
      <div
        className="mx-auto flex w-full max-w-4xl flex-col overflow-hidden rounded-[30px] border border-slate-700 bg-slate-900 text-white shadow-[0_32px_80px_-30px_rgba(15,23,42,0.95)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-slate-800 px-5 py-5 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-400">
                About Updation
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-white">
                {mode === "create" ? "Add Profile" : "Edit Profile"}
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                {mode === "create"
                  ? "Create a new profile and upload its profile image."
                  : "Update profile details and replace the profile image when needed."}
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
            <div className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
              <div className="rounded-[28px] border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Profile Preview
                </p>

                <div className="mt-4 flex justify-center">
                  <div className="flex h-44 w-44 items-center justify-center overflow-hidden rounded-[30px] border border-slate-700 bg-slate-900">
                    {displayImageUrl ? (
                      <img
                        src={displayImageUrl}
                        alt={displayName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-semibold tracking-[0.22em] text-slate-300">
                        {getMonogram(displayName)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <label className="flex cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700">
                    {selectedImageFile || displayImageUrl ? "Change Image" : "Choose Image"}
                    <input
                      type="file"
                      accept="image/png,image/jpeg"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={!displayImageUrl && !selectedImageFile}
                    className="w-full rounded-xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-300 transition-colors hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Remove Image
                  </button>

                  <p className="text-center text-xs text-slate-500">
                    JPG or PNG. Max 5MB.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(event) =>
                        setFormData((prev) => ({
                          ...prev,
                          fullName: event.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition-colors focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(event) =>
                        setFormData((prev) => ({
                          ...prev,
                          email: event.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition-colors focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Title Line
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.titleLine}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        titleLine: event.target.value,
                      }))
                    }
                    placeholder="e.g. Backend Developer | Problem Solver"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition-colors focus:border-blue-500"
                  />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      GitHub Link
                    </label>
                    <input
                      type="url"
                      value={formData.githubLink}
                      onChange={(event) =>
                        setFormData((prev) => ({
                          ...prev,
                          githubLink: event.target.value,
                        }))
                      }
                      placeholder="https://github.com/your-profile"
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition-colors focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      LinkedIn Link
                    </label>
                    <input
                      type="url"
                      value={formData.linkedinLink}
                      onChange={(event) =>
                        setFormData((prev) => ({
                          ...prev,
                          linkedinLink: event.target.value,
                        }))
                      }
                      placeholder="https://linkedin.com/in/your-profile"
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition-colors focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
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
                disabled={isSubmitting}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting
                  ? mode === "create"
                    ? "Creating..."
                    : "Saving..."
                  : mode === "create"
                    ? "Create Profile"
                    : "Save Profile"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
