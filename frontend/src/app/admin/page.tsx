// Admin dashboard — private. The session is verified server-side by the backend (not just hidden buttons).
import { redirect } from "next/navigation";
import { getAdminSession } from "@/features/auth/session.server";
import AdminDashboard from "@/features/admin/components/AdminDashboard";

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  return <AdminDashboard email={session.email} />;
}
