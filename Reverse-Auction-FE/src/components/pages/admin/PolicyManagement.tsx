import { useState, useEffect } from "react";
import * as policyService from "@/services/policyService";
import type { Policy, PolicyRequest } from "@/services/policyService";
import { Plus, Edit2, Trash2, Search, X, Check } from "lucide-react";
import { toast } from "react-hot-toast";

export default function PolicyManagement() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<PolicyRequest>({ title: "", content: "", type: "TERMS_OF_SERVICE" });

  const fetchPolicies = async () => {
    try {
      const data = await policyService.getAllPolicies();
      setPolicies(data);
    } catch (error) {
      console.error("Failed to fetch policies", error);
      toast.error("Không thể tải danh sách chính sách");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ title: "", content: "", type: "TERMS_OF_SERVICE" });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (policy: Policy) => {
    setEditingId(policy.id);
    setFormData({ title: policy.title, content: policy.content, type: policy.type });
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({ title: "", content: "", type: "TERMS_OF_SERVICE" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim() || !formData.type.trim()) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      if (editingId) {
        await policyService.updatePolicy(editingId, formData);
        toast.success("Cập nhật chính sách thành công");
      } else {
        await policyService.createPolicy(formData);
        toast.success("Thêm chính sách mới thành công");
      }
      handleCloseForm();
      fetchPolicies();
    } catch (error) {
      console.error("Failed to save policy", error);
      toast.error("Không thể lưu chính sách");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa chính sách này?")) {
      try {
        await policyService.deletePolicy(id);
        toast.success("Đã xóa chính sách thành công");
        fetchPolicies();
      } catch (error) {
        console.error("Failed to delete policy", error);
        toast.error("Không thể xóa chính sách");
      }
    }
  };

  const filteredPolicies = policies.filter(
    (policy) =>
      policy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý chính sách</h1>
          <p className="text-slate-500">Thêm, sửa, xóa các chính sách của hệ thống</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-sm"
        >
          <Plus size={20} />
          Thêm chính sách
        </button>
      </div>

      {/* Policy Form (Overlay/Modal) */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">
                {editingId ? "Sửa chính sách" : "Thêm chính sách mới"}
              </h2>
              <button onClick={handleCloseForm} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tiêu đề</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="VD: Điều khoản sử dụng..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Loại chính sách</label>
                <select
                  required
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="TERMS_OF_SERVICE">Điều khoản sử dụng (TERMS_OF_SERVICE)</option>
                  <option value="PRIVACY_POLICY">Chính sách bảo mật (PRIVACY_POLICY)</option>
                  <option value="RETURN_POLICY">Chính sách đổi trả (RETURN_POLICY)</option>
                  <option value="PAYMENT_POLICY">Chính sách thanh toán (PAYMENT_POLICY)</option>
                  <option value="OTHER">Khác (OTHER)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nội dung</label>
                <textarea
                  required
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 min-h-[300px]"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Nhập nội dung chính sách (hỗ trợ văn bản hoặc HTML)..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-all"
                >
                  <Check size={20} />
                  {editingId ? "Cập nhật" : "Lưu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm chính sách theo tiêu đề hoặc loại..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-sm font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Tiêu đề</th>
                <th className="px-6 py-4">Loại</th>
                <th className="px-6 py-4">Ngày tạo</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredPolicies.map((policy) => (
                <tr key={policy.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-slate-500 font-mono text-sm">#{policy.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{policy.title}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium">
                      {policy.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(policy.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(policy)}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                        title="Sửa"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(policy.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Xóa"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPolicies.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                    Không tìm thấy chính sách nào phù hợp
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
