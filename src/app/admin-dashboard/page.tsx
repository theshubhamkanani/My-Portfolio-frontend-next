"use client";

import { useEffect, useState } from "react";
import { logoutUser } from "@/services/authService";
import { getAdminContactRequests } from "@/services/contactService";
import { getAdminExperiences } from "@/services/experienceService";
import { activateProfile, AdminProfileSummary, getAdminProfiles } from "@/services/profileService";
import { getAdminProjects } from "@/services/projectService";

interface DashboardStats {
  totalProjects: number;
  totalExperiences: number;
  totalContacts: number;
}

function LogoutIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

function FolderIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
    </svg>
  );
}

function BriefcaseIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M3 9h18" />
      <path d="M5 7h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

function MailIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
      <path d="m22 8-10 6L2 8" />
    </svg>
  );
}

const getMonogram = (value: string) => {
  const parts = value.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (parts.length === 0) return "PF";
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
};

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pageMessage, setPageMessage] = useState("");

  const [profiles, setProfiles] = useState<AdminProfileSummary[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    totalExperiences: 0,
    totalContacts: 0,
  });
  const [activatingProfileId, setActivatingProfileId] = useState<number | null>(null);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      setPageMessage("");

      const profileData = await getAdminProfiles();
      setProfiles(profileData);

      const [projectLists, experienceLists, contacts] = await Promise.all([
        Promise.all(profileData.map((profile) => getAdminProjects(profile.id))),
        Promise.all(profileData.map((profile) => getAdminExperiences(profile.id))),
        getAdminContactRequests(),
      ]);

      const totalProjects = projectLists.reduce(
        (sum, projects) => sum + projects.length,
        0
      );

      const totalExperiences = experienceLists.reduce(
        (sum, experiences) => sum + experiences.length,
        0
      );

      setStats({
        totalProjects,
        totalExperiences,
        totalContacts: contacts.length,
      });
    } catch (error) {
      console.error("Failed to load dashboard", error);
      setPageMessage("Unable to load dashboard right now.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsAdmin(true);
    loadDashboard();
  }, []);


  const handleMakeLive = async (profileId: number) => {
    try {
      setActivatingProfileId(profileId);
      setPageMessage("");

      await activateProfile(profileId);
      await loadDashboard();

      setPageMessage("Live profile updated successfully.");
    } catch (error) {
      console.error("Failed to activate profile", error);
      setPageMessage("Unable to update live profile right now.");
    } finally {
      setActivatingProfileId(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 p-10 text-white">
        Loading Security...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto w-full max-w-7xl">
        <nav className="mb-10 flex items-center justify-between border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Hey Buddy, Welcome Back..</h1>
            <p className="mt-2 text-sm text-slate-400">
              Manage live profiles and monitor your admin activity from here.
            </p>
          </div>

          <button
            type="button"
            onClick={logoutUser}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 text-red-300 transition-colors hover:border-red-400/50 hover:bg-red-500/20 hover:text-white"
            aria-label="Logout"
            title="Logout"
          >
            <LogoutIcon className="h-5 w-5" />
          </button>
        </nav>

        {pageMessage && (
          <div className="mb-6 rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-200">
            {pageMessage}
          </div>
        )}

        {isLoading ? (
          <div className="py-24 text-center text-slate-400">Loading dashboard...</div>
        ) : (
          <>
            <section className="grid gap-6 md:grid-cols-3">
              <article className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-6 shadow-[0_20px_60px_-34px_rgba(15,23,42,0.95)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-400">
                      Projects
                    </p>
                    <p className="mt-4 text-4xl font-bold text-white">
                      {stats.totalProjects}
                    </p>
                    <p className="mt-3 text-sm text-slate-400">
                      Total projects across all profiles
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-700 bg-slate-950 text-sky-300">
                    <FolderIcon className="h-5 w-5" />
                  </div>
                </div>
              </article>

              <article className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-6 shadow-[0_20px_60px_-34px_rgba(15,23,42,0.95)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-400">
                      Experience
                    </p>
                    <p className="mt-4 text-4xl font-bold text-white">
                      {stats.totalExperiences}
                    </p>
                    <p className="mt-3 text-sm text-slate-400">
                      Total experience entries across all profiles
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-700 bg-slate-950 text-blue-300">
                    <BriefcaseIcon className="h-5 w-5" />
                  </div>
                </div>
              </article>

              <article className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-6 shadow-[0_20px_60px_-34px_rgba(15,23,42,0.95)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-400">
                      Contact Requests
                    </p>
                    <p className="mt-4 text-4xl font-bold text-white">
                      {stats.totalContacts}
                    </p>
                    <p className="mt-3 text-sm text-slate-400">
                      Total contact requests stored in database
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-700 bg-slate-950 text-emerald-300">
                    <MailIcon className="h-5 w-5" />
                  </div>
                </div>
              </article>
            </section>

            <section className="mt-12">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-white">Profiles</h2>
                <p className="mt-2 text-sm text-slate-400">
                  One profile can be live at a time. Switching live profile will automatically turn the previous one offline.
                </p>
              </div>

              {profiles.length === 0 ? (
                <div className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-10 text-center text-slate-400">
                  No profiles found.
                </div>
              ) : (
                <div className="space-y-5">
                  {profiles.map((profile) => (
                    <article
                      key={profile.id}
                      className="relative overflow-hidden rounded-[30px] border border-slate-800 bg-slate-900/80 p-6 shadow-[0_20px_60px_-34px_rgba(15,23,42,0.95)]"
                    >
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.14),_transparent_42%)] opacity-70" />

                      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-start gap-4">
                          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
                            {profile.profilePhotoUrl ? (
                              <img
                                src={profile.profilePhotoUrl}
                                alt={profile.fullName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-base font-semibold tracking-[0.2em] text-slate-300">
                                {getMonogram(profile.fullName)}
                              </span>
                            )}
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-3">
                              <h3 className="text-2xl font-semibold text-white">
                                {profile.fullName}
                              </h3>

                              {profile.live && (
                                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                                  Live Now
                                </span>
                              )}
                            </div>

                            <p className="mt-2 text-sm text-slate-300">
                              {profile.titleLine || "No title line added"}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleMakeLive(profile.id)}
                          disabled={profile.live || activatingProfileId === profile.id}
                          className={`rounded-xl px-5 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${
                            profile.live
                              ? "border border-slate-700 bg-slate-800 text-slate-200"
                              : "bg-red-600 text-white hover:bg-red-700"
                          } ${activatingProfileId === profile.id ? "opacity-70" : ""}`}
                        >
                          {activatingProfileId === profile.id
                            ? "Updating..."
                            : profile.live
                              ? "Lived"
                              : "Live"}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
