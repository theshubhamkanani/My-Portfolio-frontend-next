"use client";

import { useEffect, useMemo, useState } from "react";
import AboutItemModal from "@/components/AboutItemModal";
import { EditIcon, GithubIcon, LinkedinIcon, TrashIcon } from "@/components/AdminActionIcons";
import AdminProfileSelector from "@/components/AdminProfileSelector";
import AboutProfileModal from "@/components/AboutProfileModal";
import useAdminProfileSelection from "@/hooks/useAdminProfileSelection";
import {
  AboutItemPayload,
  AdminProfile,
  activateDescription,
  activateHeadline,
  createAdminProfile,
  createDescription,
  createHeadline,
  createHighlight,
  deleteDescription,
  deleteHeadline,
  deleteHighlight,
  DescriptionItem,
  getAdminProfile,
  getDescriptions,
  getHeadlines,
  getHighlights,
  HeadlineItem,
  HighlightItem,
  updateAdminProfile,
  updateDescription,
  updateHeadline,
  updateHighlight,
} from "@/services/aboutService";

import { uploadProfileImage } from "@/services/profileService";

type AboutSection = "profile" | "headline" | "description" | "highlight";
type ItemSection = Exclude<AboutSection, "profile">;

const sectionOptions: Array<{ key: AboutSection; label: string }> = [
  { key: "profile", label: "Profile" },
  { key: "headline", label: "Headline" },
  { key: "description", label: "Description" },
  { key: "highlight", label: "Highlight" },
];

const itemModalConfig = {
  headline: {
    label: "Headline",
    addButtonLabel: "+ Add Headline",
    textLabel: "Headline Text",
    textPlaceholder: "Write the headline that should appear on the selected section...",
    showTypeField: true,
    multiline: false,
    typeOptions: [
      { value: "HERO", label: "Hero Section" },
      { value: "ABOUT", label: "About Section" },
    ],
    emptyTitle: "No headlines added yet.",
    emptyDescription: "Create your first headline for this profile.",
  },
  description: {
    label: "Description",
    addButtonLabel: "+ Add Description",
    textLabel: "Description Text",
    textPlaceholder: "Write the description text for the selected section...",
    showTypeField: true,
    multiline: true,
    typeOptions: [
      { value: "HERO", label: "Hero Section" },
      { value: "ABOUT", label: "About Section" },
    ],
    emptyTitle: "No descriptions added yet.",
    emptyDescription: "Create your first description for this profile.",
  },
  highlight: {
    label: "Highlight",
    addButtonLabel: "+ Add Highlight",
    textLabel: "Highlight Text",
    textPlaceholder: "e.g. Expert in Java Ecosystem",
    showTypeField: false,
    multiline: false,
    typeOptions: [],
    emptyTitle: "No highlights added yet.",
    emptyDescription: "Create your first bullet-point highlight for this profile.",
  },
} as const;


const getMonogram = (value: string) => {
  const parts = value.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (parts.length === 0) return "ME";
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
};

export default function AboutPage() {
  const {
    profiles,
    selectedProfile,
    selectedProfileId,
    setSelectedProfileId,
    isProfilesLoading,
    profilesError,
    reloadProfiles,
  } = useAdminProfileSelection();

  const [activeSection, setActiveSection] = useState<AboutSection>("profile");
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [headlines, setHeadlines] = useState<HeadlineItem[]>([]);
  const [descriptions, setDescriptions] = useState<DescriptionItem[]>([]);
  const [highlights, setHighlights] = useState<HighlightItem[]>([]);
  const [activatingKey, setActivatingKey] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [pageMessage, setPageMessage] = useState("");

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileModalError, setProfileModalError] = useState("");
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [profileModalMode, setProfileModalMode] = useState<"create" | "edit">(
    "edit"
  );
  const [profileModalInitialData, setProfileModalInitialData] =
    useState<AdminProfile | null>(null);

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemModalError, setItemModalError] = useState("");
  const [isItemSaving, setIsItemSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<AboutItemPayload | null>(null);
  const [itemModalSection, setItemModalSection] = useState<ItemSection>("headline");
  const [deletingKey, setDeletingKey] = useState<string | null>(null);

  const profileId = selectedProfileId ?? null;
  const currentProfileName =
    profile?.fullName?.trim() || selectedProfile?.fullName || "Portfolio Owner";
  const currentConfig = itemModalConfig[itemModalSection];

  const activeItems = useMemo(() => {
    if (activeSection === "headline") return headlines;
    if (activeSection === "description") return descriptions;
    if (activeSection === "highlight") return highlights;
    return [];
  }, [activeSection, headlines, descriptions, highlights]);

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

  const loadAboutData = async (targetProfileId?: number | null) => {
    if (!targetProfileId) {
      setProfile(null);
      setHeadlines([]);
      setDescriptions([]);
      setHighlights([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const [profileData, headlineData, descriptionData, highlightData] =
        await Promise.all([
          getAdminProfile(targetProfileId),
          getHeadlines(targetProfileId),
          getDescriptions(targetProfileId),
          getHighlights(targetProfileId),
        ]);

      setProfile(profileData);
      setHeadlines(headlineData);
      setDescriptions(descriptionData);
      setHighlights(highlightData);
    } catch (error) {
      console.error("Failed to load about data", error);
      setPageMessage("Unable to load about data right now.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAboutData(selectedProfileId);
  }, [selectedProfileId]);

  const openCreateProfileModal = () => {
    setProfileModalMode("create");
    setProfileModalInitialData(null);
    setProfileModalError("");
    setIsProfileModalOpen(true);
  };

  const openEditProfileModal = () => {
    setProfileModalMode("edit");
    setProfileModalInitialData(profile ? { ...profile } : null);
    setProfileModalError("");
    setIsProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    if (isProfileSaving) return;
    setProfileModalError("");
    setProfileModalInitialData(null);
    setProfileModalMode("edit");
    setIsProfileModalOpen(false);
  };

  const openCreateItemModal = (section: ItemSection) => {
    if (!profileId) return;

    const defaultType =
      section === "headline" ? "HERO" : section === "description" ? "ABOUT" : "";

    setItemModalSection(section);
    setEditingItem({
      text: "",
      type: defaultType,
      live: false,
      profileId,
    });
    setItemModalError("");
    setIsItemModalOpen(true);
  };


  const openEditItemModal = (section: ItemSection, item: AboutItemPayload) => {
    setItemModalSection(section);
    setEditingItem(item);
    setItemModalError("");
    setIsItemModalOpen(true);
  };

  const closeItemModal = () => {
    if (isItemSaving) return;
    setItemModalError("");
    setEditingItem(null);
    setIsItemModalOpen(false);
  };

  const handleSaveProfile = async (
    payload: AdminProfile,
    imageFile?: File | null
  ) => {
    try {
      setIsProfileSaving(true);
      setProfileModalError("");
      setPageMessage("");

      let profilePhotoUrl = payload.profilePhotoUrl?.trim() || null;

      if (imageFile) {
        profilePhotoUrl = await uploadProfileImage(imageFile);
      }

      const normalizedPayload: AdminProfile = {
        ...payload,
        fullName: payload.fullName.trim(),
        profilePhotoUrl,
        titleLine: payload.titleLine.trim(),
        githubLink: payload.githubLink.trim(),
        linkedinLink: payload.linkedinLink.trim(),
        email: payload.email.trim(),
      };

      const savedProfile =
        profileModalMode === "create"
          ? await createAdminProfile(normalizedPayload)
          : await updateAdminProfile({
              ...normalizedPayload,
              id: normalizedPayload.id ?? profileId ?? undefined,
            });

      const nextProfileId = savedProfile.id ?? profileId ?? null;

      await reloadProfiles(nextProfileId ?? undefined);

      if (nextProfileId) {
        setSelectedProfileId(nextProfileId);
      }

      await loadAboutData(nextProfileId);
      setIsProfileModalOpen(false);
      setProfileModalInitialData(null);
      setProfileModalMode("edit");
      setPageMessage(
        profileModalMode === "create"
          ? "Profile created successfully."
          : "Profile updated successfully."
      );
    } catch (error) {
      console.error("Failed to save profile", error);
      setProfileModalError(
        extractErrorMessage(error, "Unable to save profile right now.")
      );
    } finally {
      setIsProfileSaving(false);
    }
  };

  const handleSaveItem = async (payload: AboutItemPayload) => {
    try {
      setIsItemSaving(true);
      setItemModalError("");
      setPageMessage("");

      const finalPayload = {
        ...payload,
        profileId: payload.profileId ?? profileId ?? 0,
      };

      if (itemModalSection === "headline") {
        if (finalPayload.id) {
          await updateHeadline(finalPayload.id, finalPayload);
          setPageMessage("Headline updated successfully.");
        } else {
          await createHeadline(finalPayload);
          setPageMessage("Headline created successfully.");
        }
      }

      if (itemModalSection === "description") {
        if (finalPayload.id) {
          await updateDescription(finalPayload.id, finalPayload);
          setPageMessage("Description updated successfully.");
        } else {
          await createDescription(finalPayload);
          setPageMessage("Description created successfully.");
        }
      }

      if (itemModalSection === "highlight") {
        const highlightPayload = {
          id: finalPayload.id,
          text: finalPayload.text,
          profileId: finalPayload.profileId,
        };

        if (finalPayload.id) {
          await updateHighlight(finalPayload.id, highlightPayload);
          setPageMessage("Highlight updated successfully.");
        } else {
          await createHighlight(highlightPayload);
          setPageMessage("Highlight created successfully.");
        }
      }

      await loadAboutData(profileId);
      setIsItemModalOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error(`Failed to save ${itemModalSection}`, error);
      setItemModalError(
        extractErrorMessage(error, `Unable to save ${itemModalSection} right now.`)
      );
    } finally {
      setIsItemSaving(false);
    }
  };

  const handleActivateItem = async (section: ItemSection, id: number | undefined) => {
        if (!id || section === "highlight") return;

        const key = `${section}-${id}`;

        try {
          setActivatingKey(key);
          setPageMessage("");

          if (section === "headline") {
            await activateHeadline(id);
            setPageMessage("Headline moved live successfully.");
          }

          if (section === "description") {
            await activateDescription(id);
            setPageMessage("Description moved live successfully.");
          }

          await loadAboutData(profileId);
        } catch (error) {
          console.error(`Failed to activate ${section}`, error);
          setPageMessage(
            extractErrorMessage(error, `Unable to activate ${section} right now.`)
          );
        } finally {
          setActivatingKey(null);
        }
    };

  const handleDeleteItem = async (
    section: ItemSection,
    id: number | undefined,
    label: string
  ) => {
    if (!id) return;

    const confirmed = window.confirm(`Delete "${label}"?`);
    if (!confirmed) return;

    const key = `${section}-${id}`;

    try {
      setDeletingKey(key);
      setPageMessage("");

      if (section === "headline") {
        await deleteHeadline(id);
        setPageMessage("Headline deleted successfully.");
      }

      if (section === "description") {
        await deleteDescription(id);
        setPageMessage("Description deleted successfully.");
      }

      if (section === "highlight") {
        await deleteHighlight(id);
        setPageMessage("Highlight deleted successfully.");
      }

      await loadAboutData(profileId);
    } catch (error) {
      console.error(`Failed to delete ${section}`, error);
      setPageMessage(
        extractErrorMessage(error, `Unable to delete ${section} right now.`)
      );
    } finally {
      setDeletingKey(null);
    }
  };

  const renderProfileSection = () => {
    const profileImageUrl = profile?.profilePhotoUrl?.trim() || "";

    return (
      <section className="mt-10">
        <div className="mb-6 flex justify-end">
          <button
            type="button"
            onClick={openCreateProfileModal}
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
          >
            + Add Profile
          </button>
        </div>

        <article className="relative overflow-hidden rounded-[32px] border border-slate-800 bg-slate-950/60 p-6 shadow-[0_20px_60px_-34px_rgba(15,23,42,0.95)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.16),_transparent_42%)] opacity-70" />

          <div className="relative">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-5">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[28px] border border-slate-800 bg-slate-900">
                  {profileImageUrl ? (
                    <img
                      src={profileImageUrl}
                      alt={currentProfileName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xl font-semibold tracking-[0.2em] text-slate-300">
                      {getMonogram(currentProfileName)}
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-400">
                      Profile
                    </p>

                    {selectedProfile?.live && (
                      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                        Live Profile
                      </span>
                    )}
                  </div>

                  <h2 className="mt-3 text-3xl font-semibold text-white">
                    {profile?.fullName || "Your Name"}
                  </h2>
                  <p className="mt-2 text-lg text-slate-300">
                    {profile?.titleLine || "Add your title line"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={openEditProfileModal}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-sky-500/25 bg-sky-500/10 text-sky-300 transition-colors hover:border-sky-400/60 hover:bg-sky-500/20 hover:text-sky-100"
                aria-label="Edit profile"
              >
                <EditIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Email</p>
                <p className="mt-3 break-all text-sm text-slate-200">
                  {profile?.email || "Not added yet"}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 md:col-span-2">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Title Line</p>
                <p className="mt-3 text-sm text-slate-200">
                  {profile?.titleLine || "Not added yet"}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Social Links</p>
                <div className="mt-4 flex items-center gap-3">
                  <a
                    href={profile?.githubLink || "#"}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="GitHub link"
                    className={`flex h-11 w-11 items-center justify-center rounded-full border border-slate-700 bg-slate-950 text-slate-300 transition-colors ${
                      profile?.githubLink
                        ? "hover:border-sky-400/50 hover:text-white"
                        : "pointer-events-none opacity-40"
                    }`}
                  >
                    <GithubIcon className="h-5 w-5" />
                  </a>

                  <a
                    href={profile?.linkedinLink || "#"}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="LinkedIn link"
                    className={`flex h-11 w-11 items-center justify-center rounded-full border border-slate-700 bg-slate-950 text-slate-300 transition-colors ${
                      profile?.linkedinLink
                        ? "hover:border-sky-400/50 hover:text-white"
                        : "pointer-events-none opacity-40"
                    }`}
                  >
                    <LinkedinIcon className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </article>
      </section>
    );
  };

  const renderItemsSection = (section: ItemSection) => {
    const config = itemModalConfig[section];
    const items = activeItems;

    return (
      <section className="mt-10">
        <div className="mb-6 flex justify-end">
          <button
            type="button"
            onClick={() => openCreateItemModal(section)}
            disabled={!profileId}
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {config.addButtonLabel}
          </button>
        </div>

        {items.length === 0 ? (
          <div className="py-20 text-center">
            <h2 className="text-2xl font-semibold text-white">{config.emptyTitle}</h2>
            <p className="mt-3 text-slate-400">{config.emptyDescription}</p>
          </div>
        ) : (
          <div className="space-y-5">
            {items.map((item) => {
              const actionKey = `${section}-${item.id}`;
              const typeText = "type" in item ? item.type : null;
              const isLive = "live" in item ? Boolean(item.live) : false;

              return (
                <article
                  key={actionKey}
                  className="relative overflow-hidden rounded-[32px] border border-slate-800 bg-slate-950/60 p-6 shadow-[0_20px_60px_-34px_rgba(15,23,42,0.95)] transition-all duration-300 hover:-translate-y-1 hover:border-slate-600/70 hover:bg-slate-950/80"
                >
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.16),_transparent_42%)] opacity-70" />

                  <div className="relative">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-400">
                          {config.label}
                        </p>

                        {section === "description" ? (
                          <p className="mt-4 max-w-5xl leading-7 text-slate-200">
                            {item.text}
                          </p>
                        ) : (
                          <h2 className="mt-4 text-2xl font-semibold text-white">
                            {item.text}
                          </h2>
                        )}

                        <div className="mt-4 flex flex-wrap gap-2">
                          {typeText && (
                            <span className="rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-300">
                              {typeText}
                            </span>
                          )}

                          {isLive && (
                            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-emerald-300">
                              Live
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-end gap-3">
                        {section !== "highlight" && (
                          <button
                            type="button"
                            onClick={() => handleActivateItem(section, item.id)}
                            disabled={isLive || activatingKey === actionKey}
                            className={`rounded-xl px-4 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${
                              isLive
                                ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                                : "bg-emerald-600 text-white hover:bg-emerald-700"
                            } ${activatingKey === actionKey ? "opacity-70" : ""}`}
                          >
                            {activatingKey === actionKey
                              ? "Updating..."
                              : isLive
                                ? "Live Now"
                                : "Make Live"}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => openEditItemModal(section, item)}
                          className="flex h-12 w-12 items-center justify-center rounded-full border border-sky-500/25 bg-sky-500/10 text-sky-300 transition-colors hover:border-sky-400/60 hover:bg-sky-500/20 hover:text-sky-100"
                          aria-label={`Edit ${config.label}`}
                        >
                          <EditIcon className="h-5 w-5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteItem(section, item.id, item.text)}
                          disabled={deletingKey === actionKey || activatingKey === actionKey}
                          className="flex h-12 w-12 items-center justify-center rounded-full border border-red-500/25 bg-red-500/10 text-red-300 transition-colors hover:border-red-400/60 hover:bg-red-500/20 hover:text-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                          aria-label={`Delete ${config.label}`}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    );
  };


  return (
    <main className="min-h-screen bg-slate-900 px-4 py-6 text-white sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto w-full max-w-7xl">
        <header className="border-b border-slate-800 pb-8">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-400">
              About Updation
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white">
              {currentProfileName}
            </h1>
            <p className="mt-3 text-lg text-slate-400">
              Manage profile, headlines, descriptions, and highlights for the selected profile.
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

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {sectionOptions.map((section) => {
              const isActive = activeSection === section.key;

              return (
                <label
                  key={section.key}
                  className={`cursor-pointer rounded-full border px-5 py-3 text-sm font-medium transition-all ${
                    isActive
                      ? "border-blue-500/40 bg-blue-500/15 text-white"
                      : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500 hover:text-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="about-section"
                    className="sr-only"
                    checked={isActive}
                    onChange={() => setActiveSection(section.key)}
                  />
                  {section.label}
                </label>
              );
            })}
          </div>
        </header>

        {(profilesError || pageMessage) && (
          <div className="mt-6 rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-200">
            {profilesError || pageMessage}
          </div>
        )}

        {isLoading ? (
          <div className="py-24 text-center text-slate-400">Loading about data...</div>
        ) : (
          <>
            {activeSection === "profile" && renderProfileSection()}
            {activeSection === "headline" && renderItemsSection("headline")}
            {activeSection === "description" && renderItemsSection("description")}
            {activeSection === "highlight" && renderItemsSection("highlight")}
          </>
        )}

        <AboutProfileModal
          isOpen={isProfileModalOpen}
          isSubmitting={isProfileSaving}
          errorMessage={profileModalError}
          mode={profileModalMode}
          initialData={profileModalInitialData}
          onClose={closeProfileModal}
          onSave={handleSaveProfile}
        />

        <AboutItemModal
          isOpen={isItemModalOpen}
          isSubmitting={isItemSaving}
          errorMessage={itemModalError}
          itemLabel={currentConfig.label}
          textLabel={currentConfig.textLabel}
          textPlaceholder={currentConfig.textPlaceholder}
          showTypeField={currentConfig.showTypeField}
          multiline={currentConfig.multiline}
          typeOptions={currentConfig.typeOptions}
          initialData={editingItem}
          profileId={profileId}
          onClose={closeItemModal}
          onSave={handleSaveItem}
        />
      </div>
    </main>
  );
}
