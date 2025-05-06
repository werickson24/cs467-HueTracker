// app/dashboard/page.tsx
import DashboardClient from "../../components/dashboard-client";

// This is now a simple Server Component
export default function DashboardPage() {
  // The layout guarantees the user is authenticated at this point,
  // so we can safely render the client component.
  return <DashboardClient />;
}