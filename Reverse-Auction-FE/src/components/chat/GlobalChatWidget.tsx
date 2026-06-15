import {
  ChevronLeft,
  Paperclip,
  MessageSquare,
  Search,
  Send,
  Users,
  X,
} from "lucide-react";
import { useExternalChat } from "@/hooks/useExternalChat";

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
  user?.fullName || user?.email?.split("@")[0] || "Tai khoan";

const getInitials = (value?: string | null) =>
  (value || "Tai khoan")
    .split(" ")
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const GlobalChatWidget = () => {
  const {
    user,
    tab,
    setTab,
    search,
    setSearch,
    contacts,
    conversations,
    messages,
    selectedConversationId,
    selectedContactId,
    selectedConversation,
    selectedContact,
    activePeerName,
    filteredConversations,
    filteredContacts,
    draft,
    setDraft,
    attachment,
    setAttachment,
    loading,
    sending,
    connectionState,
    isConnected,
    isOpen,
    isComplaintMode,
    bottomRef,
    handleSelectConversation,
    handleSelectContact,
    handleSend,
    handleToggleOpen,
  } = useExternalChat({ enabled: true });

  if (!user) return null;

  const renderMessageBody = (message: { content: string; type?: string | null; url?: string | null }) => (
    <div className="space-y-2">
      {message.url && message.type === "video" && (
        <video
          src={message.url}
          controls
          className="max-h-64 w-full rounded-2xl bg-black object-contain"
        />
      )}
      {message.url && message.type !== "video" && (
        <a href={message.url} target="_blank" rel="noreferrer">
          <img
            src={message.url}
            alt={message.content || "Attachment"}
            className="max-h-64 w-full rounded-2xl object-cover"
          />
        </a>
      )}
      {message.content && (
        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
      )}
    </div>
  );

  const renderConversationList = () => {
    if (loading && conversations.length === 0) {
      return <p className="px-4 py-6 text-sm text-slate-500">Loading...</p>;
    }

    if (filteredConversations.length === 0) {
      return (
        <div className="px-4 py-8 text-center text-sm text-slate-500">
          No conversations yet.
        </div>
      );
    }

    return filteredConversations.map((conversation) => {
      const isActive = conversation.conversationId === selectedConversationId;
      const displayName = conversation.participantName || "Tai khoan";

      return (
        <button
          key={conversation.conversationId}
          type="button"
          onClick={() => {
            handleSelectConversation(conversation);
          }}
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
                {conversation.complaintChat && (
                  <span className="ml-1 rounded-full bg-red-500/10 px-1.5 py-0.5 text-[9px] font-bold text-red-500">
                    COMPLAINT
                  </span>
                )}
              </p>
              <span className="shrink-0 text-[11px] text-slate-400">
                {formatTime(
                  conversation.lastMessageAt || conversation.updatedDate,
                )}
              </span>
            </div>

            <p className="truncate text-xs text-slate-500">
              {conversation.participantRole || "User"}
            </p>
            <p className="mt-1 truncate text-sm text-slate-600">
              {conversation.lastMessage || "Start chatting"}
            </p>
          </div>
        </button>
      );
    });
  };

  const renderContactList = () => {
    if (loading && contacts.length === 0) {
      return <p className="px-4 py-6 text-sm text-slate-500">Loading...</p>;
    }

    const filtered = filteredContacts.filter((contact) => {
      // Non-admin users cannot proactively message admins
      if (user.role !== "ROLE_ADMIN" && contact.role === "ROLE_ADMIN") {
        return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      return (
        <div className="px-4 py-8 text-center text-sm text-slate-500">
          No matching users.
        </div>
      );
    }

    return filtered.map((contact) => {
      const existingConversation = conversations.find(
        (conversation) => conversation.participantId === contact.id,
      );
      const isActive = contact.id === selectedContactId;
      const displayName = getDisplayName(contact);

      return (
        <button
          key={contact.id}
          type="button"
          onClick={() => {
            handleSelectContact(contact);
          }}
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
              {existingConversation ? "Conversation exists" : "New message"}
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
              <h2 className="mt-1 text-lg font-semibold">Your chats</h2>
              <p className="text-sm text-slate-300">
                WebSocket only, realtime updates.
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
                Conversations
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
                Users
              </button>
            </div>

            <div className="border-b border-slate-200 p-3">
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2">
                <Search size={16} className="text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                  placeholder="Search..."
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
                  onClick={handleToggleOpen}
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
                    {isComplaintMode && (
                      <span className="ml-2 rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-200">
                        COMPLAINT
                      </span>
                    )}
                  </h3>
                  <p className="truncate text-xs text-slate-300">
                    {selectedConversation?.participantRole ||
                      selectedContact?.role ||
                      "Select a user"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                    connectionState === "connected"
                      ? "bg-emerald-500/20 text-emerald-200"
                      : "bg-amber-500/20 text-amber-200"
                  }`}
                >
                  {connectionState === "connected" ? "Connected" : "Syncing"}
                </span>
                <button
                  type="button"
                  onClick={handleToggleOpen}
                  className="rounded-full border border-white/15 p-2 text-white transition-colors hover:bg-white/10"
                >
                  <X size={18} />
                </button>
              </div>
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
                            Start chatting
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            Send the first message to {activePeerName}.
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
                                {renderMessageBody(message)}
                                <p
                                  className={`mt-2 text-[11px] ${
                                    isMine ? "text-slate-300" : "text-slate-400"
                                  }`}
                                >
                                  {formatTime(message.time)}{" "}
                                  {isMine ? "You" : message.senderName}
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
                        Pick a conversation
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Open a chat from the left to see messages or start a new one.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-200 bg-white p-3">
                {attachment && (
                  <div className="mb-2 flex items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                    <span className="truncate">
                      {attachment.type.startsWith("video/") ? "Video" : "Image"}:{" "}
                      {attachment.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAttachment(null)}
                      className="rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                      aria-label="Remove attachment"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                <div className="flex items-end gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-3 py-3">
                  <label className="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100">
                    <Paperclip size={16} />
                    <input
                      type="file"
                      accept="image/*,video/*"
                      className="sr-only"
                      disabled={!selectedContactId || sending || !isConnected}
                      onChange={(event) => {
                        setAttachment(event.target.files?.[0] ?? null);
                        event.target.value = "";
                      }}
                    />
                  </label>
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
                        ? `Message ${activePeerName}...`
                        : "Select a user to start chatting"
                    }
                    disabled={
                      !selectedContactId ||
                      sending ||
                      !isConnected
                    }
                    rows={2}
                    className="min-h-12 max-h-32 flex-1 resize-none bg-transparent px-1 py-1 text-sm outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => void handleSend()}
                    disabled={
                      !selectedContactId ||
                      (!draft.trim() && !attachment) ||
                      sending ||
                      !isConnected
                    }
                    className="inline-flex h-11 items-center gap-2 rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    <Send size={16} />
                    Send
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleToggleOpen}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-slate-950 to-slate-700 text-white shadow-[0_18px_40px_rgba(15,23,42,0.35)] transition-transform hover:scale-105"
          aria-label="Open chat"
        >
          <MessageSquare size={22} />
        </button>
      )}
    </div>
  );
};

export default GlobalChatWidget;
