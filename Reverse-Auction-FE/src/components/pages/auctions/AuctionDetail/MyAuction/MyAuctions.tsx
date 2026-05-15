import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Plus, Search } from "lucide-react";
import type { Auction } from "@/types/auction";
import UserAuctionCard from "@/components/ui/UserAuctionCard";
import api from "@/utils/axios";
import ProposalComponent from "./ProposalComponent";

const MyAuctions = () => {
  const [filter, setFilter] = useState("ALL");
  const [userAunctions, setUserAunctions] = useState<Auction[]>([]);
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    async function fetchUserAunctions() {
      const { data } = await api.get("/auctions/my-auctions");
      const aunctions = data.content as Auction[];
      setUserAunctions(aunctions);
    }
    fetchUserAunctions();
  }, []);

  const filtered = userAunctions
    .filter((a) => (filter === "ALL" ? true : filter === a.status))
    .filter((a) =>
      `${a.title} + ${a.description}`
        .toLowerCase()
        .includes(search.toLowerCase()),
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
              onClick={() => setFilter("OPEN")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filter === "OPEN" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
            >
              Đang diễn ra
            </button>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((auction) => (
          <UserAuctionCard key={auction.id} auction={auction} />
        ))}
      </div>

      <ProposalComponent />

      {/* Floating Action Button (FAB) */}
      <Link
        to="/create-auction"
        className="fixed bottom-20 right-4 size-14 bg-linear-to-br from-slate-950 to-slate-700 text-white rounded-full shadow-[0_8px_30px_rgb(59,130,246,0.3)] hover:shadow-[0_8px_40px_rgb(59,130,246,0.4)] flex items-center justify-center hover:-translate-y-1 transition-all group z-40"
      >
        <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
      </Link>
    </div>
  );
};

export default MyAuctions;
