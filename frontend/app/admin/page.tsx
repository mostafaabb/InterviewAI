"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { PageTransition } from "@/components/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { admin } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Users, DollarSign, Activity, TrendingUp, BarChart3, Loader2, UserCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type AdminData = {
  totalUsers: number;
  totalInterviews: number;
  totalChallenges: number;
  totalSubmissions: number;
  activeSubscriptions: number;
  estimatedRevenue: number;
  newUsers: number;
  proCount: number;
  premiumCount: number;
};

export default function AdminPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const dashboardData = await admin.getDashboard();
      setData(dashboardData);
    } catch (error: any) {
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex"><Sidebar /><div className="flex-1 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></div>;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:pl-64">
        <PageTransition>
        <div className="p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Platform overview and management</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <AdminCard icon={Users} label="Total Users" value={data?.totalUsers || 0} color="from-blue-500 to-indigo-500" />
            <AdminCard icon={UserCheck} label="Active Subs" value={data?.activeSubscriptions || 0} color="from-emerald-500 to-teal-500" />
            <AdminCard icon={DollarSign} label="Revenue" value={`$${data?.estimatedRevenue || 0}`} color="from-green-500 to-emerald-500" />
            <AdminCard icon={TrendingUp} label="New Users (30d)" value={data?.newUsers || 0} color="from-purple-500 to-pink-500" />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-lg">Quick Stats</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <StatRow label="Total Interviews" value={data?.totalInterviews || 0} />
                <StatRow label="Total Challenges" value={data?.totalChallenges || 0} />
                <StatRow label="Total Submissions" value={data?.totalSubmissions || 0} />
                <StatRow label="Pro Users" value={data?.proCount || 0} />
                <StatRow label="Premium Users" value={data?.premiumCount || 0} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">Plan Distribution</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <PlanBar label="Free" count={Math.max(0, (data?.totalUsers || 0) - (data?.proCount || 0) - (data?.premiumCount || 0))} total={data?.totalUsers || 1} color="bg-muted-foreground" />
                  <PlanBar label="Pro" count={data?.proCount || 0} total={data?.totalUsers || 1} color="bg-blue-500" />
                  <PlanBar label="Premium" count={data?.premiumCount || 0} total={data?.totalUsers || 1} color="bg-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        </PageTransition>
      </main>
    </div>
  );
}

function AdminCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <Card className="glass border-border/50">
      <CardContent className="p-4 lg:p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground">{label}</span>
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
            <Icon className="h-4 w-4 text-white" />
          </div>
        </div>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function PlanBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const percentage = (count / total) * 100;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span className="text-muted-foreground">{count}</span>
      </div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
