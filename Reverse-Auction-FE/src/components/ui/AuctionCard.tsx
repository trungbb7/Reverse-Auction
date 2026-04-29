import React from "react";
import { Clock, Users, ArrowRight, Gavel } from "lucide-react";

interface AuctionCardProps {
  title: string;
  buyerName: string;
  timeRemaining: string;
  lowestBid: string;
  participants: number;
  tags?: string[];
  isUrgent?: boolean;
}

export const AuctionCard: React.FC<AuctionCardProps> = ({
  title,
  buyerName,
  timeRemaining,
  lowestBid,
  participants,
  tags = [],
  isUrgent = false
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 relative group cursor-pointer flex flex-col h-full">
      {isUrgent && (
        <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
      )}
      
      <div className="p-5 flex-grow">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-medium text-sm">
              {buyerName.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-slate-600">{buyerName}</span>
          </div>
          
          <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${isUrgent ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
            <Clock size={14} className={isUrgent ? 'animate-pulse' : ''} />
            <span>{timeRemaining}</span>
          </div>
        </div>

        <h3 className="font-semibold text-slate-800 text-lg mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {title}
        </h3>

        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag, idx) => (
            <span key={idx} className="px-2 py-1 bg-slate-50 text-slate-500 text-xs rounded-md border border-slate-100">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between mt-auto group-hover:bg-primary-50/50 transition-colors">
        <div>
          <p className="text-xs text-slate-500 mb-0.5">Giá thấp nhất hiện tại</p>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-lg text-primary-700">{lowestBid}</span>
            {lowestBid !== "Chưa có" && (
              <span className="flex items-center text-xs text-green-600 bg-green-100 px-1.5 py-0.5 rounded">
                <Gavel size={12} className="mr-1"/> Đang dẫn
              </span>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <div className="flex items-center space-x-1.5 text-slate-500 mb-1.5">
            <Users size={14} />
            <span className="text-xs font-medium">{participants} người bán</span>
          </div>
          <button className="text-primary-600 font-medium text-sm flex items-center group-hover:translate-x-1 transition-transform">
            Tham gia <ArrowRight size={16} className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};
