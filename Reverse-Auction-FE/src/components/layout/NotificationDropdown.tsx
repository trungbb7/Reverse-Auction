import React from "react";
import { useNavigate } from "react-router";
import { useNotifications } from "@/context/NotificationContext";
import { formatTimeAgo } from "@/utils/time";
import { useAppSelector } from "@/hooks/redux";
import {
  Bell,
  Gavel,
  Award,
  Clock,
  Package,
  Check,
  Inbox,
} from "lucide-react";

interface NotificationDropdownProps {
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
  const { notifications, markAsRead, markAllAsRead, loading } = useNotifications();
  const user = useAppSelector((state) => state.auth.user);
  const navigate = useNavigate();

  const handleNotificationClick = async (notif: any) => {
    // 1. Mark as read
    if (!notif.isRead) {
      await markAsRead(notif.id);
    }

    // 2. Navigate based on type
    if (notif.relatedId) {
      switch (notif.type) {
        case "NEW_BID":
        case "BID_UPDATED":
        case "AUCTION_CLOSED":
          navigate(`/auctions/${notif.relatedId}`);
          break;
        case "AUCTION_WON":
          navigate(`/seller/auctions/${notif.relatedId}`);
          break;
        case "ORDER_STATUS_CHANGED":
          if (user?.role === "ROLE_BUYER") {
            navigate(`/buyer/orders/${notif.relatedId}`);
          } else if (user?.role === "ROLE_SELLER") {
            navigate(`/seller/orders-detail/${notif.relatedId}`);
          } else {
            navigate("/profile");
          }
          break;
        default:
          navigate("/");
          break;
      }
    }
    onClose();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "NEW_BID":
      case "BID_UPDATED":
        return (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Gavel className="h-4 w-4" />
          </div>
        );
      case "AUCTION_WON":
        return (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Award className="h-4 w-4" />
          </div>
        );
      case "AUCTION_CLOSED":
        return (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <Clock className="h-4 w-4" />
          </div>
        );
      case "ORDER_STATUS_CHANGED":
        return (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <Package className="h-4 w-4" />
          </div>
        );
      default:
        return (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
            <Bell className="h-4 w-4" />
          </div>
        );
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white shadow-xl py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-1.5">
          <Bell className="h-4 w-4 text-slate-700" />
          <h3 className="text-sm font-black text-slate-800">Thông báo</h3>
        </div>
        {notifications.length > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-800 transition-colors"
          >
            <Check className="h-3 w-3" /> Đọc tất cả
          </button>
        )}
      </div>

      {/* Notifications list */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 scrollbar-thin">
        {loading && notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-400">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
            <span className="text-xs font-medium mt-2">Đang tải thông báo...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center text-slate-400">
            <Inbox className="h-10 w-10 text-slate-300 stroke-[1.5]" />
            <p className="text-sm font-semibold text-slate-700 mt-2">Hộp thư trống</p>
            <p className="text-xs mt-1">Bạn không có thông báo nào vào lúc này.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <button
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`w-full flex gap-3 text-left px-4 py-3 hover:bg-slate-50 transition-colors relative ${
                !notif.isRead ? "bg-blue-50/20" : ""
              }`}
            >
              {/* Type Icon */}
              {getIcon(notif.type)}

              {/* Text content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-1.5">
                  <p className={`text-xs text-slate-800 leading-normal ${!notif.isRead ? "font-extrabold" : "font-medium"}`}>
                    {notif.title}
                  </p>
                  {/* Unread indicator dot */}
                  {!notif.isRead && (
                    <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0 mt-1" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                  {notif.content}
                </p>
                <p className="text-[9px] text-slate-400 font-bold mt-1">
                  {formatTimeAgo(notif.createdAt)}
                </p>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Footer (view history or simple pad) */}
      <div className="px-4 py-2 border-t border-slate-100 text-center bg-slate-50/50 rounded-b-2xl">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Hệ thống thông báo Realtime
        </span>
      </div>
    </div>
  );
};
