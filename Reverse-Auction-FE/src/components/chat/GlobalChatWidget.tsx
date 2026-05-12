import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  MessageSquare,
  Search,
  Send,
  Users,
  X,
} from "lucide-react";
import { useAppSelector } from "@/hooks/redux";
import { externalChatService } from "@/services/externalChatService";
import type {
  ChatUser,
  ExternalConversation,
  ExternalMessage,
} from "@/types/externalChat";
import toast from "react-hot-toast";

type ChatTab = "conversations" | "contacts";

const timeFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const formatTime = (value?: string | null) => {
  if (!value) return "";
  return timeFormatter.format(new Date(value));
};

const getDisplayName = (user?: { fullName?: string; email?: string } | null) =>
  user?.fullName || user?.email?.split("@")[0] || "Tài khoản";

const getInitials = (value?: string | null) =>
  (value || "Tài khoản")
    .split(" ")
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const GlobalChatWidget = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<ChatTab>("conversations");
  const [search, setSearch] = useState("");
  const [contacts, setContacts] = useState<ChatUser[]>([]);
  const [conversations, setConversations] = useState<ExternalConversation[]>(
    [],
  );
  const [messages, setMessages] = useState<ExternalMessage[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<
    number | null
  >(null);
  const [selectedContactId, setSelectedContactId] = useState<number | null>(
    null,
  );
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const selectedConversation = useMemo(
    () =>
      conversations.find(
        (conversation) => conversation.conversationId === selectedConversationId,
      ) ?? null,
    [conversations, selectedConversationId],
  );

  const selectedContact = useMemo(() => {
    if (selectedConversation) {
      return (
        contacts.find(
          (contact) => contact.id === selectedConversation.participantId,
        ) ?? null
      );
    }

    return contacts.find((contact) => contact.id === selectedContactId) ?? null;
  }, [contacts, selectedContactId, selectedConversation]);

  const activePeerName =
    selectedConversation?.participantName ||
    getDisplayName(selectedContact) ||
    "Chọn người để bắt đầu";

  const filteredConversations = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return conversations;

    return conversations.filter((conversation) =>
      [conversation.participantName, conversation.participantEmail]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(keyword)),
    );
  }, [conversations, search]);

  const filteredContacts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return contacts;

    return contacts.filter((contact) =>
      [contact.fullName, contact.email, contact.role]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(keyword)),
    );
  }, [contacts, search]);

  const loadConversations = useCallback(async () => {
    const data = await externalChatService.fetchConversations();
    setConversations(data);

    if (!selectedConversationId && data.length > 0 && !selectedContactId) {
      setSelectedConversationId(data[0].conversationId);
      setSelectedContactId(data[0].participantId);
    }
  }, [selectedConversationId, selectedContactId]);

  const loadContacts = useCallback(async () => {
    const data = await externalChatService.fetchContacts();
    setContacts(data);
  }, []);

  const loadMessages = useCallback(async (conversationId: number) => {
    const data = await externalChatService.fetchMessages(conversationId);
    setMessages(data);
  }, []);

  const refreshAll = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      await Promise.all([loadConversations(), loadContacts()]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Không tải được dữ liệu chat";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [loadConversations, loadContacts, user]);

  useEffect(() => {
    if (!isOpen || !user) return;
    void refreshAll();
  }, [isOpen, user?.id, refreshAll]);

  useEffect(() => {
    if (!isOpen || !user || !selectedConversationId) {
      setMessages([]);
      return;
    }

    void loadMessages(selectedConversationId).catch(() => {
      toast.error("Không tải được tin nhắn");
    });
  }, [isOpen, user?.id, selectedConversationId, loadMessages]);

  useEffect(() => {
    if (!isOpen || !user) return;

    const timer = window.setInterval(() => {
      void loadConversations().catch(() => undefined);
      if (selectedConversationId) {
        void loadMessages(selectedConversationId).catch(() => undefined);
      }
    }, 5000);

    return () => window.clearInterval(timer);
  }, [
    isOpen,
    user?.id,
    selectedConversationId,
    loadConversations,
    loadMessages,
  ]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedConversationId]);

  const handleSelectConversation = useCallback(
    (conversation: ExternalConversation) => {
      setTab("conversations");
      setSelectedConversationId(conversation.conversationId);
      setSelectedContactId(conversation.participantId);
      setIsOpen(true);
    },
    [],
  );

  const handleSelectContact = useCallback(
    (contact: ChatUser) => {
      const existingConversation = conversations.find(
        (conversation) => conversation.participantId === contact.id,
      );

      setTab("contacts");
      setSelectedContactId(contact.id);
      setSelectedConversationId(existingConversation?.conversationId ?? null);
      setIsOpen(true);
    },
    [conversations],
  );

  const handleSend = useCallback(async () => {
    if (!selectedContactId || !draft.trim()) return;

    setSending(true);
    try {
      const response = await externalChatService.sendMessage({
        receiverId: selectedContactId,
        content: draft.trim(),
      });

      setDraft("");
      setSelectedConversationId(response.conversationId);
      setSelectedContactId(response.receiverId);
      await refreshAll();
      await loadMessages(response.conversationId);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Không gửi được tin nhắn";
      toast.error(message);
    } finally {
      setSending(false);
    }
  }, [draft, loadMessages, refreshAll, selectedContactId]);

  if (!user) return null;

  const renderConversationList = () => {
    if (loading && conversations.length === 0) {
      return <p className="px-4 py-6 text-sm text-slate-500">Đang tải...</p>;
    }

    if (filteredConversations.length === 0) {
      return (
        <div className="px-4 py-8 text-center text-sm text-slate-500">
          Chưa có cuộc trò chuyện nào.
        </div>
      );
    }

    return filteredConversations.map((conversation) => {
      const isActive = conversation.conversationId === selectedConversationId;
      const displayName = conversation.participantName || "Tài khoản";

      return (
        <button
          key={conversation.conversationId}
          type="button"
          onClick={() => handleSelectConversation(conversation)}
          className={`flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left transition-colors hover:bg-slate-50 ${
            isActive ? "bg-primary-50" : ""
          }`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
            {getInitials(displayName)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-semibold text-slate-900">
                {displayName}
              </p>
              <span className="shrink-0 text-[11px] text-slate-400">
                {formatTime(
                  conversation.lastMessageAt || conversation.updatedDate,
                )}
              </span>
            </div>
            <p className="truncate text-xs text-slate-500">
              {conversation.participantRole || "Người dùng"}
            </p>
            <p className="mt-1 truncate text-sm text-slate-600">
              {conversation.lastMessage || "Bắt đầu cuộc trò chuyện"}
            </p>
          </div>
        </button>
      );
    });
  };

  const renderContactList = () => {
    if (loading && contacts.length === 0) {
      return <p className="px-4 py-6 text-sm text-slate-500">Đang tải...</p>;
    }

    if (filteredContacts.length === 0) {
      return (
        <div className="px-4 py-8 text-center text-sm text-slate-500">
          Không tìm thấy người dùng phù hợp.
        </div>
      );
    }

    return filteredContacts.map((contact) => {
      const existingConversation = conversations.find(
        (conversation) => conversation.participantId === contact.id,
      );
      const isActive = contact.id === selectedContactId;
      const displayName = getDisplayName(contact);

      return (
        <button
          key={contact.id}
          type="button"
          onClick={() => handleSelectContact(contact)}
          className={`flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left transition-colors hover:bg-slate-50 ${
            isActive ? "bg-primary-50" : ""
          }`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-900 to-slate-700 text-xs font-semibold text-white">
            {getInitials(displayName)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-semibold text-slate-900">
                {displayName}
              </p>
              <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                {contact.role?.replace("ROLE_", "")}
              </span>
            </div>
            <p className="truncate text-xs text-slate-500">{contact.email}</p>
            <p className="mt-1 text-sm text-slate-600">
              {existingConversation ? "Đã có cuộc trò chuyện" : "Nhắn tin mới"}
            </p>
          </div>
        </button>
      );
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-[60]">
      {isOpen ? (
        <div className="flex h-[min(72vh,760px)] w-[calc(100vw-2rem)] max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
          <aside className="hidden w-80 shrink-0 border-r border-slate-200 bg-slate-50 md:flex md:flex-col">
            <div className="border-b border-slate-200 bg-slate-900 px-4 py-4 text-white">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                External Chat
              </p>
              <h2 className="mt-1 text-lg font-semibold">Tin nhắn của bạn</h2>
              <p className="text-sm text-slate-300">
                Chat trực tiếp với mọi tài khoản trong hệ thống.
              </p>
            </div>

            <div className="flex items-center gap-2 border-b border-slate-200 p-3">
              <button
                type="button"
                onClick={() => setTab("conversations")}
                className={`flex-1 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                  tab === "conversations"
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-100"
                }`}
              >
                Cuộc trò chuyện
              </button>
              <button
                type="button"
                onClick={() => setTab("contacts")}
                className={`flex-1 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                  tab === "contacts"
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-100"
                }`}
              >
                Người dùng
              </button>
            </div>

            <div className="border-b border-slate-200 p-3">
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2">
                <Search size={16} className="text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                  placeholder="Tìm kiếm..."
                />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {tab === "conversations"
                ? renderConversationList()
                : renderContactList()}
            </div>
          </aside>

          <section className="flex min-w-0 flex-1 flex-col bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-slate-950 to-slate-800 px-4 py-3 text-white">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full border border-white/15 p-2 text-white transition-colors hover:bg-white/10 md:hidden"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-semibold">
                  {getInitials(activePeerName)}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold">
                    {activePeerName}
                  </h3>
                  <p className="truncate text-xs text-slate-300">
                    {selectedConversation?.participantRole ||
                      selectedContact?.role ||
                      "Chọn một người để chat"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-white/15 p-2 text-white transition-colors hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.08),_transparent_35%),linear-gradient(to_bottom,_#ffffff,_#f8fafc)]">
              <div className="flex-1 overflow-y-auto px-4 py-4">
                {selectedConversationId || selectedContactId ? (
                  <>
                    {messages.length === 0 ? (
                      <div className="flex h-full items-center justify-center py-12">
                        <div className="max-w-sm rounded-3xl border border-dashed border-slate-200 bg-white/80 px-6 py-8 text-center shadow-sm">
                          <Users className="mx-auto mb-3 text-slate-400" size={24} />
                          <p className="text-sm font-medium text-slate-700">
                            Bắt đầu cuộc trò chuyện
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            Gửi tin nhắn đầu tiên để tạo cuộc trò chuyện với{" "}
                            {activePeerName}.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {messages.map((message) => {
                          const isMine = message.senderId === user.id;
                          return (
                            <div
                              key={message.msgId}
                              className={`flex ${
                                isMine ? "justify-end" : "justify-start"
                              }`}
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
                                <p
                                  className={`mt-2 text-[11px] ${
                                    isMine ? "text-slate-300" : "text-slate-400"
                                  }`}
                                >
                                  {formatTime(message.time)}{" "}
                                  {isMine ? "Bạn" : message.senderName}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={bottomRef} />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center py-12">
                    <div className="max-w-sm rounded-3xl border border-slate-200 bg-white px-6 py-8 text-center shadow-sm">
                      <MessageSquare
                        className="mx-auto mb-3 text-primary-600"
                        size={26}
                      />
                      <p className="text-sm font-semibold text-slate-800">
                        Chọn một cuộc trò chuyện
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Bấm vào danh sách bên trái để xem tin nhắn hoặc bắt đầu chat mới.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-200 bg-white p-3">
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
                    placeholder={
                      selectedContactId
                        ? `Nhắn cho ${activePeerName}...`
                        : "Chọn người dùng để bắt đầu chat"
                    }
                    disabled={!selectedContactId || sending}
                    rows={2}
                    className="min-h-12 max-h-32 flex-1 resize-none bg-transparent px-1 py-1 text-sm outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => void handleSend()}
                    disabled={!selectedContactId || !draft.trim() || sending}
                    className="inline-flex h-11 items-center gap-2 rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    <Send size={16} />
                    Gửi
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-slate-950 to-slate-700 text-white shadow-[0_18px_40px_rgba(15,23,42,0.35)] transition-transform hover:scale-105"
          aria-label="Mở chat"
        >
          <MessageSquare size={22} />
        </button>
      )}
    </div>
  );
};

export default GlobalChatWidget;
