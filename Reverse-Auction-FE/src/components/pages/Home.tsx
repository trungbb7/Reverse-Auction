import {
  ArrowRight,
  Cpu,
  HardDrive,
  Monitor,
  Mouse,
  Zap,
  ShieldAlert,
  Cpu as GpuIcon,
  Box,
} from "lucide-react";
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
    {
      name: "CPU Intel Core i9-14900K",
      price: "14.500.000đ",
      rating: 4.9,
      sold: 128,
    },
    {
      name: "VGA NVIDIA RTX 4070 Ti Super",
      price: "22.300.000đ",
      rating: 4.8,
      sold: 85,
    },
    {
      name: "RAM Corsair Vengeance RGB 32GB DDR5",
      price: "3.200.000đ",
      rating: 5.0,
      sold: 342,
    },
    {
      name: "SSD Samsung 990 Pro 2TB",
      price: "4.100.000đ",
      rating: 4.9,
      sold: 215,
    },
  ];

  const recentAuctions = [
    {
      title: "Cần tìm RTX 4090 cũ còn bảo hành dài",
      buyerName: "Tuấn Anh",
      timeRemaining: "02:15:30",
      lowestBid: "35.500.000đ",
      participants: 8,
      tags: ["VGA", "Cũ", "Gấp"],
      isUrgent: true,
    },
    {
      title: "Build PC Gaming ngân sách 20 triệu",
      buyerName: "Minh Quân",
      timeRemaining: "14:45:00",
      lowestBid: "19.200.000đ",
      participants: 3,
      tags: ["PC Assembled", "Gaming"],
      isUrgent: false,
    },
    {
      title: "Tìm mua sỉ 20 màn hình Dell Ultrasharp 27 inch",
      buyerName: "Công ty ABC",
      timeRemaining: "23:10:00",
      lowestBid: "Chưa có",
      participants: 0,
      tags: ["Màn hình", "Số lượng lớn"],
      isUrgent: false,
    },
  ];

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="flex items-center gap-4 relative">
        <div className="flex min-h-[400px] pt-[62px] pr-12 pb-12 pl-12 flex-col justify-end items-start rounded-[32px] bg-[#001B3C] w-full absolute left-0 top-0 overflow-hidden relative">
          <img
            src="https://images.nightcafe.studio/galleries/L5aEoU6LKuf3guJk1n7u/futuristic_ai_assistant_avatar_sleek--1--1p8dx.jpg"
            className="absolute object-cover opacity-40 top-0 left-0 size-full overflow-hidden"
            alt="AI Assistant"
          />
          <div className="flex flex-col items-start gap-4 w-full z-10">
            <div className="flex py-1 px-3 items-start rounded-full border border-[rgba(55,95,151,0.30)] bg-[rgba(55,95,151,0.20)] w-fit">
              <p className="flex flex-col justify-center text-[#D5E3FF] font-inter text-xs font-bold leading-4 w-[90px] h-4 tracking-[0.1em]">
                AI-Powered
              </p>
            </div>
            <div className="flex flex-col items-start w-full">
              <p className="text-[#FFF] font-manrope text-5xl font-extrabold leading-[48px] w-full">
                Bạn chưa biết nên build máy thế nào?
              </p>
            </div>
            <div className="flex max-w-[512px] pb-4 flex-col items-start w-[512px]">
              <p className="flex flex-col justify-center text-[#CBD5E1] font-inter text-lg leading-7 w-[499px] h-14">
                Thử Trợ lý AI của chúng tôi để nhận danh sách cấu hình tối ưu
                chỉ trong 30 giây.
              </p>
            </div>
            <div className="flex py-3 px-8 items-center gap-2 rounded-full bg-[#FFF] w-fit">
              <p className="flex flex-col justify-center text-[#001B3C] font-inter text-base font-bold leading-6 h-6 text-center">
                Bắt đầu với AI
              </p>
              <svg
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="flex flex-col items-center w-fit "
              >
                <path
                  d="M18 8L16.75 5.25L14 4L16.75 2.75L18 0L19.25 2.75L22 4L19.25 5.25L18 8ZM18 22L16.75 19.25L14 18L16.75 16.75L18 14L19.25 16.75L22 18L19.25 19.25L18 22ZM8 19L5.5 13.5L0 11L5.5 8.5L8 3L10.5 8.5L16 11L10.5 13.5L8 19ZM8 14.15L9 12L11.15 11L9 10L8 7.85L7 10L4.85 11L7 12L8 14.15Z"
                  fill="#001B3C"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-start gap-6 w-full">
          <div className="flex pt-8 pr-8 pb-10 pl-8 flex-col items-start rounded-[32px] bg-[#C9E7FB] w-full overflow-hidden relative">
            <svg
              width="94"
              height="107"
              viewBox="0 0 94 107"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute -right-[13px] -bottom-[27px] opacity-10 w-[107px] h-[133px] "
            >
              <path
                opacity="0.1"
                d="M53.3333 133.333C37.8889 129.444 25.1389 120.583 15.0833 106.75C5.02778 92.9167 0 77.5556 0 60.6667V20L53.3333 0L106.667 20V60.6667C106.667 77.5556 101.639 92.9167 91.5833 106.75C81.5278 120.583 68.7778 129.444 53.3333 133.333ZM53.3333 119.333C64.1111 116 73.1111 109.417 80.3333 99.5833C87.5556 89.75 91.7778 78.7778 93 66.6667H53.3333V14.1667L13.3333 29.1667V60.6667C13.3333 61.8889 13.3333 62.8889 13.3333 63.6667C13.3333 64.4444 13.4444 65.4444 13.6667 66.6667H53.3333V119.333Z"
                fill="#181C20"
              />
            </svg>
            <div className="flex flex-col items-start gap-2 w-full">
              <svg
                width="24"
                height="30"
                viewBox="0 0 24 30"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-[30px] "
              >
                <path
                  d="M10.425 20.325L18.9 11.85L16.7625 9.7125L10.425 16.05L7.275 12.9L5.1375 15.0375L10.425 20.325ZM12 30C8.525 29.125 5.65625 27.1312 3.39375 24.0187C1.13125 20.9062 0 17.45 0 13.65V4.5L12 0L24 4.5V13.65C24 17.45 22.8688 20.9062 20.6063 24.0187C18.3438 27.1312 15.475 29.125 12 30ZM12 26.85C14.6 26.025 16.75 24.375 18.45 21.9C20.15 19.425 21 16.675 21 13.65V6.5625L12 3.1875L3 6.5625V13.65C3 16.675 3.85 19.425 5.55 21.9C7.25 24.375 9.4 26.025 12 26.85Z"
                  fill="#375F97"
                />
              </svg>
              <div className="flex pt-2 flex-col items-start w-full">
                <p className="text-[#4C6879] font-manrope text-2xl font-bold leading-8 w-full">
                  Mua sắm an toàn với dịch vụ Ký quỹ
                </p>
              </div>
              <div className="flex flex-col items-start w-full">
                <p className="text-[rgba(76,104,121,0.80)] font-inter text-sm leading-5 w-full">
                  Bảo vệ người mua 100% trong mọi tranh chấp phát sinh.
                </p>
              </div>
            </div>
          </div>
          <div className="flex p-8 flex-col justify-between items-start rounded-[32px] bg-[#E5E8EE] shadow-[01px2px0rgba(0,0,0,0.05)] w-full">
            <div className="flex flex-col items-start gap-2 w-full">
              <div className="flex flex-col items-start w-full">
                <p className="text-[#0F172A] font-manrope text-2xl font-bold leading-8 w-full">
                  Đăng yêu cầu và nhận báo giá cạnh tranh
                </p>
              </div>
              <div className="flex flex-col items-start w-full">
                <p className="text-[#475569] font-inter text-sm leading-5 w-full">
                  Tiết kiệm thời gian và ngân sách với hệ thống đấu thầu tự
                  động.
                </p>
              </div>
            </div>
            <div className="flex pr-[267px] items-center gap-2 w-fit">
              <p className="flex flex-col justify-center text-[#375F97] font-inter text-base font-bold leading-6 h-6 text-center">
                Tạo yêu cầu ngay
              </p>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="flex flex-col items-center w-fit "
              >
                <path
                  d="M12.175 9H0V7H12.175L6.575 1.4L8 0L16 8L8 16L6.575 14.6L12.175 9Z"
                  fill="#375F97"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Live Statistic Section */}
      <div className="flex pt-6 pr-10 pb-6 pl-10 justify-between items-center rounded-2xl border border-[rgba(195,198,209,0.10)] bg-[#F1F4FA] w-full">
        <div className="flex items-center gap-4 w-fit">
          <div className="flex justify-center items-center rounded-full bg-[#DCFCE7] w-12 h-12">
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
                fill="#16A34A"
              />
            </svg>
          </div>
          <div className="flex flex-col items-start w-fit">
            <div className="flex flex-col items-start w-full">
              <p className="flex flex-col justify-center text-[#0F172A] font-inter text-2xl font-black leading-6 w-[81px] h-6">
                1,200+
              </p>
            </div>
            <div className="flex flex-col items-start w-full">
              <p className="flex flex-col justify-center text-[#64748B] font-inter text-xs font-medium leading-4 w-[139px] h-4 tracking-tighter">
                Báo giá trong 24h qua
              </p>
            </div>
          </div>
        </div>
        <div className="bg-[#E2E8F0] w-px h-10"></div>
        <div className="flex items-center gap-4 w-fit">
          <div className="flex justify-center items-center rounded-full bg-[#DBEAFE] w-12 h-12">
            <svg
              width="20"
              height="19"
              viewBox="0 0 20 19"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="flex flex-col items-start w-fit "
            >
              <path
                d="M14 9C14.2833 9 14.5208 8.90417 14.7125 8.7125C14.9042 8.52083 15 8.28333 15 8C15 7.71667 14.9042 7.47917 14.7125 7.2875C14.5208 7.09583 14.2833 7 14 7C13.7167 7 13.4792 7.09583 13.2875 7.2875C13.0958 7.47917 13 7.71667 13 8C13 8.28333 13.0958 8.52083 13.2875 8.7125C13.4792 8.90417 13.7167 9 14 9ZM6 7H11V5H6V7ZM2.5 19C1.93333 17.1 1.375 15.2042 0.825 13.3125C0.275 11.4208 0 9.48333 0 7.5C0 5.96667 0.533333 4.66667 1.6 3.6C2.66667 2.53333 3.96667 2 5.5 2H10.5C10.9833 1.36667 11.5708 0.875 12.2625 0.525C12.9542 0.175 13.7 0 14.5 0C14.9167 0 15.2708 0.145833 15.5625 0.4375C15.8542 0.729167 16 1.08333 16 1.5C16 1.6 15.9875 1.7 15.9625 1.8C15.9375 1.9 15.9083 1.99167 15.875 2.075C15.8083 2.25833 15.7458 2.44583 15.6875 2.6375C15.6292 2.82917 15.5833 3.025 15.55 3.225L17.825 5.5H20V12.475L17.175 13.4L15.5 19H10V17H8V19H2.5ZM4 17H6V15H12V17H14L15.55 11.85L18 11.025V7.5H17L13.5 4C13.5 3.66667 13.5208 3.34583 13.5625 3.0375C13.6042 2.72917 13.6667 2.41667 13.75 2.1C13.2667 2.23333 12.8417 2.4625 12.475 2.7875C12.1083 3.1125 11.8417 3.51667 11.675 4H5.5C4.53333 4 3.70833 4.34167 3.025 5.025C2.34167 5.70833 2 6.53333 2 7.5C2 9.13333 2.225 10.7292 2.675 12.2875C3.125 13.8458 3.56667 15.4167 4 17Z"
                fill="#2563EB"
              />
            </svg>
          </div>
          <div className="flex flex-col items-start w-fit">
            <div className="flex flex-col items-start w-full">
              <p className="flex flex-col justify-center text-[#0F172A] font-inter text-2xl font-black leading-6 w-[65px] h-6">
                ~15%
              </p>
            </div>
            <div className="flex flex-col items-start w-full">
              <p className="flex flex-col justify-center text-[#64748B] font-inter text-xs font-medium leading-4 w-[125px] h-4 tracking-[-0.05em]">
                Tiết kiệm trung bình
              </p>
            </div>
          </div>
        </div>
        <div className="bg-[#E2E8F0] w-px h-10"></div>
        <div className="flex items-center gap-4 w-fit">
          <div className="flex justify-center items-center rounded-full bg-[#F3E8FF] w-12 h-12">
            <svg
              width="21"
              height="21"
              viewBox="0 0 21 21"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="flex flex-col items-start w-fit "
            >
              <path
                d="M3.6 7.99556L5.55 8.82056C5.78333 8.3539 6.025 7.9039 6.275 7.47056C6.525 7.03723 6.8 6.6039 7.1 6.17056L5.7 5.89556L3.6 7.99556ZM7.15 10.0706L10 12.8956C10.7 12.6289 11.45 12.2206 12.25 11.6706C13.05 11.1206 13.8 10.4956 14.5 9.79556C15.6667 8.6289 16.5792 7.33306 17.2375 5.90806C17.8958 4.48306 18.1833 3.17056 18.1 1.97056C16.9 1.88723 15.5833 2.17473 14.15 2.83306C12.7167 3.4914 11.4167 4.4039 10.25 5.57056C9.55 6.27056 8.925 7.02056 8.375 7.82056C7.825 8.62056 7.41667 9.37056 7.15 10.0706ZM11.6 8.44556C11.2167 8.06223 11.025 7.5914 11.025 7.03306C11.025 6.47473 11.2167 6.0039 11.6 5.62056C11.9833 5.23723 12.4583 5.04556 13.025 5.04556C13.5917 5.04556 14.0667 5.23723 14.45 5.62056C14.8333 6.0039 15.025 6.47473 15.025 7.03306C15.025 7.5914 14.8333 8.06223 14.45 8.44556C14.0667 8.8289 13.5917 9.02056 13.025 9.02056C12.4583 9.02056 11.9833 8.8289 11.6 8.44556ZM12.075 16.4706L14.175 14.3706L13.9 12.9706C13.4667 13.2706 13.0333 13.5414 12.6 13.7831C12.1667 14.0247 11.7167 14.2622 11.25 14.4956L12.075 16.4706ZM19.9 0.145565C20.2167 2.16223 20.0208 4.12473 19.3125 6.03306C18.6042 7.9414 17.3833 9.76223 15.65 11.4956L16.15 13.9706C16.2167 14.3039 16.2 14.6289 16.1 14.9456C16 15.2622 15.8333 15.5372 15.6 15.7706L11.4 19.9706L9.3 15.0456L5.025 10.7706L0.1 8.67056L4.275 4.47056C4.50833 4.23723 4.7875 4.07056 5.1125 3.97056C5.4375 3.87056 5.76667 3.8539 6.1 3.92056L8.575 4.42056C10.3083 2.68723 12.125 1.46223 14.025 0.745565C15.925 0.0288979 17.8833 -0.171102 19.9 0.145565ZM1.875 13.9456C2.45833 13.3622 3.17083 13.0664 4.0125 13.0581C4.85417 13.0497 5.56667 13.3372 6.15 13.9206C6.73333 14.5039 7.02083 15.2164 7.0125 16.0581C7.00417 16.8997 6.70833 17.6122 6.125 18.1956C5.70833 18.6122 5.0125 18.9706 4.0375 19.2706C3.0625 19.5706 1.71667 19.8372 0 20.0706C0.233333 18.3539 0.5 17.0081 0.8 16.0331C1.1 15.0581 1.45833 14.3622 1.875 13.9456ZM3.3 15.3456C3.13333 15.5122 2.96667 15.8164 2.8 16.2581C2.63333 16.6997 2.51667 17.1456 2.45 17.5956C2.9 17.5289 3.34583 17.4164 3.7875 17.2581C4.22917 17.0997 4.53333 16.9372 4.7 16.7706C4.9 16.5706 5.00833 16.3289 5.025 16.0456C5.04167 15.7622 4.95 15.5206 4.75 15.3206C4.55 15.1206 4.30833 15.0247 4.025 15.0331C3.74167 15.0414 3.5 15.1456 3.3 15.3456Z"
                fill="#9333EA"
              />
            </svg>
          </div>
          <div className="flex flex-col items-start w-fit">
            <div className="flex flex-col items-start w-full">
              <p className="flex flex-col justify-center text-[#0F172A] font-inter text-2xl font-black leading-6 h-6">
                8.4 Phút
              </p>
            </div>
            <div className="flex flex-col items-start w-full">
              <p className="flex flex-col justify-center text-[#64748B] font-inter text-xs font-medium leading-4 w-[131px] h-4 tracking-[-0.05em]">
                Thời gian phản hồi TB
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <section>
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Danh mục nổi bật
            </h2>
            <p className="text-slate-500 mt-2">
              Tìm kiếm linh kiện theo nhu cầu của bạn
            </p>
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
            <h2 className="text-2xl font-bold text-slate-800">
              Linh kiện đang Hot
            </h2>
            <p className="text-slate-500 mt-2">
              Các sản phẩm được tìm kiếm và yêu cầu nhiều nhất
            </p>
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
              <h2 className="text-2xl font-bold text-slate-800">
                Phiên đấu giá đang mở
              </h2>
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            </div>
            <p className="text-slate-500 mt-2">
              Tham gia báo giá ngay để không bỏ lỡ khách hàng
            </p>
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
