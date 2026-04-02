"use client";

import { AdminProfileSummary } from "@/services/profileService";

interface AdminProfileSelectorProps {
  profiles: AdminProfileSummary[];
  selectedProfileId: number | null;
  selectedProfile?: AdminProfileSummary | null;
  isLoading?: boolean;
  onChange: (profileId: number) => void;
}

export default function AdminProfileSelector({
  profiles,
  selectedProfileId,
  selectedProfile,
  isLoading = false,
  onChange,
}: AdminProfileSelectorProps) {
  return (
    <div className="rounded-[28px] border border-slate-800 bg-slate-950/60 p-5 shadow-[0_20px_60px_-34px_rgba(15,23,42,0.95)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-400">
            Working Profile
          </p>
          <h2 className="mt-3 text-xl font-semibold text-white">
            {selectedProfile?.fullName || "Select Profile"}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            {selectedProfile?.titleLine || "Choose the profile you want to manage."}
          </p>
        </div>

        <div className="w-full max-w-md">
          <select
            value={selectedProfileId ?? ""}
            onChange={(event) => onChange(Number(event.target.value))}
            disabled={isLoading || profiles.length === 0}
            className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition-colors focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {profiles.length === 0 ? (
              <option value="">{isLoading ? "Loading profiles..." : "No profiles found"}</option>
            ) : (
              profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.fullName}
                  {profile.live ? " (Live)" : ""}
                </option>
              ))
            )}
          </select>
        </div>
      </div>
    </div>
  );
}
