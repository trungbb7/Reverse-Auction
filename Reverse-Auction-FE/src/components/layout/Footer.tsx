import { Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router";

const Footer = () => {
  return (
    <footer className="w-full bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & About */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">HardwareBid</h3>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Nền tảng đấu giá ngược linh kiện PC hàng đầu. Đăng cấu hình bạn
              cần, nhận báo giá tốt nhất từ các nhà bán hàng uy tín.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Phone className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Phone className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Phone className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">
              Liên kết nhanh
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link
                  to="/auctions"
                  className="hover:text-white transition-colors"
                >
                  Đấu giá đang diễn ra
                </Link>
              </li>
              <li>
                <Link
                  to="/create-request"
                  className="hover:text-white transition-colors"
                >
                  Tạo yêu cầu mua
                </Link>
              </li>
              <li>
                <Link
                  to="/sellers"
                  className="hover:text-white transition-colors"
                >
                  Danh sách nhà bán
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">
              Hỗ trợ khách hàng
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/help" className="hover:text-white transition-colors">
                  Trung tâm trợ giúp
                </Link>
              </li>
              <li>
                <Link
                  to="/policy"
                  className="hover:text-white transition-colors"
                >
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="hover:text-white transition-colors"
                >
                  Điều khoản dịch vụ
                </Link>
              </li>
              <li>
                <Link
                  to="/dispute"
                  className="hover:text-white transition-colors"
                >
                  Giải quyết tranh chấp
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Liên hệ</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 shrink-0 text-slate-400" />
                <span>Khu Công nghệ cao, TP. Thủ Đức, TP.HCM</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 shrink-0 text-slate-400" />
                <span>1900 1234</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 shrink-0 text-slate-400" />
                <span>support@hardwarebid.vn</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} HardwareBid. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg"
              alt="PayPal"
              className="h-5 opacity-70 grayscale hover:grayscale-0 transition-all"
            />
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg"
              alt="Visa"
              className="h-5 opacity-70 grayscale hover:grayscale-0 transition-all"
            />
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
              alt="Mastercard"
              className="h-5 opacity-70 grayscale hover:grayscale-0 transition-all"
            />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
