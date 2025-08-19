"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string;
  currency_unit?: string;
  weight_unit?: string;
  distance_unit?: string;
  strava_user?: boolean;
}

interface UserProfileContextType {
  userProfile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  refetchProfile: () => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(
  undefined
);

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error("useUserProfile must be used within a UserProfileProvider");
  }
  return context;
};

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();

  const fetchProfile = async (): Promise<void> => {
    if (status !== "authenticated" || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/user/profile");
      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }
      const profile = await response.json();
      setUserProfile(profile);
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && !userProfile && !isLoading) {
      fetchProfile();
    }
  }, [status, userProfile, isLoading]);

  const refetchProfile = async (): Promise<void> => {
    await fetchProfile();
  };

  return (
    <UserProfileContext.Provider
      value={{
        userProfile,
        isLoading,
        error,
        refetchProfile,
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
};
