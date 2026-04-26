import { useState } from "react";
import { Link } from "react-router";
import { Plus, Search } from "lucide-react";
import type { Auction } from "@/types/auction";
import UserAuctionCard from "@/components/ui/UserAuctionCard";

// Mock Data
const MOCK_AUCTIONS: Auction[] = [
  {
    id: "1",
    title: "Cần mua RTX 3060 12GB hoặc RX 6600XT",
    category: "VGA",
    budgetMax: 6000000,
    endDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    description: "Cần hàng 2nd, còn bảo hành ít nhất 3 tháng.",
    status: "OPEN",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    lowestBid: 5500000,
    totalBids: 4,
    quantity: 1,
  },
  {
    id: "2",
    title: "Tìm kit RAM 32GB (2x16GB) DDR4 3200MHz",
    category: "RAM",
    budgetMax: 1500000,
    endDate: new Date(Date.now() + 3600000 * 5).toISOString(),
    description: "Cần kit RAM Corsair Vengeance hoặc Kingston Fury.",
    status: "OPEN",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    lowestBid: 1400000,
    totalBids: 8,
    quantity: 2,
  },
  {
    id: "3",
    title: "Build nguyên bộ PC học tập + chơi LMHT",
    category: "PC Build",
    budgetMax: 10000000,
    endDate: new Date(Date.now() - 86400000).toISOString(),
    description: "Cần build 1 bộ PC đủ màn hình để học online.",
    status: "OPEN",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    lowestBid: 9500000,
    totalBids: 12,
    quantity: 1,
  },
];

const MyAuctions = () => {
  const [filter, setFilter] = useState("ALL");

  const filteredAuctions = MOCK_AUCTIONS.filter((auction) =>
    filter === "ALL" ? true : auction.status === filter,
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 relative min-h-[80vh]">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Đấu giá của tôi</h1>
          <p className="text-slate-500 mt-1">
            Quản lý và theo dõi các yêu cầu mua linh kiện của bạn.
          </p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Filter Tabs */}
          <div className="bg-slate-100 p-1.5 rounded-xl flex items-center shrink-0">
            <button
              onClick={() => setFilter("ALL")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filter === "ALL" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilter("ACTIVE")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filter === "ACTIVE" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
            >
              Đang diễn ra
            </button>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAuctions.map((auction) => (
          <UserAuctionCard key={auction.id} auction={auction} />
        ))}
      </div>

      <div className="flex flex-row gap-6 mt-8">
        <div className="flex w-2/3 p-6 items-start gap-8 rounded-2xl border border-[rgba(195,198,209,0.15)] bg-[#FFF]">
          <div className="flex flex-col justify-center items-start rounded-2xl w-60 h-full overflow-hidden relative">
            <img
              src="https://www.oneas1a.com/wp-content/uploads/2024/10/Components-server.jpg"
              className="w-full h-full overflow-hidden max-w-none"
              alt="High-end server rack in a clean datacenter"
            />
            <div className="flex p-4 items-end absolute bg-linear-[0deg,rgba(0,0,0,0.60)0%,rgba(0,0,0,0.00)100%] w-60 h-[267px]">
              <div className="flex py-1 px-3 items-center gap-2 rounded-full bg-[#10B981] w-fit">
                <div className="rounded-full bg-[#FFF] w-1.5 h-1.5"></div>
                <p className="flex flex-col justify-center text-[#FFF] font-inter text-[10px] font-bold leading-[15px]">
                  ACTIVE AUCTION
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-between items-start w-[480px] h-full">
            <div className="flex pb-2 flex-col items-start w-full">
              <div className="flex pr-[0] justify-between items-start w-full">
                <p className="flex flex-col justify-center text-[#181C20] font-manrope text-2xl font-bold leading-8 ">
                  Custom AI Deep Learning Station
                </p>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 "
                >
                  <path
                    d="M9 15H11V9H9V15ZM10 7C10.2833 7 10.5208 6.90417 10.7125 6.7125C10.9042 6.52083 11 6.28333 11 6C11 5.71667 10.9042 5.47917 10.7125 5.2875C10.5208 5.09583 10.2833 5 10 5C9.71667 5 9.47917 5.09583 9.2875 5.2875C9.09583 5.47917 9 5.71667 9 6C9 6.28333 9.09583 6.52083 9.2875 6.7125C9.47917 6.90417 9.71667 7 10 7ZM10 20C8.61667 20 7.31667 19.7375 6.1 19.2125C4.88333 18.6875 3.825 17.975 2.925 17.075C2.025 16.175 1.3125 15.1167 0.7875 13.9C0.2625 12.6833 0 11.3833 0 10C0 8.61667 0.2625 7.31667 0.7875 6.1C1.3125 4.88333 2.025 3.825 2.925 2.925C3.825 2.025 4.88333 1.3125 6.1 0.7875C7.31667 0.2625 8.61667 0 10 0C11.3833 0 12.6833 0.2625 13.9 0.7875C15.1167 1.3125 16.175 2.025 17.075 2.925C17.975 3.825 18.6875 4.88333 19.2125 6.1C19.7375 7.31667 20 8.61667 20 10C20 11.3833 19.7375 12.6833 19.2125 13.9C18.6875 15.1167 17.975 16.175 17.075 17.075C16.175 17.975 15.1167 18.6875 13.9 19.2125C12.6833 19.7375 11.3833 20 10 20ZM10 18C12.2333 18 14.125 17.225 15.675 15.675C17.225 14.125 18 12.2333 18 10C18 7.76667 17.225 5.875 15.675 4.325C14.125 2.775 12.2333 2 10 2C7.76667 2 5.875 2.775 4.325 4.325C2.775 5.875 2 7.76667 2 10C2 12.2333 2.775 14.125 4.325 15.675C5.875 17.225 7.76667 18 10 18Z"
                    fill="#375F97"
                  />
                </svg>
              </div>
            </div>
            <div className="flex pb-6 flex-col items-start w-full">
              <div className="flex flex-col items-start w-full">
                <p className="text-[#434750] font-inter text-sm leading-5 w-full">
                  4x A100 GPU Support, 512GB RAM, Dual EPYC. Cần cung cấp gấp
                  cho dự án nghiên cứu.
                </p>
              </div>
            </div>
            <div className="flex pb-8 flex-col items-start w-full">
              <div className="flex justify-center items-start gap-4 w-full">
                <div className="flex min-w-[140px] p-4 flex-col items-start gap-1 rounded-2xl bg-[#F1F4FA] w-full h-full">
                  <div className="flex flex-col items-start w-full">
                    <p className="text-[#434750] font-inter text-[10px] font-semibold leading-[15px] w-full tracking-[0.05em]">
                      Lượt đấu thầu
                    </p>
                  </div>
                  <div className="flex flex-col items-start w-full">
                    <p className="text-[#181C20] font-inter text-2xl font-semibold leading-8 w-full">
                      08
                    </p>
                  </div>
                </div>
                <div className="flex min-w-[140px] p-4 flex-col items-start gap-1 rounded-2xl bg-[#D5E3FF] w-full h-full">
                  <div className="flex flex-col items-start w-full">
                    <p className="text-[#1B477E] font-inter text-[10px] font-semibold leading-[15px] w-full tracking-[0.05em]">
                      Thấp nhất hiện tại
                    </p>
                  </div>
                  <div className="flex flex-col items-start w-full">
                    <p className="text-[#001B3C] font-inter text-2xl font-semibold leading-8 w-full">
                      840M
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex pr-[0] justify-between items-center w-full">
              <div className="flex items-start -space-x-3 w-fit">
                <button className="cursor-pointer text-nowrap flex pt-1.5 pr-0 pb-[7px] pl-0 justify-center items-center rounded-full border-2 border-[#FFF] bg-[#DBEAFE] w-8 h-8">
                  <p className="flex flex-col justify-center shrink-0 text-[#181C20] font-inter text-[10px] font-bold leading-[15px] w-[7px] h-[15px] text-center">
                    H
                  </p>
                </button>
                <div className="flex flex-col items-start w-8 h-8">
                  <button className="cursor-pointer text-nowrap flex pt-1.5 pr-0 pb-[7px] pl-0 justify-center items-center shrink-0 rounded-full border-2 border-[#FFF] bg-[#DCFCE7] w-8 h-8">
                    <p className="flex flex-col justify-center shrink-0 text-[#181C20] font-inter text-[10px] font-bold leading-[15px] w-[7px] h-[15px] text-center">
                      S
                    </p>
                  </button>
                </div>
                <div className="flex flex-col items-start w-8 h-8">
                  <button className="cursor-pointer text-nowrap flex pt-1.5 pr-0 pb-[7px] pl-0 justify-center items-center shrink-0 rounded-full border-2 border-[#FFF] bg-[#F3E8FF] w-8 h-8">
                    <p className="flex flex-col justify-center shrink-0 text-[#181C20] font-inter text-[10px] font-bold leading-[15px] w-[7px] h-[15px] text-center">
                      V
                    </p>
                  </button>
                </div>
                <div className="flex flex-col items-start w-8 h-8">
                  <button className="cursor-pointer text-nowrap flex pt-1.5 pr-0 pb-[7px] pl-0 justify-center items-center shrink-0 rounded-full border-2 border-[#FFF] bg-[#E2E8F0] w-8 h-8">
                    <p className="flex flex-col justify-center shrink-0 text-[#181C20] font-inter text-[10px] font-bold leading-[15px] w-[13px] h-[15px] text-center">
                      +5
                    </p>
                  </button>
                </div>
              </div>
              <button className="cursor-pointer text-nowrap flex py-3 px-8 flex-col justify-center items-center rounded-2xl bg-[#375F97] w-fit">
                <p className="flex flex-col justify-center text-[#FFF] font-inter text-base font-bold leading-6 w-[91px] h-6 text-center">
                  Xem chi tiết
                </p>
              </button>
            </div>
          </div>
        </div>

        <div className="flex w-1/3 p-8 flex-col justify-between items-start rounded-2xl bg-linear-[135deg,#375F97_0%,#7096D2_100%]">
          <div className="flex pb-6 flex-col items-start gap-4 w-full">
            <div className="flex flex-col items-start w-full">
              <p className="text-[#FFF] font-manrope text-xl font-bold leading-7 w-full">
                Tối ưu hóa nguồn cung
              </p>
            </div>
            <div className="flex flex-col items-start w-full">
              <p className="text-[rgba(255,255,255,0.80)] font-inter text-base leading-[26px] w-full">
                Dựa trên dữ liệu thị trường, dòng card RTX 50 series sắp ra mắt.
                Bạn có muốn điều chỉnh giá thầu cho kho hàng cũ?
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full">
            <p className="flex flex-col justify-center text-[#FFF] font-inter text-base font-semibold leading-6 w-[179px] h-6">
              Phân tích thị trường
            </p>
            <svg
              width="20"
              height="12"
              viewBox="0 0 20 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="flex flex-col items-start w-fit "
            >
              <path
                d="M1.4 12L0 10.6L7.4 3.15L11.4 7.15L16.6 2H14V0H20V6H18V3.4L11.4 10L7.4 6L1.4 12Z"
                fill="white"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Floating Action Button (FAB) */}
      <Link
        to="/create-auction"
        className="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-[0_8px_30px_rgb(59,130,246,0.3)] hover:shadow-[0_8px_40px_rgb(59,130,246,0.4)] flex items-center justify-center hover:-translate-y-1 transition-all group z-40"
      >
        <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
      </Link>
    </div>
  );
};

export default MyAuctions;
