"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Pagination, { PAGE_SIZE } from "../components/Pagination";

const ACTION_LABELS: Record<string, string> = {
  delete_company: "Delete Company",
  delete_review: "Delete Review",
  flag_review_spam: "Flag Review as Spam",
  unflag_review: "Unflag Review",
  report_reviewed: "Mark Report Reviewed",
  report_dismissed: "Dismiss Report",
};

export default function AdminAuditLog() {
  const logs = useQuery(api.auditLogs.list);
  const [currentPage, setCurrentPage] = useState(0);

  const totalItems = logs?.length ?? 0;
  const paginated = logs?.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-bold text-[#333] tracking-[0.48px]">Audit Log</h1>
        <span className="text-[12px] text-[#333]/50">{totalItems} entries</span>
      </div>

      <div className="bg-white rounded-[8px] border border-[#e4e4e4] overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-[#e4e4e4] bg-[#fafafa]">
              <th className="text-left text-[10px] font-semibold text-[#333]/60 tracking-[0.2px] px-4 py-3">Time</th>
              <th className="text-left text-[10px] font-semibold text-[#333]/60 tracking-[0.2px] px-4 py-3">Admin</th>
              <th className="text-left text-[10px] font-semibold text-[#333]/60 tracking-[0.2px] px-4 py-3">Action</th>
              <th className="text-left text-[10px] font-semibold text-[#333]/60 tracking-[0.2px] px-4 py-3">Target</th>
              <th className="text-left text-[10px] font-semibold text-[#333]/60 tracking-[0.2px] px-4 py-3">Details</th>
            </tr>
          </thead>
          <tbody>
            {paginated === undefined ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[12px] text-[#333]/50">
                  Loading...
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[12px] text-[#333]/50">
                  No audit log entries yet.
                </td>
              </tr>
            ) : (
              paginated.map((log) => (
                <tr key={log._id} className="border-b border-[#f0f0f0] hover:bg-[#fafafa]">
                  <td className="px-4 py-3 text-[11px] text-[#333]/50 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-[11px] text-[#333]/70">
                    {log.adminEmail}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#333]/5 text-[#333]">
                      {ACTION_LABELS[log.action] ?? log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-[#333]/60 capitalize">
                    {log.targetType}
                    {log.targetId && (
                      <span className="text-[9px] text-[#333]/30 ml-1">
                        {log.targetId.slice(0, 10)}...
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[11px] text-[#333]/50 max-w-[200px] truncate">
                    {log.details ?? "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
