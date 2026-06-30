import { useMemo, useRef, useState } from "react";
import { Bot, ChevronRight, Send, Sparkles, X } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { selectContact } from "@/components/chat/chatSlice";
import { aiChatService } from "@/services/aiChatService";
import type { AiAction, AiChatMessage, AiChatTurn } from "@/types/aiChat";

const starterMessages: AiChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Xin chào, tôi có thể hỗ trợ tìm sản phẩm, tra cứu đơn hàng, giải thích chính sách, hướng dẫn đấu giá và đề xuất thao tác cần xác nhận.",
    provider: "system",
  },
];

const quickPrompts = [
  "Gợi ý sản phẩm phù hợp",
  "Tra cứu đơn hàng của tôi",
  "Chính sách đổi trả như thế nào?",
  "Tôi muốn tạo khiếu nại",
];

const toId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const getNumberPayload = (action: AiAction, key: string) => {
  const value = action.payload?.[key];
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const AiChatWidget = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<AiChatMessage[]>(starterMessages);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const history = useMemo<AiChatTurn[]>(
    () =>
      messages
        .filter((message) => message.id !== "welcome")
        .slice(-8)
        .map((message) => ({
          role: message.role,
          content: message.content,
        })),
    [messages],
  );

  if (!user) return null;

  const scrollToBottom = () => {
    window.setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const sendMessage = async (content: string) => {
    const text = content.trim();
    if (!text || sending) return;

    const userMessage: AiChatMessage = {
      id: toId(),
      role: "user",
      content: text,
    };

    setMessages((current) => [...current, userMessage]);
    setDraft("");
    setSending(true);
    scrollToBottom();

    try {
      const response = await aiChatService.sendMessage({
        message: text,
        history,
      });
      setMessages((current) => [
        ...current,
        {
          id: toId(),
          role: "assistant",
          content: response.message,
          actions: response.suggestedActions,
          provider: response.provider,
        },
      ]);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Khong goi duoc AI assistant",
      );
      setMessages((current) => [
        ...current,
        {
          id: toId(),
          role: "assistant",
          content:
            "Hien tai AI assistant dang gap loi. Hay kiem tra Gemini API key, model, quota hoac ket noi mang.",
          provider: "error",
        },
      ]);
    } finally {
      setSending(false);
      scrollToBottom();
    }
  };

  const handleAction = (action: AiAction) => {
    switch (action.type) {
      case "VIEW_PRODUCT": {
        const sellerId = getNumberPayload(action, "sellerId");
        if (sellerId) {
          navigate(`/shopPage/${sellerId}`);
          setIsOpen(false);
          return;
        }
        navigate("/search");
        setIsOpen(false);
        return;
      }
      case "VIEW_ORDER": {
        const orderId = getNumberPayload(action, "orderId");
        if (!orderId) return;
        if (user.role === "ROLE_SELLER") {
          navigate(`/seller/orders-detail/${orderId}`);
        } else {
          navigate(`/buyer/orders/${orderId}`);
        }
        setIsOpen(false);
        return;
      }
      case "VIEW_AUCTION": {
        const auctionId = getNumberPayload(action, "auctionId");
        if (!auctionId) return;
        navigate(
          user.role === "ROLE_SELLER"
            ? `/seller/auctions/${auctionId}`
            : `/auctions/${auctionId}`,
        );
        setIsOpen(false);
        return;
      }
      case "OPEN_CHAT_WITH_SELLER": {
        const sellerId = getNumberPayload(action, "sellerId");
        if (!sellerId) return;
        dispatch(
          selectContact({ contactId: sellerId, isComplaintMode: false }),
        );
        setIsOpen(false);
        return;
      }
      case "CREATE_COMPLAINT_DRAFT": {
        const content =
          typeof action.payload?.content === "string"
            ? action.payload.content
            : "";
        sessionStorage.setItem("aiComplaintDraft", content);
        navigate(
          user.role === "ROLE_SELLER"
            ? "/seller/complaints"
            : "/buyer/complaints",
        );
        setIsOpen(false);
        return;
      }
      case "START_AUCTION_DRAFT": {
        const title =
          typeof action.payload?.title === "string" ? action.payload.title : "";
        sessionStorage.setItem("aiAuctionDraft", title);
        navigate("/create-auction");
        setIsOpen(false);
        return;
      }
      case "SUGGEST_BID_DRAFT": {
        toast.success(
          "AI da tao goi y bid. Hay kiem tra noi dung truoc khi gui.",
        );
        return;
      }
      default:
        return;
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-61">
      {isOpen ? (
        <div className="flex h-[min(72vh,720px)] w-[calc(100vw-2rem)] max-w-md flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_22px_70px_rgba(15,23,42,0.2)]">
          <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                <Bot size={20} />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold text-slate-900">
                  AI Assistant
                </h2>
                <p className="truncate text-xs text-slate-500">
                  Gemini agent, actions need confirmation
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
              aria-label="Close AI chat"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-50 px-4 py-4">
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[86%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                      message.role === "user"
                        ? "rounded-br-md bg-slate-900 text-white"
                        : "rounded-bl-md border border-slate-200 bg-white text-slate-800"
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </p>
                    {message.role === "assistant" && message.provider && (
                      <p className="mt-2 text-[11px] uppercase tracking-wide text-slate-400">
                        {message.provider}
                      </p>
                    )}
                    {message.actions && message.actions.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.actions.map((action, index) => (
                          <button
                            key={`${action.type}-${index}`}
                            type="button"
                            onClick={() => handleAction(action)}
                            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-white"
                          >
                            <ChevronRight size={14} />
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                    Dang suy nghi...
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </div>

          <div className="border-t border-slate-200 bg-white p-3">
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => void sendMessage(prompt)}
                  disabled={sending}
                  className="shrink-0 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
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
                    void sendMessage(draft);
                  }
                }}
                rows={2}
                disabled={sending}
                placeholder="Hoi ve san pham, don hang, chinh sach..."
                className="min-h-11 max-h-28 flex-1 resize-none bg-transparent py-1 text-sm outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => void sendMessage(draft)}
                disabled={!draft.trim() || sending}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                aria-label="Send AI message"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-900 shadow-[0_18px_40px_rgba(15,23,42,0.28)] ring-1 ring-slate-200 transition-transform hover:scale-105"
          aria-label="Open AI assistant"
        >
          <Sparkles size={21} />
        </button>
      )}
    </div>
  );
};

export default AiChatWidget;
