import { getCurrentUser } from "@/lib/auth/rbac";
import { redirect } from "next/navigation";
import { PersonalDashboard } from "@/components/dashboard/PersonalDashboard";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return <PersonalDashboard user={user} />;
}
