import { useState, useEffect } from "react";
import { complaintService } from "@/services/complaintService";
import type { ComplaintResponse } from "@/services/complaintService";
import { formatCurrency } from "@/utils/time";
import { toast } from "react-hot-toast";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  MessageSquare,
  ShieldCheck,
  X,
  Scale,
  Loader2,
} from "lucide-react";

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState<ComplaintResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintResponse | null>(null);

  // Form state for resolution
  const [isResolveOpen, setIsResolveOpen] = useState(false);
  const [resolveVerdict, setResolveVerdict] = useState("REFUND_TO_BUYER");
  const [resolveAdminNote, setResolveAdminNote] = useState("");
  const [submittingResolution, setSubmittingResolution] = useState(false);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const data = await complaintService.listComplaints();
      setComplaints(data);
    } catch (error) {
      console.error("Failed to load complaints", error);
      toast.error("Không thể tải danh sách khiếu nại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleOpenResolve = (complaint: ComplaintResponse) => {
    setSelectedComplaint(complaint);
    setResolveVerdict("REFUND_TO_BUYER");
    setResolveAdminNote("");
    setIsResolveOpen(true);
  };

  const handleCloseResolve = () => {
    setIsResolveOpen(false);
  };

  const handleSubmitResolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    if (!resolveAdminNote.trim()) {
      toast.error("Vui lòng nhập ghi chú phân xử!");
      return;
    }

    setSubmittingResolution(true);
    try {
      await complaintService.resolveComplaint(selectedComplaint.complaintId, {
        verdict: resolveVerdict,
        adminNote: resolveAdminNote,
      });

      toast.success("Đã ban hành phán quyết và giải quyết khiếu nại thành công!");
      setIsResolveOpen(false);
      setSelectedComplaint(null);
      fetchComplaints();
    } catch (error) {
      console.error(error);
      toast.error("Không thể lưu phán quyết. Vui lòng thử lại!");
    } finally {
      setSubmittingResolution(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING_SELLER":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-50 text-yellow-700 border border-yellow-200">
            <Clock size={12} />
            Chờ Seller phản hồi
          </span>
        );
      case "PENDING_ADMIN":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <ShieldCheck size={12} />
            Chờ Admin phân xử
          </span>
        );
      case "CLOSED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={12} />
            Đã đóng / Giải quyết xong
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-50 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Quản lý tranh chấp khiếu nại</h1>
        <p className="text-slate-500">Giám sát các yêu cầu khiếu nại và đưa ra phán quyết giải quyết tranh chấp trên sàn</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center flex flex-col items-center justify-center gap-3">
          <div className="p-3 bg-slate-50 rounded-full text-slate-300">
            <Scale size={32} />
          </div>
          <p className="font-bold text-slate-700 text-lg">Không có khiếu nại nào cần phân xử</p>
          <p className="text-slate-400 text-sm max-w-sm">
            Hiện tại toàn sàn giao dịch đều diễn ra an toàn, không có khiếu nại nào phát sinh.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Mã khiếu nại</th>
                  <th className="px-6 py-4">Mã đơn</th>
                  <th className="px-6 py-4">Khách hàng (Buyer)</th>
                  <th className="px-6 py-4">Người bán (Seller)</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {complaints.map((c) => (
                  <tr key={c.complaintId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">#{c.complaintId}</td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-600">{c.orderCode || `#${c.orderId}`}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{c.buyerName}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{c.sellerName}</td>
                    <td className="px-6 py-4">{getStatusBadge(c.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedComplaint(c)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all"
                        >
                          <Eye size={14} />
                          Xem bằng chứng
                        </button>
                        {c.status === "PENDING_ADMIN" && (
                          <button
                            onClick={() => handleOpenResolve(c)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition-all shadow-sm"
                          >
                            <Scale size={14} />
                            Phân xử
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Complaint Detail Modal */}
      {selectedComplaint && !isResolveOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Chi tiết tranh chấp #{selectedComplaint.complaintId}</h2>
                <p className="text-xs text-slate-400 mt-1">Sản phẩm: <span className="font-bold">{selectedComplaint.productName}</span> | Giá trị đơn: {formatCurrency(selectedComplaint.totalAmount)}</p>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-700">
              {/* Buyer side */}
              <div className="p-4 bg-red-50/50 border border-red-100 rounded-xl space-y-3">
                <h3 className="font-bold text-red-800 flex items-center gap-1.5">
                  <AlertTriangle size={16} />
                  Thông tin khiếu nại từ Buyer ({selectedComplaint.buyerName})
                </h3>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Lý do khiếu nại</p>
                  <p className="text-slate-700 whitespace-pre-wrap">{selectedComplaint.reason}</p>
                </div>
                {selectedComplaint.evidenceUrls && selectedComplaint.evidenceUrls.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Bằng chứng hình ảnh từ khách hàng</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedComplaint.evidenceUrls.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noreferrer" className="block relative border rounded-lg overflow-hidden group">
                          <img src={url} alt="Bằng bằng chứng Buyer" className="w-20 h-20 object-cover" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Seller side (if responded) */}
              <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-3">
                <h3 className="font-bold text-primary-700 flex items-center gap-1.5">
                  <MessageSquare size={16} />
                  Phản hồi từ Seller ({selectedComplaint.sellerName})
                </h3>
                {selectedComplaint.sellerAction ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Phương án đề xuất</p>
                        <p className="font-bold text-slate-800">
                          {selectedComplaint.sellerAction === "ACCEPT_REFUND" ? "Đồng ý hoàn tiền" : "Từ chối / Đối chất giải trình"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Nội dung đối chất</p>
                      <p className="text-slate-700 whitespace-pre-wrap">{selectedComplaint.sellerMessage}</p>
                    </div>
                    {selectedComplaint.sellerEvidence && selectedComplaint.sellerEvidence !== "Không đính kèm tệp" && (
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Tài liệu minh chứng từ người bán</p>
                        {selectedComplaint.sellerEvidence.includes("http") ? (
                          <div className="flex flex-wrap gap-2">
                            {selectedComplaint.sellerEvidence.split(", ").map((url, i) => (
                              <a key={i} href={url} target="_blank" rel="noreferrer" className="block relative border rounded-lg overflow-hidden group">
                                <img src={url} alt="Bằng chứng Seller" className="w-20 h-20 object-cover" />
                              </a>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-600 font-mono text-xs">{selectedComplaint.sellerEvidence}</p>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-slate-400 italic">Seller chưa gửi phản hồi giải trình.</p>
                )}
              </div>

              {/* Verdict (if solved) */}
              {selectedComplaint.verdict && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <h3 className="font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck size={16} />
                    Phán quyết của Quản trị viên
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Phán quyết chung cuộc</p>
                      <p className="font-bold text-slate-900">{selectedComplaint.finalAction}</p>
                    </div>
                    {selectedComplaint.resolvedAt && (
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Thời gian xử lý</p>
                        <p className="font-semibold text-slate-700">
                          {new Date(selectedComplaint.resolvedAt).toLocaleString("vi-VN")}
                        </p>
                      </div>
                    )}
                  </div>
                  {selectedComplaint.adminNote && (
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Ghi chú của Admin</p>
                      <p className="text-slate-600 whitespace-pre-wrap">{selectedComplaint.adminNote}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                {selectedComplaint.status === "PENDING_ADMIN" && (
                  <button
                    onClick={() => handleOpenResolve(selectedComplaint)}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all shadow-sm"
                  >
                    <Scale size={16} />
                    Ban hành phán quyết phân xử
                  </button>
                )}
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Complaint Modal Form */}
      {isResolveOpen && selectedComplaint && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Giải quyết tranh chấp</h2>
                <p className="text-xs text-slate-400 mt-1">Khiếu nại #{selectedComplaint.complaintId}</p>
              </div>
              <button
                onClick={handleCloseResolve}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmitResolution} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Quyết định phán quyết (Verdict)</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setResolveVerdict("REFUND_TO_BUYER")}
                    className={`p-3 rounded-xl border-2 font-bold text-center text-xs transition-all ${
                      resolveVerdict === "REFUND_TO_BUYER"
                        ? "border-red-600 bg-red-50 text-red-700"
                        : "border-slate-200 hover:border-slate-300 text-slate-600 bg-white"
                    }`}
                  >
                    Hoàn tiền cho Buyer
                  </button>
                  <button
                    type="button"
                    onClick={() => setResolveVerdict("REJECT_COMPLAINT")}
                    className={`p-3 rounded-xl border-2 font-bold text-center text-xs transition-all ${
                      resolveVerdict === "REJECT_COMPLAINT"
                        ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 hover:border-slate-300 text-slate-600 bg-white"
                    }`}
                  >
                    Chuyển tiền cho Seller
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ghi chú phân xử</label>
                <textarea
                  required
                  rows={4}
                  value={resolveAdminNote}
                  onChange={(e) => setResolveAdminNote(e.target.value)}
                  placeholder="Nhập ghi chú phân tích lý do dẫn đến phán quyết này để làm cơ sở gửi thông báo cho hai bên..."
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseResolve}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-all text-sm"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submittingResolution}
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-bold transition-all text-sm disabled:opacity-60"
                >
                  {submittingResolution ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    "Ban hành phán quyết"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
