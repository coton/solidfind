"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import Pagination, { PAGE_SIZE } from "../components/Pagination";

type Tab = "all" | "pending" | "handled";

export default function AdminReports() {
  const reports = useQuery(api.reports.list);
  const updateStatus = useMutation(api.reports.updateStatus);

  const [tab, setTab] = useState<Tab>("all");
  const [currentPage, setCurrentPage] = useState(0);

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "admin";

  const handleUpdateStatus = async (id: Id<"reports">, status: "reviewed" | "dismissed") => {
    await updateStatus({ id, status, adminEmail });
  };

  const filtered = reports?.filter((r) => {
    if (tab === "pending") return r.status === "pending";
    if (tab === "handled") return r.status !== "pending";
    return true;
  });

  const totalItems = filtered?.length ?? 0;
  const paginated = filtered?.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
  const pendingCount = reports?.filter((r) => r.status === "pending").length ?? 0;

  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "handled", label: "Handled" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-bold text-[#333] tracking-[0.48px]">Reports</h1>
        <span className="text-[12px] text-[#333]/50">{pendingCount} pending</span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-1 bg-white border border-[#e4e4e4] rounded-[6px] p-0.5">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setCurrentPage(0); }}
              className={`px-3 py-1.5 rounded-[4px] text-[11px] font-medium transition-colors ${
                tab === t.key
                  ? "bg-[#333] text-white"
                  : "text-[#333]/60 hover:text-[#333]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reports list */}
      <div className="space-y-3">
        {paginated === undefined ? (
          <div className="bg-white rounded-[8px] border border-[#e4e4e4] p-6 text-center">
            <p className="text-[12px] text-[#333]/50">Loading...</p>
          </div>
        ) : paginated.length === 0 ? (
          <div className="bg-white rounded-[8px] border border-[#e4e4e4] p-6 text-center">
            <p className="text-[12px] text-[#333]/50">No reports found.</p>
          </div>
        ) : (
          paginated.map((report) => (
            <div
              key={report._id}
              className={`bg-white rounded-[8px] border border-[#e4e4e4] p-4 ${
                report.status !== "pending" ? "opacity-60" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-[#333] mb-1">
                    {report.companyName}
                  </p>
                  <p className="text-[11px] text-[#333]/70 leading-[18px] mb-2">
                    {report.text}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-[9px] text-[#333]/40">
                      {new Date(report.createdAt).toLocaleString()}
                    </p>
                    {report.status !== "pending" && (
                      <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full ${
                        report.status === "reviewed"
                          ? "text-green-600 bg-green-50"
                          : "text-[#333]/50 bg-[#f0f0f0]"
                      }`}>
                        {report.status}
                      </span>
                    )}
                  </div>
                </div>
                {report.status === "pending" && (
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
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
