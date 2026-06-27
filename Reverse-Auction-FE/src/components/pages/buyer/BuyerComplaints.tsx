import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Filter,
  ImagePlus,
  Loader2,
  MessageSquare,
  Package,
  ShieldAlert,
  TriangleAlert,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { orderService } from "@/services/orderService";
import { complaintService, type Complaint } from "@/services/complaintService";
import { cloudinaryService } from "@/services/cloudinaryService";
import type { Order } from "@/types/orders";
import { useAppDispatch } from "@/hooks/redux";
import { selectContact } from "@/components/chat/chatSlice";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(n);
}

function statusMeta(status: string) {
  switch (status) {
    case "PENDING_SELLER":
      return {
        label: "Chờ seller phản hồi",
        className: "bg-amber-100 text-amber-800",
        icon: Clock3,
      };
    case "PENDING_ADMIN":
      return {
        label: "Chờ admin xử lý",
        className: "bg-blue-100 text-blue-800",
        icon: ShieldAlert,
      };
    case "CLOSED":
      return {
        label: "Đã đóng",
        className: "bg-emerald-100 text-emerald-800",
        icon: CheckCircle2,
      };
    default:
      return {
        label: status,
        className: "bg-slate-100 text-slate-700",
        icon: TriangleAlert,
      };
  }
}

const ACTION_LABELS: Record<string, string> = {
  ACCEPT_COMPLAINT: "Chấp nhận khiếu nại",
  PROPOSE_SOLUTION: "Đề xuất xử lý",
  DISPUTE: "Không đồng ý / Đối chất",
  ACCEPT_REFUND: "Đồng ý hoàn tiền",
};

const VERDICT_LABELS: Record<string, string> = {
  REFUND_TO_BUYER: "Hoàn tiền cho người mua",
  REQUEST_REPLACEMENT: "Yêu cầu đổi sản phẩm",
  REJECT_COMPLAINT: "Từ chối khiếu nại",
};

const isVideoUrl = (url: string) =>
  /\.(mp4|webm|mov|m4v|ogg)(\?|$)/i.test(url) || url.includes("/video/upload/");

function ComplaintModal({
  open,
  orderId,
  onClose,
  onSuccess,
}: {
  open: boolean;
  orderId: number;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [reason, setReason] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setReason("");
      setFiles([]);
      setPreviews([]);
      setLoading(false);
    }
  }, [open]);

  useEffect(() => {
    const nextPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews(nextPreviews);
    return () => {
      nextPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  if (!open) return null;

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error("Vui lòng nhập nội dung khiếu nại.");
      return;
    }

    try {
      setLoading(true);
      let evidenceUrls: string[] = [];

      if (files.length > 0) {
        toast.loading("Đang tải lên hình ảnh/video minh chứng...", {
          id: "uploading",
        });
        const uploadResults = await cloudinaryService.uploadMultiMedia(files);
        evidenceUrls = uploadResults.map((res) => res.url);
        toast.dismiss("uploading");
      }

      await complaintService.createComplaint({
        orderId,
        reason: reason.trim(),
        evidenceUrls,
      });
      toast.success("Đã gửi khiếu nại thành công.");
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.dismiss("uploading");
      toast.error("Không thể gửi khiếu nại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#375F97]">
              Khiếu nại đơn hàng
            </p>
            <h3 className="text-xl font-black text-slate-900">
              Gửi yêu cầu kèm hình ảnh
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Nội dung khiếu nại
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={5}
              placeholder="Mô tả rõ vấn đề bạn gặp phải..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#375F97] focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Ảnh / Video minh chứng
            </label>
            <label className="flex cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500 transition hover:border-[#375F97] hover:bg-blue-50/50">
              <ImagePlus className="h-5 w-5 text-[#375F97]" />
              <span>Chọn tệp từ thiết bị</span>
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {previews.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {previews.map((preview, index) => (
                <div
                  key={`${preview}-${index}`}
                  className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-slate-50"
                >
                  {isVideoUrl(files[index].name) || files[index].type.startsWith("video/") ? (
                    <video
                      src={preview}
                      className="h-32 w-full object-cover"
                    />
                  ) : (
                    <img
                      src={preview}
                      alt={`Ảnh minh chứng ${index + 1}`}
                      className="h-32 w-full object-cover"
                    />
                  )}
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-start gap-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Hãy mô tả ngắn gọn và đính kèm ảnh/video để quá trình xử lý nhanh hơn.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#375F97] to-blue-500 px-5 py-3 text-sm font-bold text-white transition hover:from-[#2d4f80] hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                "Gửi khiếu nại"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

type TabType = "ORDERS" | "COMPLAINTS";

export default function BuyerComplaints() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [orders, setOrders] = useState<Order[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabType>("COMPLAINTS");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [selectedComplaintId, setSelectedComplaintId] = useState<number | null>(
    null,
  );
  const [modalOpen, setModalOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [orderData, complaintData] = await Promise.all([
        orderService.getMyOrders(),
        complaintService.listComplaints(),
      ]);

      const sortedOrders = [...orderData].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      const sortedComplaints = [...complaintData].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setOrders(sortedOrders);
      setComplaints(sortedComplaints);

      setSelectedOrderId((prev) => prev ?? sortedOrders[0]?.id ?? null);
      setSelectedComplaintId((prev) => prev ?? sortedComplaints[0]?.complaintId ?? null);
    } catch (error) {
      console.error(error);
      toast.error("Không tải được dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedOrderId) ?? null,
    [orders, selectedOrderId],
  );

  const selectedComplaint = useMemo(
    () =>
      complaints.find((c) => c.complaintId === selectedComplaintId) ?? null,
    [complaints, selectedComplaintId],
  );

  const handleChatWithSeller = (sellerId: number) => {
    dispatch(selectContact({ contactId: sellerId, isComplaintMode: true }));
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate("/buyer/orders")}
          className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại đơn hàng
        </button>

        <div className="mb-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-[#375F97] px-6 py-7 text-white shadow-xl">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
            <TriangleAlert className="h-3.5 w-3.5" />
            Complaint Center
          </p>
          <h1 className="text-3xl font-black">Trang khiếu nại</h1>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setTab("COMPLAINTS")}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                tab === "COMPLAINTS"
                  ? "bg-white text-slate-900"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              Danh sách khiếu nại
            </button>
            <button
              onClick={() => setTab("ORDERS")}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                tab === "ORDERS"
                  ? "bg-white text-slate-900"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              Khiếu nại đơn hàng mới
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-40 animate-pulse rounded-3xl bg-white"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
            <aside className="space-y-3">
              {tab === "ORDERS" ? (
                orders.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center">
                    <Package className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                    <p className="text-sm font-semibold text-slate-500">
                      Chưa có đơn hàng nào
                    </p>
                  </div>
                ) : (
                  orders.map((order) => (
                    <button
                      key={order.id}
                      type="button"
                      onClick={() => setSelectedOrderId(order.id)}
                      className={`w-full rounded-3xl border p-4 text-left transition ${
                        order.id === selectedOrderId
                          ? "border-[#375F97] bg-blue-50 shadow-sm"
                          : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
                          {order.imageUrl ? (
                            <img
                              src={order.imageUrl}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Package className="h-5 w-5 text-slate-300" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            #{order.code || order.id}
                          </p>
                          <p className="truncate text-sm font-bold text-slate-900">
                            {order.productName ??
                              order.auctionTitle ??
                              `Đơn #${order.id}`}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {order.sellerName} ·{" "}
                            {formatCurrency(Number(order.totalAmount))}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )
              ) : complaints.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center">
                  <TriangleAlert className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                  <p className="text-sm font-semibold text-slate-500">
                    Chưa có khiếu nại nào
                  </p>
                </div>
              ) : (
                complaints.map((complaint) => {
                  const meta = statusMeta(complaint.status);
                  const Icon = meta.icon;
                  return (
                    <button
                      key={complaint.complaintId}
                      type="button"
                      onClick={() => setSelectedComplaintId(complaint.complaintId)}
                      className={`w-full rounded-3xl border p-4 text-left transition ${
                        complaint.complaintId === selectedComplaintId
                          ? "border-[#375F97] bg-blue-50 shadow-sm"
                          : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-slate-400">
                            #{complaint.complaintId} · Đơn #{complaint.orderCode || complaint.orderId}
                          </p>
                          <p className="mt-1 line-clamp-1 text-sm font-bold text-slate-900">
                            {complaint.productName || complaint.reason}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold inline-flex items-center gap-1 ${meta.className}`}
                        >
                          <Icon className="h-2.5 w-2.5" />
                          {meta.label}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-slate-400">
                        {new Date(complaint.createdAt).toLocaleString("vi-VN")}
                      </p>
                    </button>
                  );
                })
              )}
            </aside>

            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              {tab === "ORDERS" ? (
                !selectedOrder ? (
                  <div className="flex min-h-[320px] items-center justify-center text-slate-500">
                    Chọn một đơn hàng để gửi khiếu nại
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        Đơn hàng đã chọn
                      </p>
                      <h2 className="mt-2 text-2xl font-black text-slate-900">
                        {selectedOrder.productName ??
                          selectedOrder.auctionTitle ??
                          `Đơn #${selectedOrder.id}`}
                      </h2>
                      <p className="mt-1 text-sm text-slate-600">
                        Mã đơn: #{selectedOrder.code ?? selectedOrder.id}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Người bán: {selectedOrder.sellerName}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Giá trị: {formatCurrency(Number(selectedOrder.totalAmount))}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 p-5">
                      <p className="text-sm text-slate-600">
                        Bấm nút bên dưới để mở form gửi khiếu nại cho đơn hàng
                        này.
                      </p>
                      <button
                        type="button"
                        onClick={() => setModalOpen(true)}
                        className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#375F97] to-blue-500 px-5 py-3 text-sm font-bold text-white transition hover:from-[#2d4f80] hover:to-blue-600"
                      >
                        <TriangleAlert className="h-4 w-4" />
                        Gửi khiếu nại
                      </button>
                    </div>
                  </div>
                )
              ) : !selectedComplaint ? (
                <div className="flex min-h-[320px] items-center justify-center text-slate-500">
                  Chọn một khiếu nại để xem chi tiết
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#375F97]">
                          Khiếu nại #{selectedComplaint.complaintId}
                        </span>
                        {(() => {
                          const meta = statusMeta(selectedComplaint.status);
                          const Icon = meta.icon;
                          return (
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold inline-flex items-center gap-1.5 ${meta.className}`}
                            >
                              <Icon className="h-3.5 w-3.5" />
                              {meta.label}
                            </span>
                          );
                        })()}
                      </div>
                      <h2 className="mt-2 text-2xl font-black text-slate-900">
                        {selectedComplaint.productName || `Đơn hàng #${selectedComplaint.orderId}`}
                      </h2>
                      <p className="mt-1 text-sm text-slate-600">
                        Mã đơn: #{selectedComplaint.orderCode || selectedComplaint.orderId}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Người bán: {selectedComplaint.sellerName}
                      </p>
                      <p className="mt-4 text-sm leading-6 text-slate-600 bg-slate-50 p-4 rounded-2xl">
                        <span className="block text-xs font-bold text-slate-400 uppercase mb-1">Lý do khiếu nại:</span>
                        {selectedComplaint.reason}
                      </p>
                    </div>
                    <div className="shrink-0 flex flex-col gap-2">
                      <button
                        onClick={() => handleChatWithSeller(selectedComplaint.sellerId)}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Chat với người bán
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        Ảnh minh chứng
                      </p>
                      {selectedComplaint.evidenceUrls?.length ? (
                        <div className="mt-3 grid grid-cols-2 gap-3">
                          {selectedComplaint.evidenceUrls.map((url) => (
                            <a
                              key={url}
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="overflow-hidden rounded-2xl border border-white bg-white shadow-sm group relative"
                            >
                              {isVideoUrl(url) ? (
                                <video
                                  src={url}
                                  className="h-32 w-full object-cover"
                                />
                              ) : (
                                <img
                                  src={url}
                                  alt="Ảnh minh chứng"
                                  className="h-32 w-full object-cover"
                                />
                              )}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all text-white text-[10px] font-bold">
                                Phóng to
                              </div>
                            </a>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-slate-500">
                          Không có ảnh đính kèm.
                        </p>
                      )}
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        Phản hồi seller
                      </p>
                      {selectedComplaint.sellerAction ||
                      selectedComplaint.sellerMessage ||
                      selectedComplaint.sellerEvidence ? (
                        <div className="mt-3 space-y-3 text-sm text-slate-700">
                          {selectedComplaint.sellerAction && (
                            <p>
                              <span className="font-semibold">Hành động:</span>{" "}
                              {ACTION_LABELS[selectedComplaint.sellerAction] || selectedComplaint.sellerAction}
                            </p>
                          )}
                          {selectedComplaint.sellerMessage && (
                            <p>
                              <span className="font-semibold">Nội dung:</span>{" "}
                              {selectedComplaint.sellerMessage}
                            </p>
                          )}
                          {selectedComplaint.sellerEvidence && (
                            <div className="mt-2">
                              <span className="font-semibold">Bằng chứng:</span>
                              {selectedComplaint.sellerEvidence.includes("http") ? (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {selectedComplaint.sellerEvidence.split(", ").map((url, i) => (
                                    <a
                                      key={i}
                                      href={url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="block relative border rounded-lg overflow-hidden group"
                                    >
                                      {isVideoUrl(url) ? (
                                        <video
                                          src={url}
                                          className="w-20 h-20 object-cover"
                                        />
                                      ) : (
                                        <img
                                          src={url}
                                          alt="Minh chứng seller"
                                          className="w-20 h-20 object-cover"
                                        />
                                      )}
                                    </a>
                                  ))}
                                </div>
                              ) : (
                                <p className="mt-1 p-2 bg-white rounded-lg border border-slate-100 text-xs text-slate-500 italic">
                                  {selectedComplaint.sellerEvidence}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-slate-500">
                          Chưa có phản hồi từ seller.
                        </p>
                      )}
                    </div>
                  </div>

                  {selectedComplaint.verdict && (
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                        Phán quyết admin
                      </p>
                      <div className="mt-3 space-y-2 text-sm text-emerald-900">
                        <p>
                          <span className="font-semibold">Kết quả:</span>{" "}
                          {VERDICT_LABELS[selectedComplaint.verdict] || selectedComplaint.verdict}
                        </p>
                        <p>
                          <span className="font-semibold">Ghi chú:</span>{" "}
                          {selectedComplaint.adminNote || "Không có"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
      {selectedOrder && (
        <ComplaintModal
          open={modalOpen}
          orderId={selectedOrder.id}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            void loadData();
            setTab("COMPLAINTS");
          }}
        />
      )}
    </div>
  );
}

