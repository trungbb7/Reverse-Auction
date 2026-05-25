import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Loader2, ShieldAlert, TriangleAlert } from "lucide-react";
import toast from "react-hot-toast";
import { complaintService } from "@/services/complaintService";
import type { Complaint } from "@/types/complaint";

const statusMeta: Record<
  Complaint["status"],
  { label: string; className: string }
> = {
  PENDING: { label: "PENDING", className: "bg-amber-100 text-amber-700" },
  RECEIVED: { label: "RECEIVED", className: "bg-blue-100 text-blue-700" },
  PROCESSING: {
    label: "PROCESSING",
    className: "bg-violet-100 text-violet-700",
  },
  RESOLVED: { label: "RESOLVED", className: "bg-emerald-100 text-emerald-700" },
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export default function AdminComplaintManagement() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Complaint["status"] | "ALL">("ALL");

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const data = await complaintService.fetchAllComplaints();
      setComplaints(data);
    } catch (error) {
      console.error(error);
      toast.error("Không tải được danh sách khiếu nại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadComplaints();
  }, []);

  const filteredComplaints = useMemo(() => {
    if (filter === "ALL") return complaints;
    return complaints.filter((item) => item.status === filter);
  }, [complaints, filter]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_32%),linear-gradient(135deg,_#0f172a_0%,_#1e293b_55%,_#334155_100%)] px-6 py-6 text-white">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-200">
                  <ShieldAlert size={14} />
                  Admin Complaint
                </div>
                <h1 className="mt-3 text-3xl font-black tracking-tight">
                  Quản lý khiếu nại
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-300">
                  Xem tất cả khiếu nại, mở chi tiết và cập nhật trạng thái xử lý.
                </p>
              </div>
              <button
                type="button"
                onClick={() => void loadComplaints()}
                className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Làm mới
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              {(["ALL", "PENDING", "RECEIVED", "PROCESSING", "RESOLVED"] as const).map(
                (value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFilter(value)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      filter === value
                        ? "bg-slate-900 text-white"
                        : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {value}
                  </button>
                ),
              )}
            </div>

            {loading ? (
              <div className="flex min-h-[360px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : filteredComplaints.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center">
                <TriangleAlert className="mx-auto mb-3 text-slate-300" size={30} />
                <p className="text-sm font-semibold text-slate-500">
                  Không có khiếu nại nào phù hợp
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
                <div className="grid grid-cols-[120px_1fr_120px_180px] gap-4 border-b border-slate-100 bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  <span>ID</span>
                  <span>Nội dung</span>
                  <span>Trạng thái</span>
                  <span>Ngày tạo</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {filteredComplaints.map((complaint) => {
                    const meta = statusMeta[complaint.status];
                    return (
                      <button
                        key={complaint.complaintId}
                        type="button"
                        onClick={() => navigate(`/admin/complaints/${complaint.complaintId}`)}
                        className="grid w-full grid-cols-[120px_1fr_120px_180px] gap-4 px-4 py-4 text-left transition hover:bg-slate-50"
                      >
                        <span className="text-sm font-semibold text-slate-900">
                          #{complaint.complaintId}
                        </span>
                        <span className="line-clamp-2 text-sm text-slate-600">
                          {complaint.content}
                        </span>
                        <span>
                          <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${meta.className}`}>
                            {meta.label}
                          </span>
                        </span>
                        <span className="text-sm text-slate-500">
                          {formatDate(complaint.createdAt)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
