"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-[8px] border border-[#e4e4e4] p-5">
      <p className="text-[11px] text-[#333]/50 font-medium tracking-[0.22px] mb-1">{label}</p>
      <p className="text-[28px] font-bold text-[#333]">{value}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const companies = useQuery(api.companies.listAll);
  const users = useQuery(api.users.listAll);
  const reports = useQuery(api.reports.list);

  const totalCompanies = companies?.length ?? 0;
  const totalUsers = users?.length ?? 0;
  const totalReviews = companies?.reduce((sum, c) => sum + (c.reviewCount ?? 0), 0) ?? 0;
  const pendingReports = reports?.filter((r) => r.status === "pending").length ?? 0;

  return (
    <div>
      <h1 className="text-[24px] font-bold text-[#333] tracking-[0.48px] mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Companies" value={totalCompanies} />
        <StatCard label="Total Users" value={totalUsers} />
        <StatCard label="Total Reviews" value={totalReviews} />
        <StatCard label="Pending Reports" value={pendingReports} />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-[8px] border border-[#e4e4e4] p-5">
        <h2 className="text-[14px] font-semibold text-[#333] mb-4">Recent Companies</h2>
        {companies === undefined ? (
          <p className="text-[12px] text-[#333]/50">Loading...</p>
        ) : companies.length === 0 ? (
          <p className="text-[12px] text-[#333]/50">No companies yet.</p>
        ) : (
          <div className="space-y-3">
            {companies.slice(0, 10).map((company) => (
              <div
                key={company._id}
                className="flex items-center justify-between py-2 border-b border-[#f0f0f0] last:border-0"
              >
                <div>
                  <p className="text-[12px] font-medium text-[#333]">{company.name}</p>
                  <p className="text-[10px] text-[#333]/50">
                    {company.category} &middot; {company.ownerEmail}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {company.isPro && (
                    <span className="text-[9px] font-medium text-[#f14110] bg-[#f14110]/10 px-2 py-0.5 rounded-full">
                      PRO
                    </span>
                  )}
                  <span className="text-[10px] text-[#333]/40">
                    {new Date(company.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
