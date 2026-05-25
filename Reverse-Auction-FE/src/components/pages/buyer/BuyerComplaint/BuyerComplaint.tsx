import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Loader2, Paperclip, Send, ShieldAlert, TriangleAlert } from "lucide-react";
import toast from "react-hot-toast";
import { complaintService } from "@/services/complaintService";
import { orderService } from "@/services/orderService";
import type { Complaint } from "@/types/complaint";
import type { Order } from "@/types/orders";

const statusStyle: Record<
  Complaint["status"],
  { label: string; className: string }
> = {
  PENDING: { label: "PENDING", className: "bg-amber-100 text-amber-700" },
  RECEIVED: { label: "RECEIVED", className: "bg-blue-100 text-blue-700" },
  PROCESSING: { label: "PROCESSING", className: "bg-violet-100 text-violet-700" },
  RESOLVED: { label: "RESOLVED", className: "bg-emerald-100 text-emerald-700" },
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const resolveAttachmentUrl = (url: string) => {
  if (!url) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `http://localhost:8080${url}`;
};

export default function BuyerComplaintPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const data = await complaintService.fetchMyComplaints();
      setComplaints(data);
    } catch (error) {
      console.error(error);
      toast.error("Khong tai duoc danh sach khieu nai.");
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const data = await orderService.getMyOrders();
      setOrders(data);
    } catch (error) {
      console.error(error);
      toast.error("Khong tai duoc danh sach don hang.");
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    void loadComplaints();
    void loadOrders();
  }, []);

  useEffect(() => {
    const presetOrderId = searchParams.get("orderId");
    if (presetOrderId) {
      setSelectedOrderId(presetOrderId);
    }
  }, [searchParams]);

  const totalCount = useMemo(() => complaints.length, [complaints]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!content.trim()) {
      toast.error("Vui long nhap noi dung khieu nai.");
      return;
    }

    setSubmitting(true);
    try {
      await complaintService.createComplaint({
        orderId: selectedOrderId.trim() ? Number(selectedOrderId) : null,
        content: content.trim(),
        attachments,
      });
      toast.success("Da tao khieu nai thanh cong.");
      setSelectedOrderId("");
      setContent("");
      setAttachments([]);
      await loadComplaints();
    } catch (error) {
      console.error(error);
      toast.error("Khong the tao khieu nai. Vui long thu lai.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-8 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_32%),linear-gradient(135deg,_#0f172a_0%,_#1e293b_55%,_#334155_100%)] px-6 py-6 text-white">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-200">
                  <ShieldAlert size={14} />
                  Complaint Center
                </div>
                <h1 className="mt-3 text-3xl font-black tracking-tight">
                  Khiếu nại của tôi
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-300">
                  Tạo khiếu nại liên quan hoặc không liên quan đơn hàng, đính kèm nhiều file, và trao đổi qua chat room được tạo tự động.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-right">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
                  Tổng khiếu nại
                </p>
                <p className="text-3xl font-black">{totalCount}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-0 lg:grid-cols-[420px_minmax(0,1fr)]">
            <form onSubmit={handleSubmit} className="border-b border-slate-100 p-6 lg:border-b-0 lg:border-r">
              <h2 className="text-lg font-black text-slate-900">
                Tạo khiếu nại mới
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Chọn một đơn hàng của bạn nếu khiếu nại liên quan đến đơn hàng. Nếu không, hãy chọn "Không liên quan đơn hàng".
              </p>

              <div className="mt-5 space-y-4">
                <div className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Danh sách đơn hàng
                  </span>
                  <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <label
                      className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition ${
                        selectedOrderId === ""
                          ? "border-amber-300 bg-amber-50"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="complaint-order"
                        checked={selectedOrderId === ""}
                        onChange={() => setSelectedOrderId("")}
                        className="mt-1"
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          Không liên quan đơn hàng
                        </p>
                        <p className="text-xs text-slate-500">
                          Dùng cho khiếu nại chung hoặc vấn đề tài khoản.
                        </p>
                      </div>
                    </label>

                    {loadingOrders ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">
                        Đang tải danh sách đơn hàng...
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">
                        Bạn chưa có đơn hàng nào.
                      </div>
                    ) : (
                      orders.map((order) => {
                        const isSelected = selectedOrderId === String(order.id);
                        return (
                          <label
                            key={order.id}
                            className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition ${
                              isSelected
                                ? "border-slate-900 bg-white"
                                : "border-slate-200 bg-white hover:border-slate-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="complaint-order"
                              checked={isSelected}
                              onChange={() => setSelectedOrderId(String(order.id))}
                              className="mt-1"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="truncate text-sm font-semibold text-slate-900">
                                  #{order.code || order.id}
                                </p>
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                                  {order.status}
                                </span>
                              </div>
                              <p className="mt-1 truncate text-xs text-slate-500">
                                {order.productName || order.auctionTitle || "Đơn hàng"}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                Tổng tiền: {Number(order.totalAmount).toLocaleString("vi-VN")} VND
                              </p>
                            </div>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>

                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-slate-700">
                    Nội dung khiếu nại
                  </span>
                  <textarea
                    rows={7}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Mô tả vấn đề, yêu cầu xử lý..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-slate-700">
                    Tệp đính kèm
                  </span>
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4">
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={(e) => setAttachments(Array.from(e.target.files ?? []))}
                      className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
                    />
                    <p className="mt-2 text-xs text-slate-500">
                      Hỗ trợ ảnh và video. Có thể chọn nhiều tệp cùng lúc.
                    </p>
                    {attachments.length > 0 && (
                      <ul className="mt-3 space-y-1 text-xs text-slate-600">
                        {attachments.map((file) => (
                          <li key={`${file.name}-${file.size}`} className="flex items-center gap-2">
                            <Paperclip size={12} />
                            <span className="truncate">{file.name}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Gửi khiếu nại
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    Danh sách khiếu nại
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Theo dõi trạng thái xử lý và phòng chat của từng khiếu nại.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void loadComplaints()}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Làm mới
                </button>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="h-28 animate-pulse rounded-3xl bg-slate-100" />
                  ))}
                </div>
              ) : complaints.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center">
                  <TriangleAlert className="mx-auto mb-3 text-slate-300" size={30} />
                  <p className="text-sm font-semibold text-slate-500">
                    Chưa có khiếu nại nào
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Tạo khiếu nại mới ở cột bên trái để bắt đầu.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {complaints.map((complaint) => {
                    const meta = statusStyle[complaint.status];
                    return (
                      <article
                        key={complaint.complaintId}
                        className="w-full rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-base font-black text-slate-900">
                                Complaint #{complaint.complaintId}
                              </h3>
                              <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${meta.className}`}>
                                {meta.label}
                              </span>
                              <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
                                Chat room #{complaint.chatRoomId}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-slate-500">
                              {complaint.orderId ? (
                                <>
                                  Đơn hàng:{" "}
                                  <span className="font-semibold text-slate-700">
                                    #{complaint.orderId}
                                  </span>
                                  {complaint.orderCode ? ` (${complaint.orderCode})` : ""}
                                </>
                              ) : (
                                "Không liên quan đơn hàng"
                              )}
                            </p>
                            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                              {complaint.content}
                            </p>
                          </div>
                          <div className="text-sm text-slate-400 md:text-right">
                            <p>{formatDate(complaint.createdAt)}</p>
                            <p className="mt-1">Cập nhật: {formatDate(complaint.updatedAt)}</p>
                          </div>
                        </div>

                        {complaint.attachmentUrls.length > 0 && (
                          <div className="mt-4 border-t border-slate-100 pt-4">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                              Tệp đính kèm
                            </p>
                            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                              {complaint.attachmentUrls.map((url) => {
                                const resolvedUrl = resolveAttachmentUrl(url);
                                const isImage = /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(url);
                                return (
                                  <a
                                    key={url}
                                    href={resolvedUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition hover:-translate-y-0.5 hover:shadow-md"
                                  >
                                    {isImage ? (
                                      <img
                                        src={resolvedUrl}
                                        alt={url}
                                        className="h-32 w-full object-cover"
                                      />
                                    ) : (
                                      <div className="flex h-32 items-center justify-center bg-slate-900 text-white">
                                        <Paperclip size={18} />
                                      </div>
                                    )}
                                    <div className="px-3 py-2">
                                      <p className="truncate text-xs font-medium text-slate-600">
                                        {url.split("/").pop()}
                                      </p>
                                    </div>
                                  </a>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                          <span>
                            Phòng chat đã được tạo tự động. Mở chi tiết để xem và trao đổi.
                          </span>
                          <button
                            type="button"
                            onClick={() => navigate(`/buyer/complaints/${complaint.complaintId}`)}
                            className="shrink-0 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                          >
                            Xem chi tiết
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
