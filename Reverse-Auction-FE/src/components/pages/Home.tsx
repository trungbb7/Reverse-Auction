import { ArrowRight, Cpu, HardDrive, Monitor, Mouse, Search, Zap, ShieldAlert, Cpu as GpuIcon, Box } from "lucide-react";
import { CategoryCard } from "../ui/CategoryCard";
import { ProductCard } from "../ui/ProductCard";
import { AuctionCard } from "../ui/AuctionCard";

export default function Home() {
  const categories = [
    { title: "CPU", icon: Cpu, desc: "Vi xử lý" },
    { title: "VGA", icon: GpuIcon, desc: "Card đồ họa" },
    { title: "Mainboard", icon: Box, desc: "Bo mạch chủ" },
    { title: "RAM", icon: Zap, desc: "Bộ nhớ trong" },
    { title: "Ổ cứng", icon: HardDrive, desc: "SSD / HDD" },
    { title: "Màn hình", icon: Monitor, desc: "LCD / OLED" },
    { title: "Phụ kiện", icon: Mouse, desc: "Chuột, Bàn phím" },
    { title: "Khác", icon: ShieldAlert, desc: "Tản nhiệt, Case..." },
  ];

  const trendingProducts = [
    { name: "CPU Intel Core i9-14900K", price: "14.500.000đ", rating: 4.9, sold: 128 },
    { name: "VGA NVIDIA RTX 4070 Ti Super", price: "22.300.000đ", rating: 4.8, sold: 85 },
    { name: "RAM Corsair Vengeance RGB 32GB DDR5", price: "3.200.000đ", rating: 5.0, sold: 342 },
    { name: "SSD Samsung 990 Pro 2TB", price: "4.100.000đ", rating: 4.9, sold: 215 },
  ];

  const recentAuctions = [
    { 
      title: "Cần tìm RTX 4090 cũ còn bảo hành dài", 
      buyerName: "Tuấn Anh", 
      timeRemaining: "02:15:30", 
      lowestBid: "35.500.000đ", 
      participants: 8, 
      tags: ["VGA", "Cũ", "Gấp"],
      isUrgent: true 
    },
    { 
      title: "Build PC Gaming ngân sách 20 triệu", 
      buyerName: "Minh Quân", 
      timeRemaining: "14:45:00", 
      lowestBid: "19.200.000đ", 
      participants: 3, 
      tags: ["PC Assembled", "Gaming"],
      isUrgent: false 
    },
    { 
      title: "Tìm mua sỉ 20 màn hình Dell Ultrasharp 27 inch", 
      buyerName: "Công ty ABC", 
      timeRemaining: "23:10:00", 
      lowestBid: "Chưa có", 
      participants: 0, 
      tags: ["Màn hình", "Số lượng lớn"],
      isUrgent: false 
    },
  ];

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-slate-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 to-slate-900/40 z-10"></div>
        
        {/* Placeholder Abstract Background */}
        <div className="absolute inset-0 z-0 opacity-30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
          <div className="absolute top-0 right-48 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 right-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-20 px-8 py-20 sm:px-16 sm:py-28 max-w-4xl">
          <span className="inline-block py-1 px-3 rounded-full bg-primary-500/20 text-primary-200 text-sm font-medium mb-6 border border-primary-500/30">
            Nền tảng đấu giá ngược linh kiện PC số 1
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6">
            Bạn chưa biết nên <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-blue-300">build máy thế nào?</span>
          </h1>
          <p className="text-lg text-slate-300 mb-10 max-w-2xl leading-relaxed">
            Đăng yêu cầu cấu hình mong muốn, nhận ngay các báo giá cạnh tranh nhất từ hàng trăm người bán uy tín. Tiết kiệm thời gian, tối ưu chi phí!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-semibold text-lg transition-all shadow-lg shadow-primary-600/30 flex items-center justify-center transform hover:-translate-y-1">
              Tạo yêu cầu cấu hình <ArrowRight className="ml-2" size={20} />
            </button>
            <button className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold text-lg transition-all flex items-center justify-center border border-white/10">
              <Search className="mr-2" size={20} />
              Khám phá linh kiện
            </button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section>
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Danh mục nổi bật</h2>
            <p className="text-slate-500 mt-2">Tìm kiếm linh kiện theo nhu cầu của bạn</p>
          </div>
          <button className="text-primary-600 font-medium hover:text-primary-700 hidden sm:flex items-center">
            Xem tất cả <ArrowRight className="ml-1" size={16} />
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          {categories.map((cat, idx) => (
            <CategoryCard 
              key={idx} 
              title={cat.title} 
              icon={cat.icon} 
              description={cat.desc} 
            />
          ))}
        </div>
      </section>

      {/* Trending Products Section */}
      <section>
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Linh kiện đang Hot</h2>
            <p className="text-slate-500 mt-2">Các sản phẩm được tìm kiếm và yêu cầu nhiều nhất</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingProducts.map((prod, idx) => (
            <ProductCard 
              key={idx} 
              name={prod.name} 
              price={prod.price} 
              rating={prod.rating} 
              sold={prod.sold} 
            />
          ))}
        </div>
      </section>

      {/* Recent Auctions Section */}
      <section>
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold text-slate-800">Phiên đấu giá đang mở</h2>
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            </div>
            <p className="text-slate-500 mt-2">Tham gia báo giá ngay để không bỏ lỡ khách hàng</p>
          </div>
          <button className="text-primary-600 font-medium hover:text-primary-700 hidden sm:flex items-center bg-primary-50 px-4 py-2 rounded-lg">
            Xem tất cả phòng đấu giá <ArrowRight className="ml-2" size={16} />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentAuctions.map((auction, idx) => (
            <AuctionCard 
              key={idx}
              title={auction.title}
              buyerName={auction.buyerName}
              timeRemaining={auction.timeRemaining}
              lowestBid={auction.lowestBid}
              participants={auction.participants}
              tags={auction.tags}
              isUrgent={auction.isUrgent}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
