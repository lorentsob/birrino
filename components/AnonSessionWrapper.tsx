"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Import the component dynamically with no SSR
const AnonSessionInitClient = dynamic(
  () => import("@/components/AnonSessionInit"),
  { ssr: false }
);

export default function AnonSessionWrapper() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <AnonSessionInitClient />;
}
