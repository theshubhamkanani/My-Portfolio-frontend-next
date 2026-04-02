"use client";

import { useEffect, useState } from "react";
import AdminProfileSelector from "@/components/AdminProfileSelector";
import {
  EditIcon,
  ExternalLinkIcon,
  GithubIcon,
  TrashIcon,
} from "@/components/AdminActionIcons";
import ProjectModal from "@/components/ProjectModal";
import useAdminProfileSelection from "@/hooks/useAdminProfileSelection";
import {
  addProject,
  deleteProject,
  getAdminProjects,
  Project,
  updateProject,
} from "@/services/projectService";

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const formatProjectDate = (value: string | null) => {
  if (!value) return "Present";
  if (!value.includes("-")) return value;

  const [yearText, monthText] = value.split("-");
  const year = Number(yearText);
  const month = Number(monthText);

  if (!year || !month || month < 1 || month > 12) return value;
  return `${monthNames[month - 1]} ${year}`;
};

const getProjectMonogram = (projectName: string) => {
  const parts = projectName.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (parts.length === 0) return "PR";
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
};

export default function ProjectsPage() {
  const {
    profiles,
    selectedProfile,
    selectedProfileId,
    setSelectedProfileId,
    isProfilesLoading,
    profilesError,
  } = useAdminProfileSelection();

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageMessage, setPageMessage] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [modalError, setModalError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);

  const loadProjects = async (profileId?: number | null) => {
    if (!profileId) {
      setProjects([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await getAdminProjects(profileId);
      setProjects(data);
    } catch (error) {
      console.error("Failed to load projects", error);
      setPageMessage("Unable to load projects right now.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects(selectedProfileId);
  }, [selectedProfileId]);

  const openCreateModal = () => {
    if (!selectedProfileId) return;
    setEditingProject(null);
    setModalError("");
    setIsModalOpen(true);
  };

  const openEditModal = (project: Project) => {
    setEditingProject({
      ...project,
      profileId: project.profileId ?? selectedProfileId ?? undefined,
      githubLink: project.githubLink ?? null,
      liveLink: project.liveLink ?? null,
      endDate: project.endDate ?? null,
      skills: project.skills ?? [],
    });
    setModalError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSaving) return;
    setModalError("");
    setIsModalOpen(false);
    setEditingProject(null);
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

  const handleSaveProject = async (payload: Project) => {
    try {
      setIsSaving(true);
      setModalError("");
      setPageMessage("");

      const finalPayload = {
        ...payload,
        profileId: payload.profileId ?? selectedProfileId ?? undefined,
      };

      if (editingProject?.id) {
        await updateProject(editingProject.id, finalPayload);
        setPageMessage(`"${payload.projectName}" updated successfully.`);
      } else {
        await addProject(finalPayload);
        setPageMessage(`"${payload.projectName}" created successfully.`);
      }

      await loadProjects(selectedProfileId);
      setIsModalOpen(false);
      setEditingProject(null);
    } catch (error) {
      console.error("Failed to save project", error);
      setModalError(
        extractErrorMessage(error, "Unable to save project right now.")
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProject = async (project: Project) => {
    if (!project.id) return;

    const confirmed = window.confirm(`Delete "${project.projectName}"?`);
    if (!confirmed) return;

    try {
      setIsDeletingId(project.id);
      setPageMessage("");

      await deleteProject(project.id);
      await loadProjects(selectedProfileId);

      setPageMessage(`"${project.projectName}" deleted successfully.`);
    } catch (error) {
      console.error("Failed to delete project", error);
      setPageMessage(
        extractErrorMessage(error, "Unable to delete project right now.")
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
            <h1 className="text-4xl font-bold tracking-tight">Projects</h1>
            <p className="mt-2 text-lg text-slate-400">
              Manage builds for the selected profile
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
              + Add Project
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
            <div className="py-20 text-center text-slate-400">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="py-20 text-center">
              <h2 className="text-2xl font-semibold text-white">
                No projects for {selectedProfile?.fullName || "this profile"}.
              </h2>
              <p className="mt-3 text-slate-400">
                Add the first project for the selected profile.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {projects.map((project) => (
                <article
                  key={project.id}
                  className="group relative overflow-hidden rounded-[32px] border border-slate-800 bg-slate-950/60 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-slate-600/70 hover:bg-slate-950/80 hover:shadow-[0_28px_70px_-34px_rgba(15,23,42,0.95)]"
                >
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.16),_transparent_45%)] opacity-70" />
                  <div className="relative">
                    <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-sm font-semibold tracking-[0.2em] text-slate-300">
                          {getProjectMonogram(project.projectName)}
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-400">
                            Project
                          </p>

                          <h2 className="mt-3 text-3xl font-semibold text-white">
                            {project.projectName}
                          </h2>

                          <div className="mt-2 flex flex-wrap items-center gap-3 text-slate-300">
                            <span className="text-lg">{project.organizationName}</span>
                            <span className="hidden h-1.5 w-1.5 rounded-full bg-slate-600 sm:block" />
                            <span className="text-sm text-slate-400">{project.designation}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-xs font-medium text-slate-300">
                          {formatProjectDate(project.startDate)} -{" "}
                          {project.isCurrentProject
                            ? "Present"
                            : formatProjectDate(project.endDate)}
                        </span>

                        {project.isCurrentProject && (
                          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-medium text-emerald-300">
                            Current Project
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="mt-6 max-w-5xl leading-7 text-slate-300">
                      {project.description}
                    </p>

                    {(project.githubLink || project.liveLink) && (
                      <div className="mt-6 flex flex-wrap gap-3">
                        {project.githubLink && (
                          <a
                            href={project.githubLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200 transition-colors hover:border-slate-500 hover:text-white"
                          >
                            <GithubIcon className="h-4 w-4" />
                            GitHub Repo
                          </a>
                        )}

                        {project.liveLink && (
                          <a
                            href={project.liveLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-4 py-2 text-sm text-blue-200 transition-colors hover:border-blue-400/60 hover:bg-blue-500/20 hover:text-white"
                          >
                            <ExternalLinkIcon className="h-4 w-4" />
                            Live Demo
                          </a>
                        )}
                      </div>
                    )}

                    {project.skills.length > 0 && (
                      <div className="mt-6 flex flex-wrap gap-2">
                        {project.skills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-300"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-6 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => openEditModal(project)}
                        className="flex h-12 w-12 items-center justify-center rounded-full border border-sky-500/25 bg-sky-500/10 text-sky-300 transition-colors hover:border-sky-400/60 hover:bg-sky-500/20 hover:text-sky-100"
                        aria-label={`Edit ${project.projectName}`}
                      >
                        <EditIcon className="h-5 w-5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteProject(project)}
                        disabled={isDeletingId === project.id}
                        className="flex h-12 w-12 items-center justify-center rounded-full border border-red-500/25 bg-red-500/10 text-red-300 transition-colors hover:border-red-400/60 hover:bg-red-500/20 hover:text-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                        aria-label={`Delete ${project.projectName}`}
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

        <ProjectModal
          isOpen={isModalOpen}
          isSubmitting={isSaving}
          errorMessage={modalError}
          profileId={selectedProfileId}
          onClose={closeModal}
          onSave={handleSaveProject}
          initialData={editingProject}
        />
      </div>
    </main>
  );
}
