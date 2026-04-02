"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import api from "@/services/api";
import { clearAdminTabToken, getAdminTabToken } from "@/services/adminTabSession";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const tabToken = getAdminTabToken();

    if (!tabToken) {
      setIsCheckingAuth(false);
      router.replace("/shubh-dev");
      return () => {
        isMounted = false;
      };
    }

    api
      .get("/auth/session")
      .then(() => {
        if (!isMounted) return;
        setIsAuthenticated(true);
      })
      .catch(() => {
        if (!isMounted) return;
        clearAdminTabToken();
        router.replace("/shubh-dev");
      })
      .finally(() => {
        if (!isMounted) return;
        setIsCheckingAuth(false);
      });

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Checking admin access...
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <AdminSidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarOpen ? "pl-64" : "pl-20"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
