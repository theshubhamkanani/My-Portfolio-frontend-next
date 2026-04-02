"use client";

import { useEffect, useState } from "react";
import { Project } from "@/services/projectService";
import { getAllSkills, Skill } from "@/services/skillService";

interface ProjectModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  errorMessage: string;
  profileId: number | null;
  onClose: () => void;
  onSave: (data: Project) => Promise<void>;
  initialData?: Project | null;
}

const createEmptyProject = (profileId?: number | null): Project => ({
  projectName: "",
  organizationName: "",
  designation: "",
  description: "",
  githubLink: "",
  liveLink: "",
  startDate: "",
  endDate: "",
  isCurrentProject: false,
  profileId: profileId ?? undefined,
  skills: [],
});

export default function ProjectModal({
  isOpen,
  isSubmitting,
  errorMessage,
  profileId,
  onClose,
  onSave,
  initialData,
}: ProjectModalProps) {
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [formData, setFormData] = useState<Project>(createEmptyProject(profileId));

  useEffect(() => {
    if (!isOpen) return;

    const fetchSkills = async () => {
      if (!profileId) {
        setAvailableSkills([]);
        return;
      }

      try {
        const data = await getAllSkills(profileId);
        setAvailableSkills(data);
      } catch (error) {
        console.error("Failed to fetch skills", error);
        setAvailableSkills([]);
      }
    };

    fetchSkills();
  }, [isOpen, profileId]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    if (initialData) {
      setFormData({
        ...initialData,
        githubLink: initialData.githubLink ?? "",
        liveLink: initialData.liveLink ?? "",
        endDate: initialData.endDate ?? "",
        profileId: initialData.profileId ?? profileId ?? undefined,
        skills: [...(initialData.skills ?? [])],
      });
    } else {
      setFormData(createEmptyProject(profileId));
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
      githubLink: formData.githubLink?.trim() || null,
      liveLink: formData.liveLink?.trim() || null,
      endDate: formData.isCurrentProject ? null : formData.endDate,
    });
  };

  const handleSkillSelect = (skillName: string) => {
    if (!skillName || formData.skills.includes(skillName)) return;

    setFormData((prev) => ({
      ...prev,
      skills: [...prev.skills, skillName],
    }));
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const availableSkillOptions = availableSkills.filter(
    (skill) => !formData.skills.includes(skill.name)
  );

  return (
    <div
      className="fixed inset-0 z-[70] overflow-y-auto bg-slate-950/70 px-3 py-3 backdrop-blur-md sm:px-4 sm:py-6"
      onClick={onClose}
    >
      <div
        className="mx-auto flex w-full max-w-4xl flex-col overflow-hidden rounded-[30px] border border-slate-700 bg-slate-900 text-white shadow-[0_32px_80px_-30px_rgba(15,23,42,0.95)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="shrink-0 border-b border-slate-800 px-5 py-5 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-400">
                Projects
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-white">
                {initialData ? "Edit Project" : "Add Project"}
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Add your best builds, production work, and serious experiments.
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
                    Project Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.projectName}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        projectName: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition-colors focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Company / University Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.organizationName}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        organizationName: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition-colors focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Designation
                </label>
                <input
                  type="text"
                  required
                  value={formData.designation}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      designation: event.target.value,
                    }))
                  }
                  placeholder="e.g. Backend Developer, Team Lead, Final Year Project Owner"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition-colors focus:border-blue-500"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        startDate: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition-colors focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    End Date
                  </label>
                  <input
                    type="date"
                    required={!formData.isCurrentProject}
                    disabled={formData.isCurrentProject}
                    value={formData.endDate ?? ""}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        endDate: event.target.value,
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
                  checked={formData.isCurrentProject}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      isCurrentProject: event.target.checked,
                      endDate: event.target.checked ? "" : prev.endDate,
                    }))
                  }
                />
                <span>This is my current project</span>
              </label>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    GitHub Link
                    <span className="ml-2 text-xs text-slate-500">(Optional)</span>
                  </label>
                  <input
                    type="url"
                    value={formData.githubLink ?? ""}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        githubLink: event.target.value,
                      }))
                    }
                    placeholder="https://github.com/..."
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition-colors focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Live Link
                    <span className="ml-2 text-xs text-slate-500">(Optional)</span>
                  </label>
                  <input
                    type="url"
                    value={formData.liveLink ?? ""}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        liveLink: event.target.value,
                      }))
                    }
                    placeholder="https://your-project.com"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition-colors focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Description
                </label>
                <textarea
                  required
                  rows={5}
                  value={formData.description}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Describe the project, your role, impact, and what you built..."
                  className="w-full resize-none rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition-colors focus:border-blue-500"
                />
              </div>

              <div className="rounded-[26px] border border-slate-800 bg-slate-950/70 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-200">Linked Skills</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Attach technologies already saved for the selected profile.
                    </p>
                  </div>

                  <div className="w-fit rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-slate-400">
                    {formData.skills.length} selected
                  </div>
                </div>

                <div className="mt-4">
                  <select
                    className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition-colors focus:border-blue-500"
                    onChange={(event) => handleSkillSelect(event.target.value)}
                    value=""
                  >
                    <option value="" disabled>
                      {availableSkillOptions.length > 0
                        ? "Choose a skill..."
                        : "No more skills available for this profile"}
                    </option>
                    {availableSkillOptions.map((skill) => (
                      <option key={skill.id} value={skill.name}>
                        {skill.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-4 flex min-h-[36px] flex-wrap gap-2">
                  {formData.skills.length > 0 ? (
                    formData.skills.map((skill) => (
                      <span
                        key={skill}
                        className="flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-sm text-blue-200"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="flex h-5 w-5 items-center justify-center rounded-full text-blue-300 transition-colors hover:bg-blue-500/20 hover:text-white"
                        >
                          x
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-sm italic text-slate-500">
                      No skills linked yet.
                    </span>
                  )}
                </div>
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
                    : "Create Project"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
