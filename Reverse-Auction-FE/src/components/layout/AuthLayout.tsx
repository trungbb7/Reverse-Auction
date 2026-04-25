import { Outlet } from "react-router";

export default function AuthLayout() {
  return (
    <div>
      <div className="flex flex-row min-h-screen bg-white font-sans">
        {/* Left side */}
        <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-center items-center text-center p-12">
          <img
            src="https://cdna.pcpartpicker.com/static/forever/images/userbuild/378445.7c17818a0daa6adbf1a47b6b09a6d64e.1600.jpg"
            className="absolute object-cover opacity-40 w-full h-full overflow-hidden max-w-none"
            alt="bg-img"
          />
          <div className="absolute bottom-0 bg-linear-[0deg,#091F5C0%,rgba(9,31,92,0.00)100%] w-full h-32"></div>
          <div className="flex max-w-[576px] p-16 flex-col justify-center items-start w-fit h-full">
            <div className="flex pb-6 flex-col items-start w-full">
              <div className="flex flex-col items-start w-full">
                <p className="text-[#7096D2] font-publicSans text-5xl font-extrabold w-full tracking-tight">
                  <span className="text-white">Phần cứng tốt hơn,</span> Giá hời
                  hơn.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start w-full">
              <p className="flex flex-col justify-center text-[#CBD5E1] font-publicSans text-lg leading-[29.25px] w-[436px] h-[88px]">
                Tham gia nền tảng đấu giá ngược duy nhất dành cho những người
                đam mê phần cứng và cơ sở hạ tầng doanh nghiệp.
              </p>
            </div>
            <div className="flex pt-12 flex-col items-start w-full">
              <div className="inline-grid w-full relative">
                <div className="flex flex-col items-start gap-2 w-full absolute left-0 top-0">
                  <div className="flex flex-col items-start">
                    <p className="text-[#7096D2] font-publicSans text-3xl font-bold leading-9 w-full">
                      12k+
                    </p>
                  </div>
                  <div className="flex flex-col items-start">
                    <p className="text-[#94A3B8] font-publicSans text-sm leading-5 w-full tracking-wider">
                      NGƯỜI DÙNG HOẠT ĐỘNG
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-start gap-2 absolute left-[234px] top-0">
                  <div className="flex flex-col items-start w-full">
                    <p className="text-[#7096D2] font-publicSans text-3xl font-bold leading-9 w-full">
                      $4.2M
                    </p>
                  </div>
                  <div className="flex flex-col items-start w-full">
                    <p className="text-[#94A3B8] font-publicSans text-sm leading-5 w-full tracking-wider">
                      TỔNG GIAO DỊCH
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side: Form content */}
        <div className="flex flex-col justify-center w-full lg:w-1/2 px-8 sm:px-16 md:px-24 xl:px-32 bg-[#EDF0F6] relative">
          {/* <div className="absolute top-8 left-8 sm:left-16 md:left-24 xl:left-32">
          <Link
            to="/"
            className="flex items-center space-x-2 text-slate-800 hover:text-primary-600 transition-colors"
          >
            <div className="w-8 h-8 bg-primary-600 text-white rounded-lg flex items-center justify-center">
              <Cpu size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight">
              HardwardBid
            </span>
          </Link>
        </div> */}

          <div className="w-full max-w-md mx-auto mt-16 lg:mt-0 bg-white p-8 rounded-3xl">
            <Outlet />
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-end items-start rounded-2xl border-t border-t-[#E2E8F0] bg-[#EDF0F6] min-w-screen">
        <div className="flex flex-col items-start rounded-2xl border-t border-t-[#E2E8F0] bg-[#EDF0F6] w-full">
          <div className="flex max-w-[1280px] py-8 px-6 justify-between items-center w-full">
            <div className="flex flex-col items-start w-fit">
              <p className="flex flex-col justify-center text-[#091F5C] font-publicSans text-lg font-bold leading-7 w-28 h-7">
                HardwareBid
              </p>
            </div>
            <div className="flex justify-center items-start gap-6 w-fit">
              <div className="flex flex-col items-start w-fit h-full">
                <p className="flex flex-col justify-center text-[#64748B] font-arima text-xs leading-4 h-4">
                  Điều khoản
                </p>
              </div>
              <div className="flex flex-col items-start w-[95px] h-full">
                <p className="flex flex-col justify-center text-[#64748B] font-arimo text-xs leading-4 w-[95px] h-4">
                  Quyền riêng tư
                </p>
              </div>
              <div className="flex flex-col items-start w-fit h-full">
                <p className="flex flex-col justify-center text-[#64748B] font-arimo text-xs leading-4 w-[47px] h-4">
                  Liên hệ
                </p>
              </div>
              <div className="flex flex-col items-start w-fit h-full">
                <p className="flex flex-col justify-center text-[#64748B] font-arimo text-xs leading-4 w-[103px] h-4">
                  Trung tâm hỗ trợ
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start w-fit">
              <p className="flex flex-col justify-center text-[#7096D2] font-nimbusSans text-xs leading-4 h-4">
                © 2026 HardwareBid Inc. Bảo lưu mọi quyền.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
