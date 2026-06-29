import { useState, useEffect } from "react";
import { adminService } from "@/services/adminService";
import type { User } from "@/types/user";
import { UserCheck, UserX, Search, Mail, Phone, Shield } from "lucide-react";
import { toast } from "react-hot-toast";
import { useConfirm } from "@/context/ConfirmContext";

export default function UserManagement() {
  const { confirm } = useConfirm();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [kycModalOpen, setKycModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [rejectMessage, setRejectMessage] = useState("");
  const [kycLoading, setKycLoading] = useState(false);

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
    const isConfirmed = await confirm({
      title: `${currentStatus ? "Chặn" : "Bỏ chặn"} người dùng`,
      message: `Bạn có chắc chắn muốn ${action} người dùng này?`,
      type: currentStatus ? "danger" : "success",
      confirmText: currentStatus ? "Chặn" : "Bỏ chặn",
      cancelText: "Hủy",
    });

    if (isConfirmed) {
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

  const handleVerifyKyc = async (status: "APPROVED" | "REJECTED") => {
    if (!selectedUser) return;
    if (status === "REJECTED" && !rejectMessage) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }

    setKycLoading(true);
    try {
      await adminService.verifyKyc(
        selectedUser.id,
        status,
        status === "REJECTED" ? rejectMessage : undefined,
      );
      toast.success("Đã cập nhật trạng thái KYC");
      setKycModalOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Failed to verify KYC", error);
      toast.error("Lỗi khi cập nhật trạng thái KYC");
    } finally {
      setKycLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
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
          <h1 className="text-2xl font-bold text-slate-800">
            Quản lý người dùng
          </h1>
          <p className="text-slate-500">
            Xem và quản lý trạng thái hoạt động của người dùng trong hệ thống
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
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
                <th className="px-6 py-4">KYC</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200">
                        {user.fullName
                          ? user.fullName.charAt(0).toUpperCase()
                          : user.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">
                          {user.fullName || "N/A"}
                        </div>
                        <div className="text-xs text-slate-500">
                          ID: #{user.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm">
                      <Shield size={14} className="text-slate-400" />
                      <span className="capitalize">
                        {user.role.replace("ROLE_", "").toLowerCase()}
                      </span>
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
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.kycStatus === "APPROVED"
                          ? "bg-green-100 text-green-700"
                          : user.kycStatus === "REJECTED"
                            ? "bg-red-100 text-red-700"
                            : user.kycStatus === "PENDING"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {user.kycStatus === "APPROVED"
                        ? "Đã duyệt"
                        : user.kycStatus === "REJECTED"
                          ? "Từ chối"
                          : user.kycStatus === "PENDING"
                            ? "Đang chờ"
                            : "Chưa XM"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {user.kycStatus === "PENDING" && (
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setRejectMessage("");
                            setKycModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all border border-transparent hover:border-blue-200"
                        >
                          Duyệt KYC
                        </button>
                      )}
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
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-slate-500"
                  >
                    Không tìm thấy người dùng nào phù hợp
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* KYC Modal */}
      {kycModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-xl font-bold">Duyệt hồ sơ KYC</h2>
              <button
                onClick={() => setKycModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Họ và tên</p>
                  <p className="font-medium text-lg">{selectedUser.fullName}</p>
                </div>
                <div>
                  <p className="text-slate-500">Số CCCD</p>
                  <p className="font-medium text-lg">
                    {selectedUser.identityNumber || "N/A"}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-slate-500 mb-2">Ảnh mặt trước</p>
                  {selectedUser.frontIdentity ? (
                    <img
                      src={selectedUser.frontIdentity}
                      alt="Front"
                      className="rounded-lg border size-80"
                    />
                  ) : (
                    <div className="w-full h-32 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                      Không có ảnh
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-slate-500 mb-2">Ảnh mặt sau</p>
                  {selectedUser.backIdentity ? (
                    <img
                      src={selectedUser.backIdentity}
                      alt="Back"
                      className="rounded-lg border size-80"
                    />
                  ) : (
                    <div className="w-full h-32 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                      Không có ảnh
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-slate-500 mb-2">Giấy phép kinh doanh</p>
                  {selectedUser.businessLicense ? (
                    <img
                      src={selectedUser.businessLicense}
                      alt="Business License"
                      className="rounded-lg border size-80"
                    />
                  ) : (
                    <div className="w-full h-32 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                      Không có ảnh
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-slate-500 mb-2 block">
                  Lý do từ chối (nếu có)
                </label>
                <textarea
                  value={rejectMessage}
                  onChange={(e) => setRejectMessage(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  rows={3}
                  placeholder="Nhập lý do nếu bạn từ chối hồ sơ này..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
              <button
                onClick={() => setKycModalOpen(false)}
                className="px-4 py-2 rounded-lg font-medium text-slate-600 hover:bg-slate-200 transition-colors"
                disabled={kycLoading}
              >
                Hủy
              </button>
              <button
                onClick={() => handleVerifyKyc("REJECTED")}
                className="px-4 py-2 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                disabled={kycLoading}
              >
                {kycLoading ? "Đang xử lý..." : "Từ chối"}
              </button>
              <button
                onClick={() => handleVerifyKyc("APPROVED")}
                className="px-4 py-2 rounded-lg font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
                disabled={kycLoading}
              >
                {kycLoading ? "Đang xử lý..." : "Phê duyệt"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
