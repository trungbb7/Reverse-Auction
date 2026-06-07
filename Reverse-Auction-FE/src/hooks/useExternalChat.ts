import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { externalChatService } from "@/services/externalChatService";
import { createExternalChatSocket } from "@/services/externalChatSocket";
import type {
  ChatUser,
  ExternalConversation,
  ExternalMessage,
} from "@/types/externalChat";
import toast from "react-hot-toast";
import { selectContact, toggleChat } from "@/components/chat/chatSlice";

export type ChatTab = "conversations" | "contacts";
type ConnectionState = "idle" | "connecting" | "connected" | "reconnecting";

type UseExternalChatOptions = {
  enabled: boolean;
};

const formatChatError = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export const useExternalChat = ({ enabled }: UseExternalChatOptions) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const {
    isOpen,
    selectedContactId: reduxContactId,
    isComplaintMode,
  } = useAppSelector((state) => state.chat);

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

  // Sync redux state to local state
  useEffect(() => {
    if (reduxContactId !== null) {
      setSelectedContactId(reduxContactId);
      const existingConversation = conversations.find(
        (c) => c.participantId === reduxContactId,
      );
      setSelectedConversationId(existingConversation?.conversationId ?? null);
      if (existingConversation) {
        setTab("conversations");
      } else {
        setTab("contacts");
      }
    }
  }, [reduxContactId, conversations]);

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

    setSelectedConversationId((currentConversationId) => {
      // If we already have a conversation selected, or there are no conversations, stay as is
      if (currentConversationId || data.length === 0) {
        return currentConversationId;
      }

      // If we have a contact selected that doesn't have a conversation yet,
      // don't auto-switch to the first conversation in the list
      if (selectedContactIdRef.current && !currentConversationId) {
        return currentConversationId;
      }

      setSelectedContactId(data[0].participantId);
      return data[0].conversationId;
    });

    if (!selectedConversationIdRef.current && data.length > 0 && !selectedContactIdRef.current) {
      setSelectedContactId(data[0].participantId);
    }
  }, []);

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

  const selectedConversationIdRef = useRef(selectedConversationId);
  const selectedContactIdRef = useRef(selectedContactId);
  const loadConversationsRef = useRef(loadConversations);

  useEffect(() => {
    selectedConversationIdRef.current = selectedConversationId;
  }, [selectedConversationId]);

  useEffect(() => {
    selectedContactIdRef.current = selectedContactId;
  }, [selectedContactId]);

  useEffect(() => {
    loadConversationsRef.current = loadConversations;
  }, [loadConversations]);

  const openSocket = useCallback(() => {
    if (!enabled || !user) {
      return;
    }

    clearReconnectTimer();
    manualCloseRef.current = false;
    socketRef.current?.close();
    socketRef.current = null;

    setConnectionState(
      reconnectAttemptsRef.current > 0 ? "reconnecting" : "connecting",
    );

    const socket = createExternalChatSocket(null, {
      onOpen: () => {
        reconnectAttemptsRef.current = 0;
        setConnectionState("connected");
      },
      onMessage: (message) => {
        const currentConvId = selectedConversationIdRef.current;
        const currentContactId = selectedContactIdRef.current;

        const isCurrentConversation =
          (currentConvId && message.conversationId === currentConvId) ||
          (!currentConvId && currentContactId &&
            (message.senderId === currentContactId || message.receiverId === currentContactId));

        if (isCurrentConversation) {
          appendMessage(message);

          if (!currentConvId) {
            setSelectedConversationId(message.conversationId);
          }
        }

        void loadConversationsRef.current().catch(() => undefined);
      },
      onClose: () => {
        socketRef.current = null;

        if (!enabled || manualCloseRef.current) {
          setConnectionState("idle");
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
        if (!enabled || manualCloseRef.current) {
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
    if (!enabled || !user) {
      manualCloseRef.current = true;
      clearReconnectTimer();
      socketRef.current?.close();
      socketRef.current = null;
      setConnectionState("idle");
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
      dispatch(
        selectContact({
          contactId: conversation.participantId,
          isComplaintMode: conversation.complaintChat,
        }),
      );
    },
    [dispatch],
  );

  const handleSelectContact = useCallback(
    (contact: ChatUser) => {
      const existingConversation = conversations.find(
        (conversation) => conversation.participantId === contact.id,
      );

      setTab("contacts");
      setSelectedContactId(contact.id);
      setSelectedConversationId(existingConversation?.conversationId ?? null);
      dispatch(
        selectContact({
          contactId: contact.id,
          isComplaintMode: existingConversation?.complaintChat,
        }),
      );
    },
    [conversations, dispatch],
  );

  const handleSend = useCallback(async () => {
    if (!selectedContactId || !draft.trim()) return;

    const actualComplaintMode = isComplaintMode;

    // Use REST API for first message to create conversation
    if (!selectedConversationId) {
      setSending(true);
      try {
        const newMessage = await externalChatService.sendMessage({
          receiverId: selectedContactId,
          content: draft.trim(),
          complaintChat: actualComplaintMode,
        });
        setDraft("");
        setSelectedConversationId(newMessage.conversationId);
        appendMessage(newMessage);
        void loadConversations().catch(() => undefined);
      } catch (error) {
        toast.error(formatChatError(error, "Không gửi được tin nhắn"));
      } finally {
        setSending(false);
      }
      return;
    }

    if (!socketRef.current?.isOpen()) {
      toast.error("Kết nối chat chưa sẵn sàng");
      return;
    }

    setSending(true);
    try {
      socketRef.current.send({
        receiverId: selectedContactId,
        content: draft.trim(),
        complaintChat: actualComplaintMode,
      });
      setDraft("");
    } catch (error) {
      toast.error(
        formatChatError(error, "Không gửi được tin nhắn"),
      );
    } finally {
      setSending(false);
    }
  }, [appendMessage, draft, isComplaintMode, loadConversations, selectedContactId, selectedConversationId]);

  const handleToggleOpen = useCallback(() => {
    dispatch(toggleChat());
  }, [dispatch]);

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
    isOpen,
    isComplaintMode,
    bottomRef,
    handleSelectConversation,
    handleSelectContact,
    handleSend,
    handleToggleOpen,
    refreshAll,
    loadConversations,
    loadContacts,
    loadMessages,
  };
};

