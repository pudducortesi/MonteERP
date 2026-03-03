import { getCurrentUser } from "@/lib/auth/rbac";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { AdvisorDashboard } from "@/components/dashboard/AdvisorDashboard";
import { ClientDashboard } from "@/components/dashboard/ClientDashboard";
import { ViewerDashboard } from "@/components/dashboard/ViewerDashboard";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  switch (user.role) {
    case "admin":
      return <AdminDashboard user={user} />;
    case "advisor":
      return <AdvisorDashboard user={user} />;
    case "client":
      return <ClientDashboard user={user} />;
    case "viewer":
      return <ViewerDashboard user={user} />;
    default:
      return <ViewerDashboard user={user} />;
  }
}
