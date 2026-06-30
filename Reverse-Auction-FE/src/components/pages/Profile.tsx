import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { userService } from "@/services/userService";
import { logoutUser } from "../Auth/authSlice";
import { useAppDispatch } from "@/hooks/redux";
import type { User } from "@/types/user";
import type { Transaction } from "@/types/transaction";
import { cloudinaryService } from "@/services/cloudinaryService";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import type { ErrorResponse } from "@/types/errorResponse";
import { 
  Wallet, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  AlertCircle, 
  Landmark, 
  User as UserIcon,
  RefreshCw
} from "lucide-react";

type InputProps = {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const defaultUser: User = {
  id: 1,
  fullName: "Nguyen A",
  email: "nguyenA@gmail.com",
  phone: "+84 90 123 4567",
  role: "ROLE_BUYER",
  enabled: true,
};

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User>(defaultUser);
  const [form, setForm] = useState<User>(defaultUser);
  const [loading, setLoading] = useState(true);
  const [identityNumber, setIdentityNumber] = useState("");
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [businessLicense, setBusinessLicense] = useState<File | null>(null);
  const [kycLoading, setKycLoading] = useState(false);
  const dispatch = useAppDispatch();

  const [activeTab, setActiveTab] = useState<"profile" | "wallet">("profile");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [fetchTxLoading, setFetchTxLoading] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [depositType, setDepositType] = useState<"instant" | "vnpay">("vnpay");
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({
    amount: "",
    bankName: "",
    accountNumber: "",
    accountHolder: ""
  });
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [depositLoading, setDepositLoading] = useState(false);

  const loadTransactions = async () => {
    setFetchTxLoading(true);
    try {
      const txs = await userService.fetchTransactions();
      setTransactions(txs);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    } finally {
      setFetchTxLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const data = await userService.fetchUser();
      setUser(data);
      setForm(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === "wallet") {
      loadTransactions();
      refreshUser();
    }
  }, [activeTab]);

  const handleDeposit = async () => {
    const amt = Number(depositAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Vui lòng nhập số tiền hợp lệ lớn hơn 0");
      return;
    }

    setDepositLoading(true);
    try {
      if (depositType === "instant") {
        await userService.instantDeposit(amt);
        toast.success("Nạp tiền thành công!");
        setDepositAmount("");
        setDepositModalOpen(false);
        refreshUser();
        loadTransactions();
      } else {
        // VNPay
        const tx = await userService.initiateVNPayDeposit(amt, "NCB");
        if (tx.description) {
          window.location.href = tx.description;
        } else {
          toast.error("Không tạo được liên kết thanh toán VNPay");
        }
      }
    } catch (err) {
      toast.error("Đã xảy ra lỗi khi nạp tiền");
      console.error(err);
    } finally {
      setDepositLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const amt = Number(withdrawForm.amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Vui lòng nhập số tiền hợp lệ lớn hơn 0");
      return;
    }
    if (!withdrawForm.bankName || !withdrawForm.accountNumber || !withdrawForm.accountHolder) {
      toast.error("Vui lòng nhập đầy đủ thông tin tài khoản ngân hàng");
      return;
    }
    if (user.balance !== undefined && user.balance < amt) {
      toast.error("Số dư ví không đủ");
      return;
    }

    setWithdrawLoading(true);
    try {
      await userService.requestWithdrawal({
        amount: amt,
        bankName: withdrawForm.bankName,
        accountNumber: withdrawForm.accountNumber,
        accountHolder: withdrawForm.accountHolder
      });
      toast.success("Yêu cầu rút tiền thành công, đang chờ Admin duyệt!");
      setWithdrawForm({ amount: "", bankName: "", accountNumber: "", accountHolder: "" });
      setWithdrawModalOpen(false);
      refreshUser();
      loadTransactions();
    } catch (err) {
      toast.error("Đã xảy ra lỗi khi rút tiền");
      console.error(err);
    } finally {
      setWithdrawLoading(false);
    }
  };

  useEffect(() => {
    const getUser = async () => {
      try {
        const data = await userService.fetchUser();
        setUser(data);
        setForm(data);
      } catch {
        console.warn("API failed");
      } finally {
        setLoading(false);
      }
    };
    getUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const data = await userService.updateUser(form);
      setUser(data);
      setForm(data);
      console.log("Updated:", data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleKycSubmit = async () => {
    if (!identityNumber || !frontImage || !backImage || !businessLicense) {
      alert(
        "Vui lòng điền đủ Số CCCD và 2 mặt ảnh cùng với giấy phép kinh doanh!",
      );
      return;
    }
    setKycLoading(true);
    try {
      const fileList: File[] = [];
      fileList.push(frontImage);
      fileList.push(backImage);
      fileList.push(businessLicense);

      const imageUrls = await cloudinaryService.uploadMultiImages(fileList);

      console.log(imageUrls);

      const payload = {
        identityNumber,
        frontIdentity: imageUrls[0],
        backIdentity: imageUrls[1],
        businessLicense: imageUrls[2],
      };

      const updatedUser = await userService.submitKyc(payload);
      setUser(updatedUser);
      setForm(updatedUser);
      toast.success("Gửi yêu cầu xác minh thành công!");
    } catch (err) {
      if (err instanceof AxiosError && err.response?.status === 400) {
        const { fieldErrors } = err.response?.data as ErrorResponse;
        toast.error(`${Object.values(fieldErrors || {})[0]}`);
      } else {
        toast.error("Đã xảy ra lỗi khi gửi yêu cầu xác minh!");
      }
    } finally {
      setKycLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/auth/login");
  };

  if (loading) {
    return <div className="p-10">Loading...</div>;
  }
  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800">Hồ sơ người dùng</h1>

        <p className="text-gray-500 mt-2">
          Quản lý thông tin tài khoản và bảo mật
        </p>

        <div className="grid grid-cols-3 gap-6 mt-8">
          {/* LEFT */}
          <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col items-center">
            <div className="relative">
              <img
                src="https://i.pravatar.cc/150"
                alt=""
                className="w-24 h-24 rounded-full"
              />
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-full border-2 border-white" />
            </div>
            <h2 className="mt-4 font-semibold text-lg">{user.fullName}</h2>

            <div className="w-full mt-6 text-sm">
              <p className="text-gray-400 text-xs uppercase">Email</p>
              <p>{user.email}</p>

              <p className="text-gray-400 text-xs uppercase mt-3">
                Số điện thoại
              </p>
              <p>{user.phone}</p>
            </div>

            <div className="w-full mt-6 space-y-2 border-t pt-4">
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  activeTab === "profile" 
                    ? "bg-blue-50 text-blue-600 shadow-sm" 
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <UserIcon className="w-4 h-4" />
                Thông tin cá nhân
              </button>
              <button
                onClick={() => setActiveTab("wallet")}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  activeTab === "wallet" 
                    ? "bg-blue-50 text-blue-600 shadow-sm" 
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  Ví & Số dư
                </span>
                {user.balance !== undefined && (
                  <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded-full font-bold">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(user.balance)}
                  </span>
                )}
              </button>
            </div>

            <button
              onClick={() => navigate("/orderHistory")}
              className="mt-6 w-full border border-blue-500 text-blue-600 py-2 rounded-full hover:bg-blue-50"
            >
              Lịch sử đơn hàng
            </button>

            <button
              onClick={() => navigate("/auth/change-password")}
              className="mt-3 w-full border border-blue-500 text-blue-600 py-2 rounded-full hover:bg-blue-50"
            >
              Đặt lại mật khẩu
            </button>
          </div>

          {/* RIGHT */}
          {activeTab === "profile" ? (
            <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-6">Cập nhật thông tin</h2>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Họ và tên"
                  name="fullName"
                  value={form.fullName || ""}
                  onChange={handleChange}
                />
                <Input
                  label="Tên hiển thị"
                  name="username"
                  value={""}
                  onChange={handleChange}
                />
                <Input
                  label="Email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                />
                <Input
                  label="Số điện thoại"
                  name="phone"
                  value={form.phone || ""}
                  onChange={handleChange}
                />
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={handleSubmit}
                  className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 cursor-pointer"
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>
          ) : (
            <div className="col-span-2 space-y-6">
              {/* WALLET CARD */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4">
                  <Wallet className="w-64 h-64" />
                </div>
                
                <p className="text-blue-100 text-sm font-medium tracking-wide uppercase">Số dư khả dụng</p>
                <h3 className="text-4xl font-black mt-2">
                  {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(user.balance || 0)}
                </h3>

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => setDepositModalOpen(true)}
                    className="flex-1 flex items-center justify-center gap-2 bg-white text-blue-600 font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors shadow-md shadow-black/10 cursor-pointer"
                  >
                    <Plus className="w-5 h-5" />
                    Nạp tiền
                  </button>
                  <button
                    onClick={() => setWithdrawModalOpen(true)}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-500/30 hover:bg-blue-500/40 text-white border border-blue-400/50 font-bold px-6 py-3 rounded-xl transition-colors shadow-md shadow-black/5 cursor-pointer"
                  >
                    <Landmark className="w-5 h-5" />
                    Rút tiền
                  </button>
                </div>
              </div>

              {/* TRANSACTIONS HISTORY */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-800">Lịch sử giao dịch</h3>
                  <button
                    onClick={loadTransactions}
                    disabled={fetchTxLoading}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 cursor-pointer"
                    title="Tải lại lịch sử"
                  >
                    <RefreshCw className={`w-4 h-4 text-gray-600 ${fetchTxLoading ? "animate-spin" : ""}`} />
                  </button>
                </div>

                {fetchTxLoading ? (
                  <div className="py-20 flex justify-center items-center">
                    <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="py-16 text-center">
                    <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">Chưa có giao dịch nào được thực hiện.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto pr-1">
                    {transactions.map((tx) => {
                      const isIncoming = tx.type === "DEPOSIT" || tx.type === "REFUND" || tx.amount > 0;
                      return (
                        <div key={tx.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              isIncoming ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                            }`}>
                              {isIncoming ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-gray-800">{tx.description}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-400">
                                  {new Date(tx.createdAt).toLocaleString("vi-VN")}
                                </span>
                                <span className="text-xs text-gray-300">•</span>
                                <span className="text-xs text-gray-400 font-mono">{tx.code}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className={`font-bold text-sm ${isIncoming ? "text-green-600" : "text-red-600"}`}>
                              {isIncoming ? "+" : ""}
                              {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(tx.amount)}
                            </p>
                            <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-bold mt-1 uppercase ${
                              tx.status === "SUCCESS" 
                                ? "bg-green-50 text-green-700" 
                                : tx.status === "PENDING"
                                ? "bg-yellow-50 text-yellow-700"
                                : "bg-red-50 text-red-700"
                            }`}>
                              {tx.status === "SUCCESS" ? "Thành công" : tx.status === "PENDING" ? "Chờ duyệt" : "Thất bại"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* KYC SECTION */}
          {user.role === "ROLE_SELLER" && (
            <div className="col-span-3 bg-white rounded-2xl p-6 shadow-sm mt-6">
              <h2 className="text-lg font-semibold mb-4">
                Xác minh danh tính (KYC)
              </h2>

              <div className="mb-4">
                <span className="text-sm font-medium">
                  Trạng thái hiện tại:{" "}
                </span>
                <span
                  className={`font-bold ${user.kycStatus === "APPROVED" ? "text-green-600" : user.kycStatus === "REJECTED" ? "text-red-600" : user.kycStatus === "PENDING" ? "text-yellow-600" : "text-gray-500"}`}
                >
                  {user.kycStatus === "APPROVED"
                    ? "Đã xác minh"
                    : user.kycStatus === "REJECTED"
                      ? "Bị từ chối"
                      : user.kycStatus === "PENDING"
                        ? "Đang chờ duyệt"
                        : "Chưa xác minh"}
                </span>
                {user.kycStatus === "REJECTED" && user.kycMessage && (
                  <p className="text-red-500 text-sm mt-1">
                    Lý do: {user.kycMessage}
                  </p>
                )}
              </div>

              {(user.kycStatus === "UNVERIFIED" ||
                user.kycStatus === "REJECTED") && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-sm text-gray-500">Số CCCD</label>
                    <input
                      type="text"
                      value={identityNumber}
                      onChange={(e) => setIdentityNumber(e.target.value)}
                      className="w-full mt-1 px-4 py-2 bg-gray-100 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">
                      Ảnh mặt trước CCCD
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setFrontImage(e.target.files?.[0] || null)
                      }
                      className="w-full mt-1 px-4 py-2 bg-gray-100 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">
                      Ảnh mặt sau CCCD
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setBackImage(e.target.files?.[0] || null)
                      }
                      className="w-full mt-1 px-4 py-2 bg-gray-100 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-500">
                      Giấy phép kinh doanh
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setBusinessLicense(e.target.files?.[0] || null)
                      }
                      className="w-full mt-1 px-4 py-2 bg-gray-100 rounded-lg"
                    />
                  </div>
                </div>
              )}

              {(user.kycStatus === "UNVERIFIED" ||
                user.kycStatus === "REJECTED") && (
                <div className="flex justify-end mt-6">
                  <button
                    onClick={handleKycSubmit}
                    disabled={kycLoading}
                    className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 disabled:opacity-50"
                  >
                    {kycLoading ? "Đang gửi..." : "Gửi xác minh"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* LOGOUT */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mt-6 w-80">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Phiên làm việc</p>
              <p className="text-sm text-gray-400">Kết thúc phiên hiện tại</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-red-500 font-medium cursor-pointer hover:text-red-600"
            >
              Đăng xuất
            </button>
          </div>
        </div>

        {/* DEPOSIT MODAL */}
        {depositModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6">
              <div>
                <h3 className="text-xl font-black text-gray-800">Nạp tiền vào ví</h3>
                <p className="text-sm text-gray-500 mt-1">Chọn phương thức và nhập số tiền nạp.</p>
              </div>

              <div className="space-y-4">
                {/* Method selection */}
                <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setDepositType("vnpay")}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors cursor-pointer ${
                      depositType === "vnpay" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    VNPay (NCB)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDepositType("instant")}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors cursor-pointer ${
                      depositType === "instant" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    Simulated (Nhanh)
                  </button>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Số tiền nạp (VND)</label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="Nhập số tiền..."
                    className="w-full mt-1.5 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                </div>

                {/* Quick amounts */}
                <div className="grid grid-cols-3 gap-2">
                  {[50000, 100000, 200000, 500000, 1000000, 2000000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setDepositAmount(val.toString())}
                      className="py-2 text-xs font-bold bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded-lg border border-gray-200 hover:border-blue-300 transition-all text-gray-700 cursor-pointer"
                    >
                      {new Intl.NumberFormat("vi-VN").format(val)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setDepositAmount("");
                    setDepositModalOpen(false);
                  }}
                  className="flex-1 py-3 text-sm font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleDeposit}
                  disabled={depositLoading || !depositAmount}
                  className="flex-1 py-3 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shadow-md shadow-blue-200 disabled:opacity-50 cursor-pointer"
                >
                  {depositLoading ? "Đang xử lý..." : "Nạp tiền"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* WITHDRAW MODAL */}
        {withdrawModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6">
              <div>
                <h3 className="text-xl font-black text-gray-800">Yêu cầu rút tiền</h3>
                <p className="text-sm text-gray-500 mt-1">Vui lòng nhập số tiền và tài khoản nhận.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Số tiền rút (VND)</label>
                  <input
                    type="number"
                    value={withdrawForm.amount}
                    onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                    placeholder="Nhập số tiền..."
                    className="w-full mt-1.5 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Số dư khả dụng: {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(user.balance || 0)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Tên ngân hàng</label>
                  <input
                    type="text"
                    value={withdrawForm.bankName}
                    onChange={(e) => setWithdrawForm({ ...withdrawForm, bankName: e.target.value })}
                    placeholder="Ví dụ: Vietcombank, Techcombank..."
                    className="w-full mt-1.5 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Số tài khoản</label>
                  <input
                    type="text"
                    value={withdrawForm.accountNumber}
                    onChange={(e) => setWithdrawForm({ ...withdrawForm, accountNumber: e.target.value })}
                    placeholder="Nhập số tài khoản..."
                    className="w-full mt-1.5 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Tên chủ tài khoản</label>
                  <input
                    type="text"
                    value={withdrawForm.accountHolder}
                    onChange={(e) => setWithdrawForm({ ...withdrawForm, accountHolder: e.target.value.toUpperCase() })}
                    placeholder="VIET DUC NGUYEN"
                    className="w-full mt-1.5 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold placeholder:font-normal uppercase"
                  />
                </div>

                <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 flex gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    Yêu cầu rút tiền sẽ được phê duyệt bởi Admin trong vòng 24h. Số tiền rút sẽ tạm thời bị khấu trừ ngay lập tức.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setWithdrawModalOpen(false)}
                  className="flex-1 py-3 text-sm font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleWithdraw}
                  disabled={withdrawLoading || !withdrawForm.amount || !withdrawForm.bankName || !withdrawForm.accountNumber || !withdrawForm.accountHolder}
                  className="flex-1 py-3 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shadow-md shadow-blue-200 disabled:opacity-50 cursor-pointer"
                >
                  {withdrawLoading ? "Đang xử lý..." : "Rút tiền"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Input({ label, name, value, onChange }: InputProps) {
  return (
    <div>
      <label className="text-sm text-gray-500">{label}</label>
      <input
        name={name}
        value={value || ""}
        onChange={onChange}
        className="w-full mt-1 px-4 py-2 bg-gray-100 rounded-lg"
      />
    </div>
  );
}
