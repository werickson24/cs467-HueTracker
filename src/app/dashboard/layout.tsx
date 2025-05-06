// app/dashboard/layout.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import React from "react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // If the user is not authenticated, redirect them to the login page
  if (!session?.user) {
    redirect("/login");
  }

  // If authenticated, render the children (which will be your page.tsx)
  return (
    <>
      {children}
    </>
  );
}