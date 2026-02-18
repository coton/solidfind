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

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="text-[20px] font-bold text-[#333]">{value}</p>
      <p className="text-[10px] text-[#333]/50 mt-0.5">{label}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const companies = useQuery(api.companies.listAll);
  const users = useQuery(api.users.listAll);
  const reviews = useQuery(api.reviews.listAll);
  const reports = useQuery(api.reports.list);

  const totalCompanies = companies?.length ?? 0;
  const totalUsers = users?.length ?? 0;
  const totalReviews = reviews?.length ?? 0;
  const pendingReports = reports?.filter((r) => r.status === "pending").length ?? 0;

  // Calculate month start timestamp
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const newCompaniesThisMonth = companies?.filter((c) => c.createdAt >= monthStart).length ?? 0;
  const newUsersThisMonth = users?.filter((u) => u.createdAt >= monthStart).length ?? 0;
  const newReviewsThisMonth = reviews?.filter((r) => r.createdAt >= monthStart).length ?? 0;

  return (
    <div>
      <h1 className="text-[24px] font-bold text-[#333] tracking-[0.48px] mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard label="Total Companies" value={totalCompanies} />
        <StatCard label="Total Users" value={totalUsers} />
        <StatCard label="Total Reviews" value={totalReviews} />
        <StatCard label="Pending Reports" value={pendingReports} />
      </div>

      {/* Monthly Trends */}
      <div className="bg-white rounded-[8px] border border-[#e4e4e4] p-5 mb-4">
        <h2 className="text-[11px] font-semibold text-[#333]/50 tracking-[0.22px] mb-4">THIS MONTH</h2>
        <div className="grid grid-cols-3 gap-4">
          <MiniStat label="New Companies" value={newCompaniesThisMonth} />
          <MiniStat label="New Users" value={newUsersThisMonth} />
          <MiniStat label="New Reviews" value={newReviewsThisMonth} />
        </div>
      </div>

      {/* Export Buttons */}
      <div className="bg-white rounded-[8px] border border-[#e4e4e4] p-5 mb-4">
        <h2 className="text-[11px] font-semibold text-[#333]/50 tracking-[0.22px] mb-3">EXPORT DATA</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => window.open("/api/admin/export?type=companies")}
            className="text-[11px] font-medium px-4 py-2 rounded-[6px] border border-[#e4e4e4] hover:bg-[#333] hover:text-white hover:border-[#333] transition-colors"
          >
            Export Companies
          </button>
          <button
            onClick={() => window.open("/api/admin/export?type=users")}
            className="text-[11px] font-medium px-4 py-2 rounded-[6px] border border-[#e4e4e4] hover:bg-[#333] hover:text-white hover:border-[#333] transition-colors"
          >
            Export Users
          </button>
          <button
            onClick={() => window.open("/api/admin/export?type=reviews")}
            className="text-[11px] font-medium px-4 py-2 rounded-[6px] border border-[#e4e4e4] hover:bg-[#333] hover:text-white hover:border-[#333] transition-colors"
          >
            Export Reviews
          </button>
        </div>
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
                  {company.rating ? (
                    <span className="text-[11px] text-amber-500 font-medium">
                      ★ {company.rating.toFixed(1)}
                    </span>
                  ) : null}
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
