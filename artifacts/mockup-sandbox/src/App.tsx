import { useEffect, useState } from "react";
import LandingPage from "./components/mockups/LandingPage";
import BusinessProfilePage from "./components/mockups/BusinessProfilePage";
import BusinessDashboard from "./components/mockups/BusinessDashboard";
import AuthPage from "./components/mockups/AuthPage";
import PublicBusinessPage from "./components/mockups/PublicBusinessPage";
import { AnimatePresence, motion } from "framer-motion";

type Page = "landing" | "profile" | "dashboard" | "auth";

export default function App() {
  const [page, setPage] = useState<Page>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.has("auth") || params.has("auth_error") ? "auth" : "landing";
  });
  const publicSlug = window.location.pathname.match(/^\/b\/([^/]+)\/?$/)?.[1];

  useEffect(() => {
    if (publicSlug) return;
    let cancelled = false;
    fetch("/api/auth/me", { credentials: "same-origin" })
      .then((response) => {
        if (response.ok && !cancelled) setPage("dashboard");
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, [publicSlug]);

  const navigate = (p: string) => {
    if (["landing", "profile", "dashboard", "auth"].includes(p)) {
      setPage(p as Page);
    }
  };

  return (
    publicSlug ? <PublicBusinessPage slug={decodeURIComponent(publicSlug)} /> :
    <AnimatePresence mode="wait">
      <motion.div
        key={page}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        {page === "landing" && <LandingPage onNavigate={navigate} />}
        {page === "profile" && <BusinessProfilePage />}
        {page === "dashboard" && <BusinessDashboard onNavigate={navigate} onSignOut={async () => {
          try {
            await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
          } finally {
            setPage("landing");
          }
        }} />}
        {page === "auth" && <AuthPage onNavigate={navigate} />}
      </motion.div>
    </AnimatePresence>
  );
}
