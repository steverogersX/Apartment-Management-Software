"use client";

import { Greeting } from "@/components/greeting";
import { ActivityFeed } from "@/components/activityFeed";
import { BillsChart } from "@/components/billsChart";
import { ComplaintStatusChart } from "@/components/complaintStatusChart";
import { ComplaintsTable } from "@/components/complaintsTable";
import { NoticesFeed } from "@/components/noticesFeed";
import { currentFlat } from "@/lib/mockData";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardPage() {
  const { user } = useAuth();
  const firstName = (user?.displayName ?? currentFlat.ownerName).split(" ")[0];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <Greeting
        name={firstName}
        subtitle={`Here's what's happening at Flat ${currentFlat.flatNumber}, ${currentFlat.apartmentName} today.`}
      />

      <ActivityFeed />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <BillsChart />
        <ComplaintStatusChart />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ComplaintsTable compact />
        </div>
        <NoticesFeed />
      </div>
    </div>
  );
}
