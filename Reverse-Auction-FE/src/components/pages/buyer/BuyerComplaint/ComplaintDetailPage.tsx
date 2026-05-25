import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  Loader2,
  MessageSquare,
  Paperclip,
  ShieldAlert,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAppSelector } from "@/hooks/redux";
import { complaintService } from "@/services/complaintService";
import { useExternalChat } from "@/hooks/useExternalChat";
import type { Complaint } from "@/types/complaint";

const statusMeta: Record<
  Complaint["status"],
  { label: string; className: string }
> = {
  PENDING: { label: "PENDING", className: "bg-amber-100 text-amber-700" },
  RECEIVED: { label: "RECEIVED", className: "bg-blue-100 text-blue-700" },
  PROCESSING: {
    label: "PROCESSING",
    className: "bg-violet-100 text-violet-700",
  },
  RESOLVED: { label: "RESOLVED", className: "bg-emerald-100 text-emerald-700" },
};

const formatDate = (value?: string | null) => {
  if (!value) return "N/A";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const resolveAttachmentUrl = (url: string) => {
  if (!url) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `http://localhost:8080${url}`;
};

const ComplaintDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = location.pathname.startsWith("/admin");
  const complaintId = Number(id);
  const chatRef = useRef<HTMLDivElement>(null);

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusValue, setStatusValue] = useState<Complaint["status"]>("PENDING");
  const [savingStatus, setSavingStatus] = useState(false);

  const {
    selectedConversationId,
    selectedConversation,
    selectedContact,
    messages,
    draft,
    setDraft,
    sending,
    isConnected,
    bottomRef,
    handleSend,
  } = useExternalChat({
    enabled: Boolean(complaint),
    initialConversationId: complaint?.chatRoomId ?? null,
  });

  const canChat = Boolean(complaint?.chatRoomId && selectedConversationId);

  useEffect(() => {
    const load = async () => {
      if (!id || Number.isNaN(complaintId)) {
        toast.error("Không tìm thấy khiếu nại.");
        navigate(isAdmin ? "/admin/complaints" : "/buyer/complaints");
        return;
      }

      setLoading(true);
      try {
        const data = await complaintService.fetchComplaintDetail(complaintId, isAdmin);
        setComplaint(data);
        setStatusValue(data.status);
      } catch (error) {
        console.error(error);
        toast.error("Không tải được chi tiết khiếu nại.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [complaintId, id, isAdmin, navigate]);

  useEffect(() => {
    if (complaint?.chatRoomId) {
      setTimeout(() => {
        chatRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
    }
  }, [complaint?.chatRoomId]);

  const title = useMemo(
    () => (isAdmin ? "Chi tiết khiếu nại" : "Chi tiết khiếu nại của tôi"),
    [isAdmin],
  );

  const handleUpdateStatus = async () => {
    if (!complaint) return;
    setSavingStatus(true);
    try {
      const updated = await complaintService.updateComplaintStatus(complaint.complaintId, {
        status: statusValue,
      });
      setComplaint(updated);
      toast.success("Đã cập nhật trạng thái.");
    } catch (error) {
      console.error(error);
      toast.error("Không cập nhật được trạng thái.");
    } finally {
      setSavingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <p className="text-slate-500">Không tìm thấy khiếu nại.</p>
        <Link
          to={isAdmin ? "/admin/complaints" : "/buyer/complaints"}
          className="text-sm font-semibold text-primary-600 hover:underline"
        >
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const status = statusMeta[complaint.status];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(isAdmin ? "/admin/complaints" : "/buyer/complaints")}
            className="flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
          >
            <ArrowLeft size={16} />
            Quay lại
          </button>
          <div className="flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white">
            <ShieldAlert size={14} />
            Complaint #{complaint.complaintId}
          </div>
        </div>

        <section className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.16),_transparent_30%),linear-gradient(135deg,_#0f172a_0%,_#1e293b_60%,_#334155_100%)] px-6 py-6 text-white">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-300">
                  {title}
                </p>
                <h1 className="mt-2 text-3xl font-black tracking-tight">
                  {complaint.orderId ? `Đơn hàng #${complaint.orderId}` : "Khiếu nại tự do"}
                </h1>
                <p className="mt-1 text-sm text-slate-300">
                  Chat room #{complaint.chatRoomId}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${status.className}`}>
                  {status.label}
                </span>
                {complaint.orderCode && (
                  <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-white">
                    {complaint.orderCode}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-5 p-6">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                  <span>
                    Người tạo: <strong className="text-slate-700">{complaint.buyerName}</strong>
                  </span>
                  <span>•</span>
                  <span>{formatDate(complaint.createdAt)}</span>
                </div>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                  {complaint.content}
                </p>
              </div>

              {complaint.attachmentUrls.length > 0 && (
                <div>
                  <h2 className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-slate-500">
                    Đính kèm
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {complaint.attachmentUrls.map((url) => {
                      const resolvedUrl = resolveAttachmentUrl(url);
                      const isImage = /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(url);
                      return (
                        <a
                          key={url}
                          href={resolvedUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                          {isImage ? (
                            <img
                              src={resolvedUrl}
                              alt={url}
                              className="h-36 w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-36 items-center justify-center bg-slate-900 text-white">
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

              {isAdmin && (
                <div className="rounded-3xl border border-slate-200 bg-white p-5">
                  <h2 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">
                    Cập nhật trạng thái
                  </h2>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                    <label className="flex-1">
                      <span className="mb-1 block text-sm font-semibold text-slate-700">
                        Trạng thái
                      </span>
                      <select
                        value={statusValue}
                        onChange={(e) => setStatusValue(e.target.value as Complaint["status"])}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="RECEIVED">RECEIVED</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="RESOLVED">RESOLVED</option>
                      </select>
                    </label>
                    <button
                      type="button"
                      onClick={() => void handleUpdateStatus()}
                      disabled={savingStatus}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {savingStatus ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Đang lưu...
                        </>
                      ) : (
                        "Lưu trạng thái"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 bg-slate-50 p-6 lg:border-l lg:border-t-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    Chat khiếu nại
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Trao đổi với admin trong chat room đã được tạo tự động.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => chatRef.current?.scrollIntoView({ behavior: "smooth" })}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <MessageSquare size={16} className="inline-block" /> Mở chat
                </button>
              </div>

              <div ref={chatRef} className="mt-4 rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-slate-950 to-slate-800 px-4 py-3 text-white">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">
                      {selectedConversation?.participantName || selectedContact?.fullName || "Complaint chat"}
                    </p>
                    <p className="truncate text-xs text-slate-300">
                      {selectedConversation?.participantRole || selectedContact?.role || "Admin / Buyer"}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                      isConnected ? "bg-emerald-500/20 text-emerald-200" : "bg-amber-500/20 text-amber-200"
                    }`}
                  >
                    {isConnected ? "Connected" : "Syncing"}
                  </span>
                </div>

                <div className="max-h-[60vh] overflow-y-auto px-4 py-4">
                  {messages.length === 0 ? (
                    <div className="flex min-h-[240px] items-center justify-center text-center">
                      <div>
                        <MessageSquare className="mx-auto mb-3 text-slate-300" size={24} />
                        <p className="text-sm font-semibold text-slate-700">
                          Chưa có tin nhắn
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Gửi tin nhắn đầu tiên để bắt đầu trao đổi.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((message) => {
                        const isMine = message.senderId === user?.id;
                        return (
                          <div
                            key={message.msgId}
                            className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-3xl px-4 py-3 text-sm shadow-sm ${
                                isMine
                                  ? "rounded-br-md bg-slate-900 text-white"
                                  : "rounded-bl-md border border-slate-200 bg-white text-slate-800"
                              }`}
                            >
                              <p className="whitespace-pre-wrap leading-relaxed">
                                {message.content}
                              </p>
                              <p className={`mt-2 text-[11px] ${isMine ? "text-slate-300" : "text-slate-400"}`}>
                                {formatDate(message.time)} {isMine ? "You" : message.senderName}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={bottomRef} />
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-200 p-3">
                  <div className="flex items-end gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-3 py-3">
                    <textarea
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter" &&
                          !event.shiftKey &&
                          !event.nativeEvent.isComposing
                        ) {
                          event.preventDefault();
                          void handleSend();
                        }
                      }}
                      placeholder={canChat ? "Nhập tin nhắn..." : "Đang tải chat room..."}
                      disabled={!canChat || sending || !isConnected}
                      rows={2}
                      className="min-h-12 max-h-32 flex-1 resize-none bg-transparent px-1 py-1 text-sm outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      onClick={() => void handleSend()}
                      disabled={!canChat || !draft.trim() || sending || !isConnected}
                      className="inline-flex h-11 items-center gap-2 rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                    >
                      {sending ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Gửi...
                        </>
                      ) : (
                        "Gửi"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ComplaintDetailPage;
