import type { ExternalMessage } from "@/types/externalChat";

export type ExternalChatSocketCallbacks = {
  onMessage: (message: ExternalMessage) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (event: Event) => void;
};

const buildSocketUrl = (conversationId?: number | null) => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    return null;
  }

  const baseUrl = "http://localhost:8080/api";
  const wsBase = baseUrl.replace(/^http/, "ws").replace(/\/api$/, "/ws/chat");
  const url = new URL(wsBase);
  url.searchParams.set("token", token);
  if (conversationId != null) {
    url.searchParams.set("conversationId", String(conversationId));
  }

  return url.toString();
};

export class ExternalChatSocket {
  private socket: WebSocket | null = null;
  private readonly callbacks: ExternalChatSocketCallbacks;

  constructor(conversationId: number | null, callbacks: ExternalChatSocketCallbacks) {
    this.callbacks = callbacks;
    const url = buildSocketUrl(conversationId);
    if (!url) {
      return;
    }

    this.socket = new WebSocket(url);
    this.socket.onopen = () => this.callbacks.onOpen?.();
    this.socket.onclose = () => this.callbacks.onClose?.();
    this.socket.onerror = (event) => this.callbacks.onError?.(event);
    this.socket.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data as string) as ExternalMessage;
        this.callbacks.onMessage(parsed);
      } catch {
        this.callbacks.onError?.(new Event("message-parse-error"));
      }
    };
  }

  isOpen() {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  send(payload: unknown) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket is not connected");
    }

    this.socket.send(JSON.stringify(payload));
  }

  close() {
    this.socket?.close();
    this.socket = null;
  }
}

export const createExternalChatSocket = (
  conversationId: number | null,
  callbacks: ExternalChatSocketCallbacks,
) => new ExternalChatSocket(conversationId, callbacks);
