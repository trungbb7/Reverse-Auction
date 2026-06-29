export type AiActionType =
  | "VIEW_PRODUCT"
  | "VIEW_ORDER"
  | "VIEW_AUCTION"
  | "OPEN_CHAT_WITH_SELLER"
  | "CREATE_COMPLAINT_DRAFT"
  | "START_AUCTION_DRAFT"
  | "SUGGEST_BID_DRAFT";

export interface AiAction {
  type: AiActionType;
  label: string;
  payload?: Record<string, unknown>;
}

export interface AiChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface AiChatRequest {
  message: string;
  history: AiChatTurn[];
}

export interface AiChatResponse {
  message: string;
  suggestedActions: AiAction[];
  provider: string;
}

export interface AiChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  actions?: AiAction[];
  provider?: string;
}
