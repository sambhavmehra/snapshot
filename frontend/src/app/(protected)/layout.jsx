"use client";
import React, { useContext, useEffect } from "react";
import { AuthContext } from '@/context/AuthContext';
import { useRouter } from "next/navigation";

export default function ProtectedLayout({ children }) {
  const { isAuthenticated } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    // In Next.js App router, protection on client-side can be done in useEffect
    // For robust protection, middleware is often used but this mimics the previous ProtectedRoute
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
