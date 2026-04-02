"use client";

import { useEffect, useState } from "react";
import AddMoreSkillModal from "@/components/AddMoreSkillModal";
import AddSkillModal from "@/components/AddSkillModal";
import AdminProfileSelector from "@/components/AdminProfileSelector";
import EditCategoryModal from "@/components/EditCategoryModal";
import EditSkillModal from "@/components/EditSkillModal";
import useAdminProfileSelection from "@/hooks/useAdminProfileSelection";
import {
  addSkillToCategory,
  createSkillCategory,
  CreateSkillCategoryPayload,
  CreateSkillPayload,
  deleteSkill,
  deleteSkillCategory,
  getAdminSkillCategories,
  SkillCategory,
  SkillItem,
  updateSkill,
  UpdateSkillPayload,
  updateSkillCategory,
} from "@/services/skillService";

const PREVIEW_LIMIT = 5;

export default function SkillsPage() {
  const {
    profiles,
    selectedProfile,
    selectedProfileId,
    setSelectedProfileId,
    isProfilesLoading,
    profilesError,
  } = useAdminProfileSelection();

  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageMessage, setPageMessage] = useState("");

  const [createError, setCreateError] = useState("");
  const [editError, setEditError] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [addMoreSkillError, setAddMoreSkillError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingSkill, setIsUpdatingSkill] = useState(false);
  const [isRenamingCategory, setIsRenamingCategory] = useState(false);
  const [isAddingMoreSkill, setIsAddingMoreSkill] = useState(false);
  const [isDeletingSkillId, setIsDeletingSkillId] = useState<number | null>(null);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [isAddMoreSkillModalOpen, setIsAddMoreSkillModalOpen] = useState(false);

  const [editingSkill, setEditingSkill] = useState<SkillItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | null>(null);

  const selectedSkills = selectedCategory?.skills ?? [];

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

  const loadCategories = async (profileId?: number | null): Promise<SkillCategory[]> => {
    if (!profileId) {
      setCategories([]);
      setSelectedCategory(null);
      setIsLoading(false);
      return [];
    }

    try {
      setIsLoading(true);
      const data = await getAdminSkillCategories(profileId);
      setCategories(data);

      if (selectedCategory) {
        const refreshedCategory =
          data.find((category) => category.id === selectedCategory.id) ?? null;
        setSelectedCategory(refreshedCategory);
      }

      return data;
    } catch (error) {
      console.error("Failed to load skill categories", error);
      setPageMessage("Unable to load skill categories right now.");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setSelectedCategory(null);
    loadCategories(selectedProfileId);
  }, [selectedProfileId]);

  const openCreateModal = () => {
    if (!selectedProfileId) return;
    setCreateError("");
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    if (isSubmitting) return;
    setCreateError("");
    setIsCreateModalOpen(false);
  };

  const openEditModal = (skill: SkillItem) => {
    setEditError("");
    setEditingSkill({
      ...skill,
      categoryId: skill.categoryId ?? selectedCategory?.id,
      categoryName: skill.categoryName ?? selectedCategory?.name,
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    if (isUpdatingSkill) return;
    setEditError("");
    setEditingSkill(null);
    setIsEditModalOpen(false);
  };

  const openEditCategoryModal = () => {
    if (!selectedCategory) return;
    setCategoryError("");
    setIsEditCategoryModalOpen(true);
  };

  const closeEditCategoryModal = () => {
    if (isRenamingCategory) return;
    setCategoryError("");
    setIsEditCategoryModalOpen(false);
  };

  const openAddMoreSkillModal = () => {
    if (!selectedCategory) return;
    setAddMoreSkillError("");
    setIsAddMoreSkillModalOpen(true);
  };

  const closeAddMoreSkillModal = () => {
    if (isAddingMoreSkill) return;
    setAddMoreSkillError("");
    setIsAddMoreSkillModalOpen(false);
  };

  const handleCreateSkill = async (payload: CreateSkillCategoryPayload) => {
    try {
      setIsSubmitting(true);
      setCreateError("");
      setPageMessage("");

      await createSkillCategory({
        ...payload,
        profileId: selectedProfileId ?? undefined,
      });

      await loadCategories(selectedProfileId);

      setIsCreateModalOpen(false);
      setPageMessage(`"${payload.name}" category created successfully.`);
    } catch (error) {
      console.error("Failed to create skill category", error);
      setCreateError(
        extractErrorMessage(error, "Unable to create skill category right now.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSkill = async (payload: UpdateSkillPayload) => {
    if (!editingSkill) return;

    try {
      setIsUpdatingSkill(true);
      setEditError("");
      setPageMessage("");

      await updateSkill(editingSkill.id, {
        ...payload,
        categoryId: payload.categoryId ?? editingSkill.categoryId ?? selectedCategory?.id,
      });

      await loadCategories(selectedProfileId);

      setIsEditModalOpen(false);
      setEditingSkill(null);
      setPageMessage(`"${payload.name}" updated successfully.`);
    } catch (error) {
      console.error("Failed to update skill", error);
      setEditError(extractErrorMessage(error, "Unable to update skill right now."));
    } finally {
      setIsUpdatingSkill(false);
    }
  };

  const handleRenameCategory = async (name: string) => {
    if (!selectedCategory) return;

    try {
      setIsRenamingCategory(true);
      setCategoryError("");
      setPageMessage("");

      const updatedCategory = await updateSkillCategory(selectedCategory.id, {
        name,
        profileId: selectedProfileId ?? selectedCategory.profileId,
      });

      await loadCategories(selectedProfileId);
      setSelectedCategory((prev) =>
        prev ? { ...prev, name: updatedCategory.name } : prev
      );

      setIsEditCategoryModalOpen(false);
      setPageMessage(`Category renamed to "${updatedCategory.name}".`);
    } catch (error) {
      console.error("Failed to rename category", error);
      setCategoryError(
        extractErrorMessage(error, "Unable to rename category right now.")
      );
    } finally {
      setIsRenamingCategory(false);
    }
  };

  const handleAddMoreSkill = async (payload: CreateSkillPayload) => {
    if (!selectedCategory) return;

    try {
      setIsAddingMoreSkill(true);
      setAddMoreSkillError("");
      setPageMessage("");

      const createdSkill = await addSkillToCategory(selectedCategory.id, payload);
      await loadCategories(selectedProfileId);

      setIsAddMoreSkillModalOpen(false);
      setPageMessage(
        `"${createdSkill.name ?? payload.name}" added to "${selectedCategory.name}".`
      );
    } catch (error) {
      console.error("Failed to add skill to category", error);
      setAddMoreSkillError(
        extractErrorMessage(error, "Unable to add skill to this category right now.")
      );
    } finally {
      setIsAddingMoreSkill(false);
    }
  };

  const handleDeleteSkill = async (skill: SkillItem) => {
    const confirmed = window.confirm(`Delete "${skill.name}"?`);
    if (!confirmed) return;

    try {
      setIsDeletingSkillId(skill.id);
      setPageMessage("");

      await deleteSkill(skill.id);
      await loadCategories(selectedProfileId);

      setPageMessage(`"${skill.name}" deleted successfully.`);
    } catch (error) {
      console.error("Failed to delete skill", error);
      setPageMessage(
        extractErrorMessage(error, `Unable to delete "${skill.name}" right now.`)
      );
    } finally {
      setIsDeletingSkillId(null);
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;

    if ((selectedCategory.skills ?? []).length > 0) {
      setPageMessage("First remove all skills from this category.");
      return;
    }

    const confirmed = window.confirm(`Delete "${selectedCategory.name}" category?`);
    if (!confirmed) return;

    try {
      setIsDeletingCategory(true);
      setPageMessage("");

      await deleteSkillCategory(selectedCategory.id);
      setSelectedCategory(null);
      await loadCategories(selectedProfileId);

      setPageMessage(`"${selectedCategory.name}" category deleted successfully.`);
    } catch (error) {
      console.error("Failed to delete category", error);
      setPageMessage(
        extractErrorMessage(error, "Unable to delete this category right now.")
      );
    } finally {
      setIsDeletingCategory(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 px-4 py-6 text-white sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto w-full max-w-7xl">
        <header className="border-b border-slate-800 pb-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight">Technical Expertise</h1>
            <p className="mt-2 text-lg text-slate-400">
              Manage skills for the selected profile
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
              + Add Skill
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
            <div className="py-20 text-center text-slate-400">Loading skills...</div>
          ) : categories.length === 0 ? (
            <div className="py-20 text-center">
              <h2 className="text-2xl font-semibold text-white">
                No skill categories for {selectedProfile?.fullName || "this profile"}.
              </h2>
              <p className="mt-3 text-slate-400">
                Add the first skill category and skill using the button above.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {categories.map((category) => {
                const categorySkills = category.skills ?? [];
                const previewSkills = categorySkills.slice(0, PREVIEW_LIMIT);
                const remainingSkills = Math.max(categorySkills.length - PREVIEW_LIMIT, 0);

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className="group relative overflow-hidden rounded-[28px] border border-slate-800 bg-slate-950/60 p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:bg-slate-950 hover:shadow-[0_24px_60px_-32px_rgba(59,130,246,0.55)]"
                  >
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.18),_transparent_45%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    <div className="relative">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-400">
                            Skill Category
                          </p>
                          <h2 className="mt-3 text-2xl font-semibold text-white">
                            {category.name}
                          </h2>
                        </div>

                        <span className="rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1 text-xs font-medium text-slate-300">
                          {categorySkills.length} skills
                        </span>
                      </div>

                      <div className="mt-6 space-y-3">
                        {previewSkills.length === 0 ? (
                          <p className="text-sm text-slate-500">
                            No skills added in this category yet.
                          </p>
                        ) : (
                          previewSkills.map((skill) => (
                            <div
                              key={skill.id}
                              className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3"
                            >
                              <span className="text-sm font-medium text-slate-200">
                                {skill.name}
                              </span>
                              <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
                                {skill.level}%
                              </span>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="mt-5 flex items-center justify-between text-sm text-slate-400">
                        <span>
                          {remainingSkills > 0
                            ? `+${remainingSkills} more skills inside`
                            : "Open to view details"}
                        </span>
                        <span className="text-blue-300">View details</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <AddSkillModal
          isOpen={isCreateModalOpen}
          isSubmitting={isSubmitting}
          errorMessage={createError}
          profileId={selectedProfileId}
          onClose={closeCreateModal}
          onCreate={handleCreateSkill}
        />

        <EditSkillModal
          isOpen={isEditModalOpen}
          isSubmitting={isUpdatingSkill}
          errorMessage={editError}
          skill={editingSkill}
          categoryName={editingSkill?.categoryName ?? selectedCategory?.name}
          onClose={closeEditModal}
          onSave={handleUpdateSkill}
        />

        <EditCategoryModal
          isOpen={isEditCategoryModalOpen}
          isSubmitting={isRenamingCategory}
          errorMessage={categoryError}
          initialName={selectedCategory?.name ?? ""}
          onClose={closeEditCategoryModal}
          onSave={handleRenameCategory}
        />

        <AddMoreSkillModal
          isOpen={isAddMoreSkillModalOpen}
          isSubmitting={isAddingMoreSkill}
          errorMessage={addMoreSkillError}
          categoryName={selectedCategory?.name ?? ""}
          onClose={closeAddMoreSkillModal}
          onCreate={handleAddMoreSkill}
        />

        {selectedCategory && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-8 backdrop-blur-md"
            onClick={() => setSelectedCategory(null)}
          >
            <div
              className="w-full max-w-4xl overflow-hidden rounded-[32px] border border-slate-700/80 bg-slate-900/95 shadow-[0_32px_80px_-30px_rgba(15,23,42,0.95)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="border-b border-slate-800 px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-400">
                      Technical Expertise
                    </p>

                    <div className="mt-3 flex items-center gap-3">
                      <h2 className="text-3xl font-semibold text-white">
                        {selectedCategory.name}
                      </h2>

                      <button
                        type="button"
                        onClick={openEditCategoryModal}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 text-slate-300 transition-colors hover:border-blue-500/40 hover:text-white"
                        aria-label="Edit category name"
                      >
                        ✎
                      </button>
                    </div>

                    <p className="mt-2 text-sm text-slate-400">
                      All skills and proficiency levels in this category.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedCategory(null)}
                    className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300 transition-colors hover:border-slate-500 hover:text-white"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="max-h-[70vh] overflow-y-auto px-6 py-6">
                {selectedSkills.length === 0 ? (
                  <div className="py-16 text-center text-slate-500">
                    No skills added in this category yet.
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {selectedSkills.map((skill) => (
                      <div
                        key={skill.id}
                        className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-base font-medium text-slate-100">
                            {skill.name}
                          </span>
                          <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
                            {skill.level}%
                          </span>
                        </div>

                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-cyan-300 transition-all duration-500"
                            style={{
                              width: `${Math.min(Math.max(skill.level, 0), 100)}%`,
                            }}
                          />
                        </div>

                        <div className="mt-5 flex gap-3">
                          <button
                            type="button"
                            onClick={() => openEditModal(skill)}
                            className="flex-1 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-200 transition-colors hover:border-blue-400/40 hover:bg-blue-500/20"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteSkill(skill)}
                            disabled={isDeletingSkillId === skill.id}
                            className="flex-1 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-200 transition-colors hover:border-red-400/40 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isDeletingSkillId === skill.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleDeleteCategory}
                    disabled={isDeletingCategory}
                    className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-200 transition-colors hover:border-red-400/40 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isDeletingCategory ? "Deleting..." : "Delete Category"}
                  </button>

                  <button
                    type="button"
                    onClick={openAddMoreSkillModal}
                    className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                  >
                    + Add More Skill
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
