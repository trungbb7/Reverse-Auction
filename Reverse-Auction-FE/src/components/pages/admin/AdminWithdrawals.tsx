import { useEffect, useState } from "react";
import { userService } from "@/services/userService";
import type { Transaction } from "@/types/transaction";
import { Landmark, Check, X, RefreshCw, Search, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [rejectReasonOpen, setRejectReasonOpen] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const loadPendingWithdrawals = async () => {
    setLoading(true);
    try {
      const data = await userService.fetchPendingWithdrawals();
      setWithdrawals(data);
    } catch (err) {
      toast.error("Không thể tải danh sách yêu cầu rút tiền");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingWithdrawals();
  }, []);

  const handleApprove = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn PHÊ DUYỆT yêu cầu rút tiền này?")) {
      return;
    }
    setActionLoading(id);
    try {
      await userService.approveWithdrawal(id);
      toast.success("Đã phê duyệt và hoàn tất giao dịch rút tiền!");
      loadPendingWithdrawals();
    } catch (err) {
      toast.error("Phê duyệt thất bại");
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectSubmit = async (id: number) => {
    if (!rejectReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }
    setActionLoading(id);
    try {
      await userService.rejectWithdrawal(id, rejectReason);
      toast.success("Đã từ chối yêu cầu rút tiền và hoàn tiền cho người dùng!");
      setRejectReason("");
      setRejectReasonOpen(null);
      loadPendingWithdrawals();
    } catch (err) {
      toast.error("Từ chối thất bại");
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = withdrawals.filter(
    (w) =>
      w.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.userFullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.bankName && w.bankName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-slate-850 flex items-center gap-2">
            <Landmark className="w-6 h-6 text-blue-500" />
            Quản lý yêu cầu rút tiền
          </h1>
          <p className="text-sm text-slate-500 mt-1">Duyệt hoặc từ chối các yêu cầu chuyển khoản của người dùng.</p>
        </div>
        <button
          onClick={loadPendingWithdrawals}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50 font-bold text-sm cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Tải lại
        </button>
      </div>

      {/* FILTER SEARCH */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400 shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm kiếm theo email, tên người dùng, ngân hàng..."
          className="w-full text-sm bg-transparent border-0 focus:outline-none focus:ring-0 text-slate-800"
        />
      </div>

      {/* WITHDRAWALS LIST */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="py-24 flex justify-center items-center">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <AlertCircle className="w-12 h-12 text-slate-350 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">Không tìm thấy yêu cầu rút tiền nào đang chờ duyệt.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Người yêu cầu</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Số tiền rút</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tài khoản ngân hàng</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Thời gian</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="font-semibold text-slate-800">{w.userFullName}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{w.userEmail}</div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-extrabold text-red-600">
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Math.abs(w.amount))}
                      </span>
                    </td>
                    <td className="px-6 py-5 space-y-1">
                      <div className="text-sm font-bold text-slate-700">{w.bankName}</div>
                      <div className="text-xs font-mono text-slate-500">STK: {w.accountNumber}</div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Tên: {w.accountHolder}</div>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-500">
                      {new Date(w.createdAt).toLocaleString("vi-VN")}
                    </td>
                    <td className="px-6 py-5 text-right">
                      {rejectReasonOpen === w.id ? (
                        <div className="inline-block text-left space-y-2 max-w-xs">
                          <input
                            type="text"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Nhập lý do từ chối..."
                            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
                          />
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setRejectReason("");
                                setRejectReasonOpen(null);
                              }}
                              className="px-2.5 py-1 text-[11px] bg-slate-100 text-slate-600 rounded-md font-bold hover:bg-slate-200 cursor-pointer"
                            >
                              Hủy
                            </button>
                            <button
                              onClick={() => handleRejectSubmit(w.id)}
                              disabled={actionLoading === w.id}
                              className="px-2.5 py-1 text-[11px] bg-red-600 hover:bg-red-700 text-white rounded-md font-bold disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                              Xác nhận
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleApprove(w.id)}
                            disabled={actionLoading !== null}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-bold rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                            Phê duyệt
                          </button>
                          <button
                            onClick={() => {
                              setRejectReason("");
                              setRejectReasonOpen(w.id);
                            }}
                            disabled={actionLoading !== null}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                            Từ chối
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
