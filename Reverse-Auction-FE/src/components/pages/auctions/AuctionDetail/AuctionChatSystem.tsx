import { useEffect, useRef, useState } from "react";
import { Send, MessageSquare, Search, Image as ImageIcon, ChevronDown, ChevronUp } from "lucide-react";
import { type AuctionMessage, auctionMessageService } from "@/services/auctionMessageService";
import { useAppSelector } from "@/hooks/redux";
import { Client } from "@stomp/stompjs";
import { formatTimeAgo } from "@/utils/time";
import toast from "react-hot-toast";
import { cloudinaryService } from "@/services/cloudinaryService";

interface Participant {
  id: number;
  name: string;
  lastMessage?: string;
  lastTime?: string;
  unread?: boolean;
}

interface AuctionChatSystemProps {
  auctionId: number;
  participants: Participant[]; // For buyer: list of bidders. For seller: list containing only buyer.
  stompClient: Client | null;
  currentUserRole: "BUYER" | "SELLER";
  initialParticipantId?: number | null;
}

export default function AuctionChatSystem({
  auctionId,
  participants,
  stompClient,
  initialParticipantId,
}: AuctionChatSystemProps) {
  const [activeParticipant, setActiveParticipant] = useState<Participant | null>(null);
  const [messages, setMessages] = useState<AuctionMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadMap, setUnreadMap] = useState<Record<number, boolean>>({});
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const currentUser = useAppSelector((state) => state.auth.user);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3");
  }, []);

  useEffect(() => {
    if (initialParticipantId) {
      const p = participants.find(p => p.id === initialParticipantId);
      if (p) setActiveParticipant(p);
    } else if (!activeParticipant && participants.length > 0) {
      setActiveParticipant(participants[0]);
    }
  }, [initialParticipantId, participants]);

  useEffect(() => {
    if (activeParticipant) {
      async function fetchHistory() {
        try {
          const history = await auctionMessageService.getConversation(auctionId, activeParticipant!.id);
          setMessages(history);
          setUnreadMap(prev => ({ ...prev, [activeParticipant!.id]: false }));
        } catch (err) {
          console.error("Failed to fetch chat history", err);
        }
      }
      fetchHistory();
    }
  }, [auctionId, activeParticipant]);

  useEffect(() => {
    if (!stompClient || !currentUser) return;

    const subscription = stompClient.subscribe(
      `/topic/auction/${auctionId}/chat/${currentUser.id}`,
      (message) => {
        const newMessage = JSON.parse(message.body) as AuctionMessage;
        
        if (activeParticipant && (newMessage.senderId === activeParticipant.id || newMessage.receiverId === activeParticipant.id)) {
          setMessages((prev) => {
            if (prev.some((m) => m.msgId === newMessage.msgId)) return prev;
            return [...prev, newMessage];
          });
        } else {
          const otherId = newMessage.senderId === currentUser.id ? newMessage.receiverId : newMessage.senderId;
          setUnreadMap(prev => ({ ...prev, [otherId]: true }));
          
          if (newMessage.senderId !== currentUser.id) {
            toast.success(`Tin nhắn mới từ ${newMessage.senderName}`, {
              icon: "💬",
              position: "bottom-left"
            });
            audioRef.current?.play().catch(() => {});
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [auctionId, stompClient, currentUser, activeParticipant]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isCollapsed]);

  const handleSendMessage = (content: string, type: string = "text", url?: string) => {
    if ((!content.trim() && !url) || !stompClient || !currentUser || !activeParticipant) return;

    const payload = {
      auctionId,
      receiverId: activeParticipant.id,
      content: content.trim(),
      type,
      url,
    };

    stompClient.publish({
      destination: `/app/auction/${auctionId}/chat`,
      body: JSON.stringify(payload),
    });

    setInputValue("");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await cloudinaryService.uploadSingleMedia(file);
      handleSendMessage("", result.type, result.url);
      toast.success("Đã gửi tệp đính kèm");
    } catch (err) {
      toast.error("Không thể tải tệp lên");
      console.error(err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const filteredParticipants = participants.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = Object.values(unreadMap).filter(v => v).length;

  return (
    <div className={`bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden flex transition-all duration-300 ${isCollapsed ? 'h-20' : 'h-[600px]'}`}>
      {/* Sidebar - Participant List */}
      {!isCollapsed && (
        <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50/50">
          <div className="p-5 border-b border-slate-100 bg-white">
            <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#375F97]" />
              Thảo luận
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#375F97] transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredParticipants.map((p) => (
              <button
                key={p.id}
                onClick={() => setActiveParticipant(p)}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${
                  activeParticipant?.id === p.id
                    ? "bg-white shadow-md ring-1 ring-slate-200"
                    : "hover:bg-white/50"
                }`}
              >
                <div className="relative">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm ${
                    activeParticipant?.id === p.id ? "bg-[#375F97] text-white" : "bg-slate-200 text-slate-500"
                  }`}>
                    {p.name.charAt(0)}
                  </div>
                  {unreadMap[p.id] && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className={`text-sm font-bold truncate ${activeParticipant?.id === p.id ? "text-slate-900" : "text-slate-600"}`}>
                    {p.name}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {unreadMap[p.id] ? "Tin nhắn mới..." : "Nhấn để trò chuyện"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Header (Always visible) */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white h-20">
          <div className="flex items-center gap-3">
            {activeParticipant ? (
              <>
                <div className="w-10 h-10 rounded-full bg-[#375F97] text-white flex items-center justify-center font-bold">
                  {activeParticipant.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-base">{activeParticipant.name}</h4>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Trực tuyến</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3 text-slate-400">
                <MessageSquare className="w-8 h-8" />
                <span className="font-bold">Trung tâm Thảo luận</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {totalUnread > 0 && isCollapsed && (
              <span className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-full animate-bounce">
                {totalUnread} TIN MỚI
              </span>
            )}
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors"
            >
              {isCollapsed ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {!isCollapsed && activeParticipant && (
          <>
            {/* Message List */}
            <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/30">
              {messages.map((msg) => {
                const isMe = msg.senderId === currentUser?.id;
                return (
                  <div key={msg.msgId} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                          isMe 
                            ? "bg-[#375F97] text-white rounded-tr-none" 
                            : "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
                        }`}
                      >
                        {msg.type === "image" && (
                          <div className="mb-2 rounded-lg overflow-hidden border border-white/20">
                            <img src={msg.url} alt="Sent" className="max-w-full h-auto cursor-pointer" onClick={() => window.open(msg.url)} />
                          </div>
                        )}
                        {msg.type === "video" && (
                          <div className="mb-2 rounded-lg overflow-hidden border border-white/20">
                            <video src={msg.url} controls className="max-w-full h-auto" />
                          </div>
                        )}
                        {msg.content && <p className="leading-relaxed break-words">{msg.content}</p>}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium px-1">
                        {formatTimeAgo(msg.time)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Area */}
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputValue); }} 
              className="p-5 bg-white border-t border-slate-100 flex items-center gap-3"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*,video/*" 
                onChange={handleFileChange}
              />
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="w-11 h-11 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center hover:bg-slate-200 transition-all disabled:opacity-50"
              >
                {isUploading ? <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" /> : <ImageIcon className="w-5 h-5" />}
              </button>
              
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Nhập nội dung..."
                className="flex-1 bg-slate-100 border-none rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-[#375F97] transition-all"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isUploading}
                className="px-6 h-11 bg-[#375F97] text-white rounded-2xl flex items-center justify-center gap-2 font-bold text-sm disabled:opacity-50 hover:bg-[#2d4f80] transition-all shadow-md active:scale-95"
              >
                <Send className="w-4 h-4" />
                Gửi
              </button>
            </form>
          </>
        )}

        {!isCollapsed && !activeParticipant && (
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/20">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <MessageSquare className="w-10 h-10 text-slate-300" />
            </div>
            <h4 className="text-slate-900 font-black text-lg">Trung tâm Thảo luận</h4>
            <p className="text-slate-400 text-sm mt-1">Chọn một người tham gia để bắt đầu</p>
          </div>
        )}
      </div>
    </div>
  );
}
