"use client";

import { useAnonSession } from "@/hooks/useAnonSession";

export default function AnonSessionInit() {
  useAnonSession();
  return null;
}
