"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { PageTransition } from "@/components/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { progress, interviews, challenges } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import {
  Mic, Code, Trophy, TrendingUp, Target, Zap, Star, Activity,
  Clock, ArrowRight, Sparkles, Loader2
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

type Stats = {
  interviewsCompleted: number;
  challengesSolved: number;
  averageScore: number;
  averageCodingScore: number;
  weeklyActivity: number;
  currentStreak: number;
  achievements: any[];
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentInterviews, setRecentInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsData, interviewsData] = await Promise.all([
        progress.getStats(),
        interviews.getAll(),
      ]);
      setStats(statsData);
      setRecentInterviews(interviewsData.slice(0, 5));
    } catch (error: any) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:pl-64">
        <PageTransition>
        <div className="p-6 lg:p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground mt-1">Welcome back, {user?.name}</p>
            </div>
            <Link href="/interviews">
              <Button variant="gradient" className="hidden sm:flex">
                <Mic className="mr-2 h-4 w-4" />
                Start Interview
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={Mic} label="Interviews" value={stats?.interviewsCompleted || 0} color="from-blue-500 to-indigo-500" />
            <StatCard icon={Code} label="Challenges Solved" value={stats?.challengesSolved || 0} color="from-emerald-500 to-teal-500" />
            <StatCard icon={Zap} label="Current Streak" value={`${stats?.currentStreak || 0}d`} color="from-orange-500 to-red-500" />
            <StatCard icon={Target} label="Avg Score" value={`${stats?.averageScore || 0}%`} color="from-purple-500 to-pink-500" />
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Activity className="mr-2 h-5 w-5 text-primary" />
                  Weekly Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1">{stats?.weeklyActivity || 0}</div>
                <p className="text-sm text-muted-foreground">activities this week</p>
                <div className="mt-4 h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-primary to-indigo-500 transition-all" style={{ width: `${Math.min((stats?.weeklyActivity || 0) * 10, 100)}%` }} />
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Star className="mr-2 h-5 w-5 text-yellow-500" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.achievements && stats.achievements.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {stats.achievements.map((ach: any) => (
                      <Badge key={ach.id} variant="success" className="text-xs">
                        {ach.achievement.icon} {ach.achievement.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Complete interviews and challenges to earn achievements.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="glass border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Interviews</CardTitle>
              <Link href="/interviews">
                <Button variant="ghost" size="sm">View All <ArrowRight className="ml-1 h-4 w-4" /></Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentInterviews.length > 0 ? (
                <div className="space-y-3">
                  {recentInterviews.map((interview: any) => (
                    <Link key={interview.id} href={`/interviews/${interview.id}`}>
                      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Mic className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{interview.category}</p>
                            <p className="text-xs text-muted-foreground">{interview.difficulty} • {interview.type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {interview.score ? (
                            <span className="text-sm font-semibold">{Math.round(interview.score)}%</span>
                          ) : (
                            <Badge variant="warning">In Progress</Badge>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Mic className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">No interviews yet</p>
                  <Link href="/interviews">
                    <Button variant="outline" size="sm" className="mt-3">Start your first interview</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        </PageTransition>
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
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
