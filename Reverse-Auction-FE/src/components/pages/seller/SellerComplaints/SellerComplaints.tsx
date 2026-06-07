import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Filter,
  Loader2,
  MessageSquare,
  Package,
  Send,
  ShieldAlert,
  TriangleAlert,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  complaintService,
  type Complaint,
  type RespondComplaintPayload,
} from "@/services/complaintService";
import { useAppDispatch } from "@/hooks/redux";
import { selectContact } from "@/components/chat/chatSlice";

type ComplaintFilter = "ALL" | "PENDING_SELLER" | "PENDING_ADMIN" | "CLOSED";

const FILTERS: Array<{ key: ComplaintFilter; label: string }> = [
  { key: "ALL", label: "Tất cả" },
  { key: "PENDING_SELLER", label: "Chờ seller" },
  { key: "PENDING_ADMIN", label: "Chờ admin" },
  { key: "CLOSED", label: "Đã đóng" },
];

const ACTION_OPTIONS = [
  { value: "ACCEPT_COMPLAINT", label: "Chấp nhận khiếu nại" },
  { value: "PROPOSE_SOLUTION", label: "Đề xuất xử lý" },
  { value: "DISPUTE", label: "Không đồng ý" },
];

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
        icon: AlertTriangle,
      };
  }
}

export default function SellerComplaints() {
  const dispatch = useAppDispatch();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<ComplaintFilter>("ALL");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [action, setAction] = useState(ACTION_OPTIONS[0].value);
  const [sellerMessage, setSellerMessage] = useState("");
  const [sellerEvidence, setSellerEvidence] = useState("");

  const loadComplaints = async () => {
    try {
      setLoading(true);
      const data = await complaintService.listComplaints();
      setComplaints(data);
      setSelectedId((current) => current ?? data[0]?.complaintId ?? null);
    } catch (error) {
      console.error(error);
      toast.error("Không tải được danh sách khiếu nại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadComplaints();
  }, []);

  const filtered = useMemo(() => {
    return complaints.filter((item) => filter === "ALL" || item.status === filter);
  }, [complaints, filter]);

  const selectedComplaint = useMemo(() => {
    return filtered.find((item) => item.complaintId === selectedId) ?? filtered[0] ?? null;
  }, [filtered, selectedId]);

  useEffect(() => {
    if (!selectedComplaint) return;
    if (selectedComplaint.status !== "PENDING_SELLER") {
      return;
    }
    setAction(selectedComplaint.sellerAction ?? ACTION_OPTIONS[0].value);
    setSellerMessage(selectedComplaint.sellerMessage ?? "");
    setSellerEvidence(selectedComplaint.sellerEvidence ?? "");
  }, [selectedComplaint]);

  const handleSubmit = async () => {
    if (!selectedComplaint) return;
    if (!sellerMessage.trim()) {
      toast.error("Nhập nội dung phản hồi trước khi gửi.");
      return;
    }

    try {
      setSubmitting(true);
      const payload: RespondComplaintPayload = {
        action,
        sellerMessage: sellerMessage.trim(),
        sellerEvidence: sellerEvidence.trim(),
      };
      await complaintService.respondComplaint(selectedComplaint.complaintId, payload);
      toast.success("Đã gửi phản hồi cho khiếu nại.");
      await loadComplaints();
    } catch (error) {
      console.error(error);
      toast.error("Không thể gửi phản hồi.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChatWithBuyer = (buyerId: number) => {
    dispatch(selectContact({ contactId: buyerId, isComplaintMode: true }));
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-[#375F97] px-6 py-7 text-white shadow-xl">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
              <TriangleAlert className="h-3.5 w-3.5" />
              Complaint Center
            </p>
            <h1 className="text-3xl font-black">Quản lý khiếu nại</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/70">
              Xem toàn bộ khiếu nại, phản hồi từ seller, và theo dõi trạng thái xử lý.
            </p>
          </div>
          <button
            type="button"
            onClick={loadComplaints}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
          >
            <Loader2 className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm">
          <Filter className="h-4 w-4 text-[#375F97]" />
          Bộ lọc
        </div>
        {FILTERS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setFilter(item.key)}
            className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
              filter === item.key
                ? "bg-[#375F97] text-white shadow-sm"
                : "bg-white text-slate-600 shadow-sm hover:bg-slate-50"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-slate-900">Danh sách</p>
              <p className="text-xs text-slate-500">
                {filtered.length} khiếu nại
              </p>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-24 animate-pulse rounded-2xl bg-slate-100"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-center">
              <Package className="mb-3 h-10 w-10 text-slate-300" />
              <p className="text-sm font-semibold text-slate-500">
                Không có khiếu nại nào
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((item) => {
                const meta = statusMeta(item.status);
                const ActiveIcon = meta.icon;
                const active = item.complaintId === selectedId;

                return (
                  <button
                    key={item.complaintId}
                    type="button"
                    onClick={() => setSelectedId(item.complaintId)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      active
                        ? "border-[#375F97] bg-blue-50 shadow-sm"
                        : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold text-slate-400">
                          #{item.complaintId} · Order #{item.orderId}
                        </p>
                        <p className="mt-1 line-clamp-2 text-sm font-bold text-slate-900">
                          {item.reason}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${meta.className}`}
                      >
                        <ActiveIcon className="h-3 w-3" />
                        {meta.label}
                      </span>
                    </div>
                    <p className="mt-3 text-xs text-slate-400">
                      {new Date(item.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          {!selectedComplaint ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
              <MessageSquare className="mb-3 h-12 w-12 text-slate-300" />
              <p className="text-sm font-semibold text-slate-500">
                Chọn một khiếu nại để xem chi tiết
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 md:flex-row md:items-start md:justify-between">
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
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${meta.className}`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {meta.label}
                        </span>
                      );
                    })()}
                  </div>
                  <h2 className="mt-2 text-2xl font-black text-slate-900">
                    Order #{selectedComplaint.orderId}
                  </h2>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-[#375F97]">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Người khiếu nại</p>
                      <p className="text-sm font-black text-slate-900">{selectedComplaint.buyerName}</p>
                    </div>
                    <button
                      onClick={() => handleChatWithBuyer(selectedComplaint.buyerId)}
                      className="ml-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      Chat với buyer
                    </button>
                  </div>
                  <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600 bg-slate-50 p-4 rounded-2xl">
                    {selectedComplaint.reason}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  <p className="font-semibold text-slate-900">Thời gian</p>
                  <p className="mt-1">
                    {new Date(selectedComplaint.createdAt).toLocaleString("vi-VN")}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Cập nhật: {new Date(selectedComplaint.updatedAt).toLocaleString("vi-VN")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                          className="overflow-hidden rounded-2xl border border-white bg-white shadow-sm"
                        >
                          <img
                            src={url}
                            alt="Ảnh minh chứng"
                            className="h-36 w-full object-cover"
                          />
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
                    Phản hồi của bạn
                  </p>
                  {selectedComplaint.sellerAction || selectedComplaint.sellerMessage ? (
                    <div className="mt-3 space-y-3 text-sm text-slate-700">
                      <p>
                        <span className="font-semibold text-slate-900">Hành động: </span>
                        {selectedComplaint.sellerAction}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-900">Nội dung: </span>
                        {selectedComplaint.sellerMessage || "Không có"}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-900">Bằng chứng: </span>
                        {selectedComplaint.sellerEvidence || "Không có"}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-slate-500">
                      Bạn chưa gửi phản hồi.
                    </p>
                  )}
                </div>
              </div>

              {selectedComplaint.verdict || selectedComplaint.adminNote ? (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                    Phán quyết admin
                  </p>
                  <div className="mt-3 space-y-2 text-sm text-emerald-900">
                    <p>
                      <span className="font-semibold">Verdict: </span>
                      {selectedComplaint.verdict || "N/A"}
                    </p>
                    <p>
                      <span className="font-semibold">Ghi chú: </span>
                      {selectedComplaint.adminNote || "N/A"}
                    </p>
                    <p>
                      <span className="font-semibold">Final action: </span>
                      {selectedComplaint.finalAction || "N/A"}
                    </p>
                  </div>
                </div>
              ) : null}

              {selectedComplaint.status === "PENDING_SELLER" ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center gap-2">
                    <Send className="h-4 w-4 text-[#375F97]" />
                    <h3 className="text-base font-black text-slate-900">
                      Gửi phản hồi cho buyer
                    </h3>
                  </div>

                  <div className="mt-4 grid gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Hành động
                      </label>
                      <select
                        value={action}
                        onChange={(e) => setAction(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#375F97] focus:bg-white"
                      >
                        {ACTION_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Nội dung phản hồi
                      </label>
                      <textarea
                        value={sellerMessage}
                        onChange={(e) => setSellerMessage(e.target.value)}
                        rows={4}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#375F97] focus:bg-white"
                        placeholder="Giải thích xử lý, hướng giải quyết hoặc yêu cầu bổ sung thông tin..."
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Bằng chứng / ghi chú thêm
                      </label>
                      <textarea
                        value={sellerEvidence}
                        onChange={(e) => setSellerEvidence(e.target.value)}
                        rows={3}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#375F97] focus:bg-white"
                        placeholder="Dán link ảnh, mô tả tình trạng hàng, hoặc thông tin bổ sung..."
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#375F97] to-blue-500 px-5 py-3 text-sm font-bold text-white transition hover:from-[#2d4f80] hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Đang gửi...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Gửi phản hồi
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  <p className="font-semibold text-slate-900">Trạng thái hiện tại</p>
                  <p className="mt-1">
                    Khiếu nại này đã đi qua bước seller hoặc đã đóng. Không thể gửi phản hồi mới.
                  </p>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
