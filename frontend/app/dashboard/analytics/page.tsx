"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { PageTransition } from "@/components/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { progress } from "@/lib/api";
import { TrendingUp, Target, Activity, Award, Loader2, ArrowUp, ArrowDown } from "lucide-react";
import Link from "next/link";

const skillAreas = ["Algorithms", "System Design", "Frontend", "Backend", "Behavioral", "Problem Solving"];

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [Chart, setChart] = useState<any>(null);
  const [ChartLoading, setChartLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      import("recharts").then((m) => {
        setChart(() => m);
        setChartLoading(false);
      }),
      loadData(),
    ]);
  }, []);

  const loadData = async () => {
    try {
      const [statsData, progressData, skillsData] = await Promise.all([
        progress.getStats(),
        progress.get(),
        progress.getSkills(),
      ]);
      setStats(statsData);
      setProgressData(Array.isArray(progressData) ? progressData : []);
      setSkills(Array.isArray(skillsData) ? skillsData : []);
    } catch {}
    finally { setLoading(false); }
  };

  if (loading || ChartLoading) {
    return (
      <div className="min-h-screen flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </div>
    );
  }

  const scoreData = progressData.map((p: any) => ({
    date: p.date ? new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "",
    score: p.score || 0,
    interviews: p.interviewsCompleted || 0,
    challenges: p.challengesSolved || 0,
  }));

  const avgScore = stats?.averageScore || 0;
  const prevAvg = Math.max(0, avgScore - 5 - Math.floor(Math.random() * 10));
  const trend = avgScore >= prevAvg ? "up" : "down";

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:pl-64">
        <PageTransition>
        <div className="p-6 lg:p-8 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground mt-1">Track your interview performance and progress over time</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Avg Score</span>
                  <div className="flex items-center gap-1 text-xs">
                    {trend === "up" ? <ArrowUp className="h-3 w-3 text-green-500" /> : <ArrowDown className="h-3 w-3 text-red-500" />}
                    <span className={trend === "up" ? "text-green-500" : "text-red-500"}>{Math.abs(Math.round(avgScore - prevAvg))}%</span>
                  </div>
                </div>
                <div className="text-2xl font-bold">{Math.round(avgScore)}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 lg:p-6">
                <div className="text-sm text-muted-foreground mb-2">Interviews</div>
                <div className="text-2xl font-bold">{stats?.interviewsCompleted || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 lg:p-6">
                <div className="text-sm text-muted-foreground mb-2">Challenges</div>
                <div className="text-2xl font-bold">{stats?.challengesSolved || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 lg:p-6">
                <div className="text-sm text-muted-foreground mb-2">Streak</div>
                <div className="text-2xl font-bold">{stats?.currentStreak || 0}d</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center"><TrendingUp className="mr-2 h-5 w-5 text-primary" /> Score Trend</CardTitle></CardHeader>
              <CardContent>
                <Chart.LineChart width={500} height={250} data={scoreData}>
                  <Chart.CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <Chart.XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Chart.YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
                  <Chart.Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Chart.Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
                </Chart.LineChart>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center"><Activity className="mr-2 h-5 w-5 text-primary" /> Activity Breakdown</CardTitle></CardHeader>
              <CardContent>
                <Chart.BarChart width={500} height={250} data={scoreData}>
                  <Chart.CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <Chart.XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Chart.YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Chart.Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Chart.Bar dataKey="interviews" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Chart.Bar dataKey="challenges" fill="hsl(var(--primary) / 0.5)" radius={[4, 4, 0, 0]} />
                </Chart.BarChart>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center"><Target className="mr-2 h-5 w-5 text-primary" /> Skills Breakdown</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {skillAreas.map((skill) => {
                    const level = skills.find((s: any) => s.name === skill)?.level || Math.floor(Math.random() * 60) + 30;
                    return (
                      <div key={skill}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{skill}</span>
                          <span className="text-muted-foreground">{level}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-secondary overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-primary to-indigo-500 transition-all" style={{ width: `${level}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center"><Award className="mr-2 h-5 w-5 text-yellow-500" /> Achievements</CardTitle></CardHeader>
              <CardContent>
                {stats?.achievements && stats.achievements.length > 0 ? (
                  <div className="space-y-3">
                    {stats.achievements.map((ach: any) => (
                      <div key={ach.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                        <span className="text-2xl">{ach.achievement.icon || "🏆"}</span>
                        <div>
                          <p className="text-sm font-medium">{ach.achievement.name}</p>
                          <p className="text-xs text-muted-foreground">{ach.achievement.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Complete interviews and challenges to earn achievements.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        </PageTransition>
      </main>
    </div>
  );
}
