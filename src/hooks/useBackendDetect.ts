import { useEffect } from "react";
import { api, setOwnerKey } from "../services/api";
import { useUi } from "../store";

/**
 * Detects whether the Spring Boot backend is reachable.
 * Stores the result in the ui store so the UI can show a fallback banner.
 * - Syncs the latest ownerKey into axios defaults whenever it changes.
 * - Probes /health on mount, on window focus, and when the tab becomes
 *   visible again, so a temporarily-down backend is recovered without
 *   flooding the network with requests.
 */
export function useBackendDetect() {
  const { setBackendReady, ownerKey } = useUi();

  useEffect(() => {
    setOwnerKey(ownerKey);
  }, [ownerKey, setOwnerKey]);

  useEffect(() => {
    let cancelled = false;
    const probe = () => {
      api
        .get("/health", { timeout: 3000 })
        .then(() => { if (!cancelled) setBackendReady(true); })
        .catch(() => { if (!cancelled) setBackendReady(false); });
    };
    probe();
    const onFocus = () => probe();
    const onVisibility = () => { if (document.visibilityState === "visible") probe(); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [setBackendReady]);
}
