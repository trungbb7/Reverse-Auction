import { Rocket } from "lucide-react";

export default function AutoBidCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-linear-to-br from-[#1B2F55] to-[#375F97] text-white p-6 flex flex-col items-center justify-between min-h-[340px]">
      <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
        <Rocket className="w-8 h-8 text-white/80" />
      </div>
      <div className="text-center flex-1">
        <p className="font-bold text-lg leading-snug mb-2">
          Bạn không tìm thấy yêu cầu ưng ý?
        </p>
        <p className="text-sm text-white/70 leading-relaxed">
          Hãy để lại thông tin linh kiện bạn đang có sẵn, chúng tôi sẽ thông báo
          khi có yêu cầu khớp.
        </p>
      </div>
      <button className="mt-6 w-full py-3 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-bold transition-all border border-white/20">
        Đăng ký báo giá tự động
      </button>
    </div>
  );
}
