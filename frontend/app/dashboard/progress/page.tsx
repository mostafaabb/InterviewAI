"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { PageTransition } from "@/components/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { progress } from "@/lib/api";
import { Loader2, TrendingUp, BarChart3, Radar } from "lucide-react";
import toast from "react-hot-toast";

export default function ProgressPage() {
  const [stats, setStats] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsData, skillsData] = await Promise.all([
        progress.getStats(),
        progress.getSkills(),
      ]);
      setStats(statsData);
      setSkills(skillsData);
    } catch (error: any) {
      toast.error("Failed to load progress");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:pl-64">
        <PageTransition>
        <div className="p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Progress & Analytics</h1>
            <p className="text-muted-foreground mt-1">Track your improvement over time</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <BarChart3 className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-3xl font-bold">{stats?.averageScore || 0}%</div>
                <p className="text-sm text-muted-foreground">Avg Interview Score</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <div className="text-3xl font-bold">{stats?.averageCodingScore || 0}%</div>
                <p className="text-sm text-muted-foreground">Avg Coding Score</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Radar className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <div className="text-3xl font-bold">{stats?.currentStreak || 0}d</div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle>Skill Levels</CardTitle></CardHeader>
            <CardContent>
              {skills.length > 0 ? (
                <div className="space-y-4">
                  {skills.map((skill: any) => (
                    <div key={skill.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{skill.name}</span>
                        <span className="text-muted-foreground">{skill.level}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-primary to-indigo-500" style={{ width: `${skill.level}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">Complete interviews to see your skill levels.</p>
              )}
            </CardContent>
          </Card>
        </div>
        </PageTransition>
      </main>
    </div>
  );
}
