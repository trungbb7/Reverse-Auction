import { useEffect, useRef, useState } from "react";
import {
    Store,
    Mail,
    Phone,
    MapPin,
    FileText,
    Camera,
} from "lucide-react";
import toast from "react-hot-toast";
import { userService } from "@/services/userService.ts";
import { cloudinaryService } from "@/services/cloudinaryService";
import type {User} from "@/types/user.ts";

export default function SellerInfo() {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(false);

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const DEFAULT_AVATAR =
        "https://ui-avatars.com/api/?name=Shop&background=4f46e5&color=fff";
    const [form, setForm] = useState({
        shopName: "",
        email: "",
        phone: "",
        address: "",
        description: "",
        avatar: "",
    });

    const loadProfile = async () => {
        try {
            setLoading(true);

            const data = await userService.fetchUser();

            setUser(data);

            setForm({
                shopName: data.fullName ?? "",
                email: data.email ?? "",
                phone: data.phone ?? "",
                address: data.address ?? "",
                description: data.description ?? "",
                avatar: data.imageUrl ?? DEFAULT_AVATAR,
            });
        } catch (error) {
            console.error(error);
            toast.error("Không tải được thông tin cửa hàng");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadProfile();
    }, []);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setForm(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleAvatarChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];

        if (!file) return;

        setAvatarFile(file);

        setForm(prev => ({
            ...prev,
            avatar: URL.createObjectURL(file),
        }));
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);

            let avatarUrl = form.avatar;

            if (avatarFile) {
                avatarUrl =
                    await cloudinaryService.uploadSingleImage(
                        avatarFile
                    );
            }

            if (!user) return;

            await userService.updateUser({
                ...user,

                fullName: form.shopName,
                phone: form.phone,
                address: form.address,
                description: form.description,
                imageUrl: avatarUrl,
            });

            toast.success("Cập nhật thành công");

            setAvatarFile(null);

            await loadProfile();
        } catch (error) {
            console.error(error);
            toast.error("Cập nhật thất bại");
        } finally {
            setLoading(false);
        }
    };

    if (loading && !form.email) {
        return (
            <div className="p-8">
                Loading...
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* LEFT */}
            <div className="lg:col-span-2">
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">

                    <h2 className="text-xl font-semibold text-slate-800 mb-6">
                        Thông tin cửa hàng
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium mb-2">
                                <Store size={16}/>
                                Tên cửa hàng
                            </label>

                            <input
                                name="shopName"
                                value={form.shopName}
                                onChange={handleChange}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium mb-2">
                                <Mail size={16}/>
                                Email
                            </label>

                            <input
                                value={form.email}
                                disabled
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-100 text-slate-500"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium mb-2">
                                <Phone size={16}/>
                                Số điện thoại
                            </label>

                            <input
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium mb-2">
                                <MapPin size={16}/>
                                Địa chỉ
                            </label>

                            <input
                                name="address"
                                value={form.address}
                                onChange={handleChange}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3"
                            />
                        </div>
                    </div>

                    <div className="mt-6">
                        <label className="flex items-center gap-2 text-sm font-medium mb-2">
                            <FileText size={16}/>
                            Mô tả cửa hàng
                        </label>

                        <textarea
                            rows={5}
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3"
                        />
                    </div>

                    <div className="flex justify-end mt-8">
                        <button
                            disabled={loading}
                            onClick={handleSubmit}
                            className="bg-indigo-900 hover:bg-indigo-800 text-white px-8 py-3 rounded-2xl font-semibold disabled:opacity-50"
                        >
                            {loading ? "Đang lưu..." : "Lưu thay đổi"}
                        </button>
                    </div>
                </div>
            </div>

            {/* RIGHT */}
            <div className="space-y-6">

                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                    <div className="flex flex-col items-center">

                        <div className="relative">

                            <img
                                src={form.avatar}
                                alt=""
                                className="w-32 h-32 rounded-full object-cover border-4 border-slate-100"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    fileInputRef.current?.click()
                                }
                                className="absolute bottom-0 right-0 bg-indigo-900 text-white p-2 rounded-full"
                            >
                                <Camera size={18}/>
                            </button>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />
                        </div>

                        <h3 className="font-bold text-xl text-slate-800 mt-4">
                            {form.shopName}
                        </h3>

                        <span className="mt-2 px-3 py-1 rounded-full text-sm bg-emerald-100 text-emerald-700">
                            Đang hoạt động
                        </span>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">

                    <h3 className="font-semibold text-slate-800 mb-4">
                        Bảo mật tài khoản
                    </h3>

                    <button
                        className="w-full border border-slate-200 rounded-2xl py-3 font-medium hover:border-indigo-500 hover:text-indigo-600 transition"
                    >
                        Đổi mật khẩu
                    </button>

                </div>
            </div>
        </div>
    );
}