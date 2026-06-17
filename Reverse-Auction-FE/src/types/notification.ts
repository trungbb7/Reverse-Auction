export interface Notification {
  id: number;
  userId: number;
  title: string;
  content: string;
  isRead: boolean;
  type: string; // e.g. NEW_BID, BID_UPDATED, AUCTION_WON, AUCTION_CLOSED, ORDER_STATUS_CHANGED
  relatedId?: number;
  createdAt: string;
}
