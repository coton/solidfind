"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

export default function AdminReports() {
  const reports = useQuery(api.reports.list);
  const updateStatus = useMutation(api.reports.updateStatus);

  const handleUpdateStatus = async (id: Id<"reports">, status: "reviewed" | "dismissed") => {
    await updateStatus({ id, status });
  };

  const pending = reports?.filter((r) => r.status === "pending") ?? [];
  const handled = reports?.filter((r) => r.status !== "pending") ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-bold text-[#333] tracking-[0.48px]">Reports</h1>
        <span className="text-[12px] text-[#333]/50">{pending.length} pending</span>
      </div>

      {/* Pending Reports */}
      <div className="mb-8">
        <h2 className="text-[14px] font-semibold text-[#333] mb-3">Pending</h2>
        {reports === undefined ? (
          <p className="text-[12px] text-[#333]/50">Loading...</p>
        ) : pending.length === 0 ? (
          <div className="bg-white rounded-[8px] border border-[#e4e4e4] p-6 text-center">
            <p className="text-[12px] text-[#333]/50">No pending reports.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((report) => (
              <div
                key={report._id}
                className="bg-white rounded-[8px] border border-[#e4e4e4] p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-[12px] font-medium text-[#333] mb-1">
                      {report.companyName}
                    </p>
                    <p className="text-[11px] text-[#333]/70 leading-[18px] mb-2">
                      {report.text}
                    </p>
                    <p className="text-[9px] text-[#333]/40">
                      {new Date(report.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleUpdateStatus(report._id, "reviewed")}
                      className="text-[10px] font-medium px-3 py-1.5 rounded-full bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 transition-colors"
                    >
                      Mark Reviewed
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(report._id, "dismissed")}
                      className="text-[10px] font-medium px-3 py-1.5 rounded-full bg-[#f5f5f5] text-[#333]/60 border border-[#e4e4e4] hover:bg-[#e4e4e4] transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Handled Reports */}
      {handled.length > 0 && (
        <div>
          <h2 className="text-[14px] font-semibold text-[#333] mb-3">Handled</h2>
          <div className="space-y-2">
            {handled.map((report) => (
              <div
                key={report._id}
                className="bg-white rounded-[8px] border border-[#e4e4e4] p-4 opacity-60"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[12px] font-medium text-[#333] mb-1">
                      {report.companyName}
                    </p>
                    <p className="text-[11px] text-[#333]/70 leading-[18px] mb-2">
                      {report.text}
                    </p>
                    <p className="text-[9px] text-[#333]/40">
                      {new Date(report.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full ${
                    report.status === "reviewed"
                      ? "text-green-600 bg-green-50"
                      : "text-[#333]/50 bg-[#f0f0f0]"
                  }`}>
                    {report.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
