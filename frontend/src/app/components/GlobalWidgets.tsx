"use client";

import { usePathname } from "next/navigation";
import AuthInitializer from "./AuthInitializer";
import GlobalLeadPopup from "./GlobalLeadPopup";
import GlobalReminderPopup from "./ReminderPopup";

// Public, embeddable form pages don't need auth/lead/reminder widgets
const PUBLIC_ROUTES = ["/gac-form"];

export default function GlobalWidgets() {
  const pathname = usePathname();

  if (PUBLIC_ROUTES.includes(pathname)) return null;

  return (
    <>
      <AuthInitializer />
      <GlobalLeadPopup />
      <GlobalReminderPopup />
    </>
  );
}
