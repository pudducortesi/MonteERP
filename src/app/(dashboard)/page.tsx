import { getCurrentUser } from "@/lib/auth/rbac";
import { redirect } from "next/navigation";
import { WealthDashboard } from "@/components/dashboard/WealthDashboard";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return <WealthDashboard user={user} />;
}
