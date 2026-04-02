"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AdminProfileSummary,
  getAdminProfiles,
} from "@/services/profileService";

const STORAGE_KEY = "admin-selected-profile-id";

const readStoredProfileId = (): number | null => {
  if (typeof window === "undefined") return null;

  const rawValue = window.localStorage.getItem(STORAGE_KEY);
  if (!rawValue) return null;

  const parsed = Number(rawValue);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const persistProfileId = (profileId: number | null) => {
  if (typeof window === "undefined") return;

  if (!profileId) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, String(profileId));
};

const resolveSelectedProfileId = (
  profiles: AdminProfileSummary[],
  preferredId?: number | null
) => {
  if (profiles.length === 0) return null;

  if (preferredId) {
    const matchedProfile = profiles.find((profile) => profile.id === preferredId);
    if (matchedProfile) return matchedProfile.id;
  }

  const liveProfile = profiles.find((profile) => profile.live);
  if (liveProfile) return liveProfile.id;

  return profiles[0]?.id ?? null;
};

export default function useAdminProfileSelection() {
  const [profiles, setProfiles] = useState<AdminProfileSummary[]>([]);
  const [selectedProfileId, setSelectedProfileIdState] = useState<number | null>(
    null
  );
  const [isProfilesLoading, setIsProfilesLoading] = useState(true);
  const [profilesError, setProfilesError] = useState("");

  const loadProfiles = async (preferredId?: number | null) => {
    try {
      setIsProfilesLoading(true);
      setProfilesError("");

      const data = await getAdminProfiles();
      setProfiles(data);

      const nextSelectedProfileId = resolveSelectedProfileId(
        data,
        preferredId ?? selectedProfileId ?? readStoredProfileId()
      );

      setSelectedProfileIdState(nextSelectedProfileId);
      persistProfileId(nextSelectedProfileId);

      return data;
    } catch (error) {
      console.error("Failed to load admin profiles", error);
      setProfiles([]);
      setSelectedProfileIdState(null);
      setProfilesError("Unable to load profiles right now.");
      persistProfileId(null);
      return [];
    } finally {
      setIsProfilesLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const setSelectedProfileId = (profileId: number) => {
    setSelectedProfileIdState(profileId);
    persistProfileId(profileId);
  };

  const selectedProfile = useMemo(
    () => profiles.find((profile) => profile.id === selectedProfileId) ?? null,
    [profiles, selectedProfileId]
  );

  return {
    profiles,
    selectedProfile,
    selectedProfileId,
    setSelectedProfileId,
    isProfilesLoading,
    profilesError,
    reloadProfiles: loadProfiles,
  };
}
