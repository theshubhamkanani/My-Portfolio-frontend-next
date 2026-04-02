"use client";

import { useEffect, useState } from "react";
import AdminProfileSelector from "@/components/AdminProfileSelector";
import { EditIcon, TrashIcon } from "@/components/AdminActionIcons";
import EducationModal from "@/components/EducationModal";
import useAdminProfileSelection from "@/hooks/useAdminProfileSelection";
import {
  addEducation,
  deleteEducation,
  Education,
  getAdminEducations,
  updateEducation,
} from "@/services/educationService";

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const formatEducationDate = (value: string | null) => {
  if (!value) return "Present";

  const [yearText, monthText] = value.split("-");
  const year = Number(yearText);
  const month = Number(monthText);

  if (!year || !month || month < 1 || month > 12) return value;
  return `${monthNames[month - 1]} ${year}`;
};

const getInstituteMonogram = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (parts.length === 0) return "ED";
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
};

export default function EducationPage() {
  const {
    profiles,
    selectedProfile,
    selectedProfileId,
    setSelectedProfileId,
    isProfilesLoading,
    profilesError,
  } = useAdminProfileSelection();

  const [educations, setEducations] = useState<Education[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageMessage, setPageMessage] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
  const [modalError, setModalError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);

  const loadEducations = async (profileId?: number | null) => {
    if (!profileId) {
      setEducations([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await getAdminEducations(profileId);
      setEducations(data);
    } catch (error) {
      console.error("Failed to load educations", error);
      setPageMessage("Unable to load education records right now.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEducations(selectedProfileId);
  }, [selectedProfileId]);

  const openCreateModal = () => {
    if (!selectedProfileId) return;
    setEditingEducation(null);
    setModalError("");
    setIsModalOpen(true);
  };

  const openEditModal = (education: Education) => {
    setEditingEducation({
      ...education,
      profileId: education.profileId ?? selectedProfileId ?? undefined,
      toDate: education.toDate ?? null,
    });
    setModalError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSaving) return;
    setModalError("");
    setIsModalOpen(false);
    setEditingEducation(null);
  };

  const extractErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof Error && error.message) return error.message;

    if (typeof error === "object" && error !== null && "response" in error) {
      const response = (error as { response?: { data?: unknown } }).response;

      if (typeof response?.data === "string") return response.data;

      if (
        response?.data &&
        typeof response.data === "object" &&
        "message" in response.data &&
        typeof (response.data as { message?: unknown }).message === "string"
      ) {
        return (response.data as { message: string }).message;
      }
    }

    return fallback;
  };

  const handleSaveEducation = async (payload: Education) => {
    try {
      setIsSaving(true);
      setModalError("");
      setPageMessage("");

      const finalPayload = {
        ...payload,
        profileId: payload.profileId ?? selectedProfileId ?? undefined,
      };

      if (editingEducation?.id) {
        await updateEducation(editingEducation.id, finalPayload);
        setPageMessage(`"${payload.degreeName}" updated successfully.`);
      } else {
        await addEducation(finalPayload);
        setPageMessage(`"${payload.degreeName}" created successfully.`);
      }

      await loadEducations(selectedProfileId);
      setIsModalOpen(false);
      setEditingEducation(null);
    } catch (error) {
      console.error("Failed to save education", error);
      setModalError(
        extractErrorMessage(error, "Unable to save education right now.")
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEducation = async (education: Education) => {
    if (!education.id) return;

    const confirmed = window.confirm(`Delete "${education.degreeName}"?`);
    if (!confirmed) return;

    try {
      setIsDeletingId(education.id);
      setPageMessage("");

      await deleteEducation(education.id);
      await loadEducations(selectedProfileId);

      setPageMessage(`"${education.degreeName}" deleted successfully.`);
    } catch (error) {
      console.error("Failed to delete education", error);
      setPageMessage(
        extractErrorMessage(error, "Unable to delete education right now.")
      );
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 px-4 py-6 text-white sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto w-full max-w-7xl">
        <header className="border-b border-slate-800 pb-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight">Education</h1>
            <p className="mt-2 text-lg text-slate-400">
              Manage education for the selected profile
            </p>
          </div>

          <div className="mt-8">
            <AdminProfileSelector
              profiles={profiles}
              selectedProfile={selectedProfile}
              selectedProfileId={selectedProfileId}
              isLoading={isProfilesLoading}
              onChange={setSelectedProfileId}
            />
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={openCreateModal}
              disabled={!selectedProfileId}
              className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              + Add Education
            </button>
          </div>
        </header>

        {(profilesError || pageMessage) && (
          <div className="mt-6 rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-200">
            {profilesError || pageMessage}
          </div>
        )}

        <section className="mt-10">
          {isLoading ? (
            <div className="py-20 text-center text-slate-400">
              Loading education history...
            </div>
          ) : educations.length === 0 ? (
            <div className="py-20 text-center">
              <h2 className="text-2xl font-semibold text-white">
                No education records for {selectedProfile?.fullName || "this profile"}.
              </h2>
              <p className="mt-3 text-slate-400">
                Add the first education entry for the selected profile.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {educations.map((education) => (
                <article
                  key={education.id}
                  className="group relative overflow-hidden rounded-[32px] border border-slate-800 bg-slate-950/60 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-slate-600/70 hover:bg-slate-950/80 hover:shadow-[0_28px_70px_-34px_rgba(15,23,42,0.95)]"
                >
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.16),_transparent_45%)] opacity-70" />
                  <div className="relative">
                    <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-sm font-semibold tracking-[0.2em] text-slate-300">
                          {getInstituteMonogram(education.instituteName)}
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-400">
                            Education
                          </p>

                          <h2 className="mt-3 text-3xl font-semibold text-white">
                            {education.degreeName}
                          </h2>

                          <div className="mt-2 flex flex-wrap items-center gap-3 text-slate-300">
                            <span className="text-lg">{education.instituteName}</span>
                          </div>
                        </div>
                      </div>

                      <span className="rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-xs font-medium text-slate-300">
                        {formatEducationDate(education.fromDate)} -{" "}
                        {education.toDate ? formatEducationDate(education.toDate) : "Present"}
                      </span>
                    </div>

                    <p className="mt-6 max-w-5xl leading-7 text-slate-300">
                      {education.shortDescription}
                    </p>

                    <div className="mt-6 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => openEditModal(education)}
                        className="flex h-12 w-12 items-center justify-center rounded-full border border-sky-500/25 bg-sky-500/10 text-sky-300 transition-colors hover:border-sky-400/60 hover:bg-sky-500/20 hover:text-sky-100"
                        aria-label={`Edit ${education.degreeName}`}
                      >
                        <EditIcon className="h-5 w-5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteEducation(education)}
                        disabled={isDeletingId === education.id}
                        className="flex h-12 w-12 items-center justify-center rounded-full border border-red-500/25 bg-red-500/10 text-red-300 transition-colors hover:border-red-400/60 hover:bg-red-500/20 hover:text-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                        aria-label={`Delete ${education.degreeName}`}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <EducationModal
          isOpen={isModalOpen}
          isSubmitting={isSaving}
          errorMessage={modalError}
          profileId={selectedProfileId}
          onClose={closeModal}
          onSave={handleSaveEducation}
          initialData={editingEducation}
        />
      </div>
    </main>
  );
}
