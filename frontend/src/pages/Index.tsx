import { DashboardLayout } from "@/components/DashboardLayout";
import { TopBar } from "@/components/TopBar";
import { ExamsBanner } from "@/components/ExamsBanner";
import { AnnouncementsCard } from "@/components/AnnouncementsCard";
import { WhatsDueCard } from "@/components/WhatsDueCard";
import { requireAuth } from "@/components/RequireAuth";

const Dashboard = () => (
  <DashboardLayout>
    <TopBar userName="Mohamed Gomaa" />
    <main className="p-8">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <ExamsBanner />
          <AnnouncementsCard />
        </div>
        <div className="xl:col-span-1">
          <WhatsDueCard />
        </div>
      </div>
    </main>
  </DashboardLayout>
);

const ProtectedDashboard = requireAuth(Dashboard);

const Index = () => <ProtectedDashboard />;

export default Index;
