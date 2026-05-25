import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAppSelector } from "@/hooks/redux";
import { externalChatService } from "@/services/externalChatService";
import { createExternalChatSocket } from "@/services/externalChatSocket";
import type {
  ChatUser,
  ExternalConversation,
  ExternalMessage,
} from "@/types/externalChat";
import toast from "react-hot-toast";

export type ChatTab = "conversations" | "contacts";
type ConnectionState = "idle" | "connecting" | "connected" | "reconnecting";

type UseExternalChatOptions = {
  enabled: boolean;
  initialConversationId?: number | null;
};

const formatChatError = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export const useExternalChat = ({
  enabled,
  initialConversationId = null,
}: UseExternalChatOptions) => {
  const { user } = useAppSelector((state) => state.auth);
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
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("idle");
  const bottomRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<ReturnType<typeof createExternalChatSocket> | null>(
    null,
  );
  const reconnectTimerRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const manualCloseRef = useRef(false);
  const connectSocketRef = useRef<(() => void) | null>(null);
  const ensuringConversationRef = useRef<number | null>(null);

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
    selectedContact?.fullName ||
    selectedContact?.email?.split("@")[0] ||
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

  const appendMessage = useCallback((message: ExternalMessage) => {
    setMessages((current) => {
      const exists = current.some((item) => item.msgId === message.msgId);
      if (exists) {
        return current.map((item) =>
          item.msgId === message.msgId ? message : item,
        );
      }

      return [...current, message];
    });
  }, []);

  const loadConversations = useCallback(async () => {
    const data = await externalChatService.fetchConversations();
    setConversations(data);

    if (initialConversationId != null) {
      const target = data.find(
        (conversation) => conversation.conversationId === initialConversationId,
      );
      if (target) {
        setSelectedConversationId(target.conversationId);
        setSelectedContactId(target.participantId);
        return;
      }
    }

    setSelectedConversationId((currentConversationId) => {
      if (currentConversationId || data.length === 0) {
        return currentConversationId;
      }

      setSelectedContactId(data[0].participantId);
      return data[0].conversationId;
    });

    if (!selectedConversationId && data.length > 0 && !selectedContactId) {
      setSelectedContactId(data[0].participantId);
    }
  }, [initialConversationId, selectedConversationId, selectedContactId]);

  const loadContacts = useCallback(async () => {
    const data = await externalChatService.fetchContacts();
    setContacts(data);
  }, []);

  const loadMessages = useCallback(async (conversationId: number) => {
    const data = await externalChatService.fetchMessages(conversationId);
    setMessages(data);
  }, []);

  useEffect(() => {
    if (!enabled || !user || !selectedContactId || selectedConversationId != null) {
      return;
    }

    if (ensuringConversationRef.current === selectedContactId) {
      return;
    }

    ensuringConversationRef.current = selectedContactId;
    void externalChatService
      .ensureConversation(selectedContactId)
      .then((conversation) => {
        setConversations((current) => {
          const exists = current.some(
            (item) => item.conversationId === conversation.conversationId,
          );
          if (exists) {
            return current.map((item) =>
              item.conversationId === conversation.conversationId ? conversation : item,
            );
          }
          return [conversation, ...current];
        });
        setSelectedConversationId(conversation.conversationId);
        setSelectedContactId(conversation.participantId);
      })
      .catch((error) => {
        toast.error(formatChatError(error, "Không thể tạo cuộc trò chuyện"));
      })
      .finally(() => {
        ensuringConversationRef.current = null;
      });
  }, [enabled, selectedContactId, selectedConversationId, user]);

  const refreshAll = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      await Promise.all([loadConversations(), loadContacts()]);
    } catch (error) {
      toast.error(
        formatChatError(error, "Không tải được dữ liệu chat"),
      );
    } finally {
      setLoading(false);
    }
  }, [loadConversations, loadContacts, user]);

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current != null) {
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const openSocket = useCallback(() => {
    if (!enabled || !user || !selectedContactId) {
      return;
    }

    clearReconnectTimer();
    manualCloseRef.current = false;
    socketRef.current?.close();
    socketRef.current = null;

    setConnectionState(
      reconnectAttemptsRef.current > 0 ? "reconnecting" : "connecting",
    );

    const socket = createExternalChatSocket(selectedConversationId, {
      onOpen: () => {
        reconnectAttemptsRef.current = 0;
        setConnectionState("connected");
      },
      onMessage: (message) => {
        appendMessage(message);
        void loadConversations().catch(() => undefined);

        const peerId =
          message.senderId === user.id ? message.receiverId : message.senderId;
        setSelectedConversationId(message.conversationId);
        setSelectedContactId(peerId);
      },
      onClose: () => {
        socketRef.current = null;

        if (!enabled || manualCloseRef.current || !selectedContactId) {
          setConnectionState(enabled ? "idle" : "idle");
          return;
        }

        reconnectAttemptsRef.current += 1;
        const delay = Math.min(
          1000 * 2 ** (reconnectAttemptsRef.current - 1),
          10000,
        );
        setConnectionState("reconnecting");
        clearReconnectTimer();
        reconnectTimerRef.current = window.setTimeout(() => {
          connectSocketRef.current?.();
        }, delay);
      },
      onError: () => {
        if (!enabled || manualCloseRef.current || !selectedContactId) {
          return;
        }

        setConnectionState("reconnecting");
      },
    });

    socketRef.current = socket;
  }, [
    appendMessage,
    clearReconnectTimer,
    enabled,
    loadConversations,
    selectedContactId,
    selectedConversationId,
    user,
  ]);

  useEffect(() => {
    connectSocketRef.current = openSocket;
  }, [openSocket]);

  useEffect(() => {
    if (!enabled || !user) {
      manualCloseRef.current = true;
      clearReconnectTimer();
      socketRef.current?.close();
      socketRef.current = null;
      setConnectionState("idle");
      return;
    }

    void refreshAll();
  }, [clearReconnectTimer, enabled, refreshAll, user]);

  useEffect(() => {
    if (!enabled || !user || !selectedContactId) {
      manualCloseRef.current = true;
      clearReconnectTimer();
      socketRef.current?.close();
      socketRef.current = null;
      setConnectionState(enabled ? "idle" : "idle");
      return;
    }

    openSocket();

    return () => {
      manualCloseRef.current = true;
      clearReconnectTimer();
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [
    clearReconnectTimer,
    enabled,
    openSocket,
    selectedContactId,
    selectedConversationId,
    user,
  ]);

  useEffect(() => {
    if (!enabled || !user || !selectedConversationId) {
      setMessages([]);
      return;
    }

    void loadMessages(selectedConversationId).catch(() => {
      toast.error("Không tải được tin nhắn");
    });
  }, [enabled, loadMessages, selectedConversationId, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedConversationId]);

  const handleSelectConversation = useCallback(
    (conversation: ExternalConversation) => {
      setTab("conversations");
      setSelectedConversationId(conversation.conversationId);
      setSelectedContactId(conversation.participantId);
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
    },
    [conversations],
  );

  const handleSend = useCallback(async () => {
    if (!selectedContactId || !draft.trim()) return;
    if (!socketRef.current?.isOpen()) {
      toast.error("Kết nối chat chưa sẵn sàng");
      return;
    }

    setSending(true);
    try {
      socketRef.current.send({
        conversationId: selectedConversationId,
        receiverId: selectedContactId,
        content: draft.trim(),
      });
      setDraft("");
    } catch (error) {
      toast.error(
        formatChatError(error, "Không gửi được tin nhắn"),
      );
    } finally {
      setSending(false);
    }
  }, [draft, selectedContactId, selectedConversationId]);

  return {
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
    loading,
    sending,
    connectionState,
    isConnected: connectionState === "connected",
    bottomRef,
    handleSelectConversation,
    handleSelectContact,
    handleSend,
    refreshAll,
    loadConversations,
    loadContacts,
    loadMessages,
  };
};
