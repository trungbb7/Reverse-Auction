import { Outlet } from "react-router";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface AdminLayoutProps {
  role?: "admin" | "seller";
}

const AdminLayout = ({ role = "admin" }: AdminLayoutProps) => {
  return (
    <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">
      <Sidebar role={role} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header isAdmin={true} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
