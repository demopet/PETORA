import { Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageHeader } from "@/components/layout/page-header";
import { SkipLink } from "@/components/layout/skip-link";

export default function Layout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <SkipLink />
      <Sidebar userRole={user.role} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar userName={user.full_name} userRole={user.role} />
        <main id="main-content" className="flex-1 overflow-y-auto p-6" tabIndex={-1}>
          <Breadcrumb items={[]} className="mb-4" />
          <PageHeader title="" className="mb-6" />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
