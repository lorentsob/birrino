/**
 * Legacy route - redirects to /dashboard
 * The app now uses session-based auth instead of URL-based user identification.
 */

import { redirect } from "next/navigation";

export default function LegacyUserRoute() {
  redirect("/dashboard");
}
