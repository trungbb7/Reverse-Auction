import { useState, useEffect } from "react";
import { adminService } from "@/services/adminService";
import type { User } from "@/types/user";
import { UserCheck, UserX, Search, Mail, Phone, Shield } from "lucide-react";
import { toast } from "react-hot-toast";

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    try {
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users", error);
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleBlock = async (userId: number, currentStatus: boolean) => {
    const action = currentStatus ? "chặn" : "bỏ chặn";
    if (confirm(`Bạn có chắc chắn muốn ${action} người dùng này?`)) {
      try {
        await adminService.toggleUserBlock(userId);
        toast.success(`Đã ${action} người dùng thành công`);
        fetchUsers(); // Refresh list
      } catch (error) {
        console.error("Failed to toggle block status", error);
        toast.error(`Không thể ${action} người dùng`);
      }
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý người dùng</h1>
          <p className="text-slate-500">Xem và quản lý trạng thái hoạt động của người dùng trong hệ thống</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc email..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-sm font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Người dùng</th>
                <th className="px-6 py-4">Vai trò</th>
                <th className="px-6 py-4">Liên hệ</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200">
                        {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{user.fullName || "N/A"}</div>
                        <div className="text-xs text-slate-500">ID: #{user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm">
                      <Shield size={14} className="text-slate-400" />
                      <span className="capitalize">{user.role.replace("ROLE_", "").toLowerCase()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail size={14} className="text-slate-400" />
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone size={14} className="text-slate-400" />
                          {user.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.enabled
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          : "bg-red-100 text-red-700 border border-red-200"
                      }`}
                    >
                      {user.enabled ? "Đang hoạt động" : "Bị chặn"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleToggleBlock(user.id, user.enabled)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        user.enabled
                          ? "text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200"
                          : "text-emerald-600 hover:bg-emerald-50 border border-transparent hover:border-emerald-200"
                      }`}
                    >
                      {user.enabled ? (
                        <>
                          <UserX size={16} />
                          Chặn
                        </>
                      ) : (
                        <>
                          <UserCheck size={16} />
                          Bỏ chặn
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                    Không tìm thấy người dùng nào phù hợp
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
