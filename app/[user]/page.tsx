/*
  Dashboard.tsx – first high‑fidelity pass of the user dashboard.
  📌  Location: app/[user]/page.tsx in the Next.js App Router structure.
  ➡  Uses shadcn/ui <Card> & <Button>, lucide‑react icons and Framer Motion for tiny animations.
  ⚠  This file assumes you have installed shadcn/ui and added the Card & Button components.
      If not, run: npx shadcn-ui@latest add card button
*/

import { DashboardClient } from "@/components/DashboardClient";

type Props = {
  params: { user: string };
};

export default async function Dashboard({ params }: Props) {
  const resolvedParams = await params;
  const user = decodeURIComponent(resolvedParams.user);
  return <DashboardClient user={user} />;
}
