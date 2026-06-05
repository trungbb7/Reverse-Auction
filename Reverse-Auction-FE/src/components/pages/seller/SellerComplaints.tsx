import { useState, useEffect, useCallback } from "react";
import { useAppSelector } from "@/hooks/redux";
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
  Loader2,
} from "lucide-react";
import { cloudinaryService } from "@/services/cloudinaryService";

export default function SellerComplaints() {
  const user = useAppSelector((state) => state.auth.user);
  const [complaints, setComplaints] = useState<ComplaintResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] =
    useState<ComplaintResponse | null>(null);

  // Form state for responding
  const [isRespondOpen, setIsRespondOpen] = useState(false);
  const [respondAction, setRespondAction] = useState("REJECT_COMPLAINT");
  const [respondMessage, setRespondMessage] = useState("");
  const [respondEvidenceFiles, setRespondEvidenceFiles] =
    useState<FileList | null>(null);
  const [submittingResponse, setSubmittingResponse] = useState(false);

  const fetchComplaints = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await complaintService.listComplaints();
      // Filter for this seller
      const sellerData = data.filter((c) => c.sellerId === user.id);
      setComplaints(sellerData);
    } catch (error) {
      console.error("Failed to load complaints", error);
      toast.error("Không thể tải danh sách khiếu nại");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleOpenRespond = (complaint: ComplaintResponse) => {
    setSelectedComplaint(complaint);
    setRespondAction("REJECT_COMPLAINT");
    setRespondMessage("");
    setRespondEvidenceFiles(null);
    setIsRespondOpen(true);
  };

  const handleCloseRespond = () => {
    setIsRespondOpen(false);
    setIsRespondOpen(false);
  };

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    if (!respondMessage.trim()) {
      toast.error("Vui lòng nhập lời nhắn giải trình!");
      return;
    }

    setSubmittingResponse(true);
    try {
      let sellerEvidenceUrl = "";
      if (respondEvidenceFiles && respondEvidenceFiles.length > 0) {
        toast.loading("Đang tải lên tài liệu minh chứng...", {
          id: "uploading",
        });
        const urls =
          await cloudinaryService.uploadMultiImages(respondEvidenceFiles);
        sellerEvidenceUrl = urls.join(", ");
        toast.dismiss("uploading");
      }

      await complaintService.respondComplaint(selectedComplaint.complaintId, {
        action: respondAction,
        sellerMessage: respondMessage,
        sellerEvidence: sellerEvidenceUrl || "Không đính kèm tệp",
      });

      toast.success(
        "Đã phản hồi khiếu nại thành công! Vui lòng chờ Admin phân xử.",
      );
      setIsRespondOpen(false);
      setSelectedComplaint(null);
      fetchComplaints();
    } catch (error) {
      console.error(error);
      toast.dismiss("uploading");
      toast.error("Không thể gửi phản hồi. Vui lòng thử lại!");
    } finally {
      setSubmittingResponse(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING_SELLER":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-50 text-yellow-700 border border-yellow-200">
            <Clock size={12} />
            Chờ người bán phản hồi
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
            Đã giải quyết
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
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">
          Danh sách Khiếu nại
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Theo dõi và phản hồi các yêu cầu khiếu nại tranh chấp đơn hàng từ
          khách hàng của bạn
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#375F97]"></div>
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
            <MessageSquare size={32} />
          </div>
          <p className="font-bold text-slate-700 text-lg">
            Không có khiếu nại nào
          </p>
          <p className="text-slate-400 text-sm max-w-sm">
            Cửa hàng của bạn hiện chưa ghi nhận bất kỳ tranh chấp nào. Hãy giữ
            vững phong độ phục vụ tốt nhé!
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Mã đơn hàng</th>
                  <th className="px-6 py-4">Sản phẩm</th>
                  <th className="px-6 py-4">Khách hàng</th>
                  <th className="px-6 py-4">Lý do khiếu nại</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {complaints.map((c) => (
                  <tr
                    key={c.complaintId}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono font-bold text-slate-800">
                      {c.orderCode || `#${c.orderId}`}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 max-w-[200px] truncate">
                        {c.productName}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Giá trị: {formatCurrency(c.totalAmount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600">
                      {c.buyerName}
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className="max-w-[250px] truncate text-slate-500"
                        title={c.reason}
                      >
                        {c.reason}
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(c.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedComplaint(c)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all"
                          title="Xem chi tiết"
                        >
                          <Eye size={14} />
                          Xem chi tiết
                        </button>
                        {c.status === "PENDING_SELLER" && (
                          <button
                            onClick={() => handleOpenRespond(c)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#375F97] hover:bg-[#2d4f80] text-white transition-all shadow-sm"
                          >
                            <AlertTriangle size={14} />
                            Phản hồi
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
      {selectedComplaint && !isRespondOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Chi tiết khiếu nại #{selectedComplaint.complaintId}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Đơn hàng:{" "}
                  {selectedComplaint.orderCode ||
                    `#${selectedComplaint.orderId}`}
                </p>
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
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
                    Lý do khiếu nại
                  </p>
                  <p className="text-slate-700 whitespace-pre-wrap">
                    {selectedComplaint.reason}
                  </p>
                </div>
                {selectedComplaint.evidenceUrls &&
                  selectedComplaint.evidenceUrls.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">
                        Bằng chứng hình ảnh
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedComplaint.evidenceUrls.map((url, i) => (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="block relative border rounded-lg overflow-hidden group"
                          >
                            <img
                              src={url}
                              alt="Bằng chứng"
                              className="w-20 h-20 object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all text-white text-[10px] font-bold">
                              Phóng to
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              {/* Seller side (if responded) */}
              {selectedComplaint.sellerAction && (
                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-3">
                  <h3 className="font-bold text-[#375F97] flex items-center gap-1.5">
                    <MessageSquare size={16} />
                    Phản hồi từ bạn (Seller)
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                        Phương án phản hồi
                      </p>
                      <p className="font-bold text-slate-800">
                        {selectedComplaint.sellerAction === "ACCEPT_REFUND"
                          ? "Đồng ý hoàn tiền"
                          : "Từ chối / Đối chất"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                      Nội dung giải trình
                    </p>
                    <p className="text-slate-700 whitespace-pre-wrap">
                      {selectedComplaint.sellerMessage}
                    </p>
                  </div>
                  {selectedComplaint.sellerEvidence &&
                    selectedComplaint.sellerEvidence !==
                      "Không đính kèm tệp" && (
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
                          Tài liệu đính kèm
                        </p>
                        {selectedComplaint.sellerEvidence.includes("http") ? (
                          <div className="flex flex-wrap gap-2">
                            {selectedComplaint.sellerEvidence
                              .split(", ")
                              .map((url, i) => (
                                <a
                                  key={i}
                                  href={url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="block relative border rounded-lg overflow-hidden group"
                                >
                                  <img
                                    src={url}
                                    alt="Minh chứng seller"
                                    className="w-20 h-20 object-cover"
                                  />
                                </a>
                              ))}
                          </div>
                        ) : (
                          <p className="text-slate-600 font-mono text-xs">
                            {selectedComplaint.sellerEvidence}
                          </p>
                        )}
                      </div>
                    )}
                </div>
              )}

              {/* Verdict (if solved) */}
              {selectedComplaint.verdict && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <h3 className="font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck size={16} />
                    Phán quyết từ Quản trị viên (Admin)
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                        Kết luận tranh chấp
                      </p>
                      <p className="font-bold text-slate-900">
                        {selectedComplaint.finalAction}
                      </p>
                    </div>
                    {selectedComplaint.resolvedAt && (
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                          Thời gian xử lý
                        </p>
                        <p className="font-semibold text-slate-700">
                          {new Date(
                            selectedComplaint.resolvedAt,
                          ).toLocaleString("vi-VN")}
                        </p>
                      </div>
                    )}
                  </div>
                  {selectedComplaint.adminNote && (
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                        Ghi chú của Admin
                      </p>
                      <p className="text-slate-600 whitespace-pre-wrap">
                        {selectedComplaint.adminNote}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                {selectedComplaint.status === "PENDING_SELLER" && (
                  <button
                    onClick={() => handleOpenRespond(selectedComplaint)}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#375F97] hover:bg-[#2d4f80] text-white font-bold rounded-lg transition-all shadow-sm"
                  >
                    <AlertTriangle size={16} />
                    Gửi phản hồi đối chất ngay
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

      {/* Respond Complaint Modal Form */}
      {isRespondOpen && selectedComplaint && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Phản hồi khiếu nại
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Đơn hàng:{" "}
                  {selectedComplaint.orderCode ||
                    `#${selectedComplaint.orderId}`}
                </p>
              </div>
              <button
                onClick={handleCloseRespond}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmitResponse} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Phương án phản hồi
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRespondAction("ACCEPT_REFUND")}
                    className={`p-3 rounded-xl border-2 font-bold text-center text-xs transition-all ${
                      respondAction === "ACCEPT_REFUND"
                        ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 hover:border-slate-300 text-slate-600 bg-white"
                    }`}
                  >
                    Đồng ý hoàn tiền
                  </button>
                  <button
                    type="button"
                    onClick={() => setRespondAction("REJECT_COMPLAINT")}
                    className={`p-3 rounded-xl border-2 font-bold text-center text-xs transition-all ${
                      respondAction === "REJECT_COMPLAINT"
                        ? "border-[#375F97] bg-blue-50 text-[#375F97]"
                        : "border-slate-200 hover:border-slate-300 text-slate-600 bg-white"
                    }`}
                  >
                    Từ chối / Đối chất
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Lời nhắn giải trình
                </label>
                <textarea
                  required
                  rows={4}
                  value={respondMessage}
                  onChange={(e) => setRespondMessage(e.target.value)}
                  placeholder={
                    respondAction === "ACCEPT_REFUND"
                      ? "Nhập tin nhắn xác nhận hoàn tiền cho khách hàng..."
                      : "Nhập tin nhắn giải trình lý do từ chối khiếu nại của khách hàng (lỗi do người dùng, hàng đúng mô tả...)"
                  }
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
                />
              </div>

              {respondAction === "REJECT_COMPLAINT" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Hình ảnh minh chứng đính kèm
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setRespondEvidenceFiles(e.target.files)}
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-[#375F97] hover:file:bg-blue-100"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Đính kèm hóa đơn gửi hàng, ảnh đóng gói sản phẩm trước khi
                    giao để làm căn cứ.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseRespond}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-all text-sm"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submittingResponse}
                  className="inline-flex items-center gap-2 bg-[#375F97] hover:bg-[#2d4f80] text-white px-5 py-2 rounded-lg font-bold transition-all text-sm disabled:opacity-60"
                >
                  {submittingResponse ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    "Gửi phản hồi"
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
