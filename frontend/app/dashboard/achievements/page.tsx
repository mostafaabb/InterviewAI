"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { PageTransition } from "@/components/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { progress } from "@/lib/api";
import { Trophy, Loader2, Lock, Unlock } from "lucide-react";
import toast from "react-hot-toast";

export default function AchievementsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const data = await progress.getStats();
      setStats(data);
    } catch (error: any) {
      toast.error("Failed to load achievements");
    } finally {
      setLoading(false);
    }
  };

  const allAchievements = [
    { name: "First Interview", description: "Complete your first mock interview", icon: "🎯", locked: !stats || stats.interviewsCompleted < 1 },
    { name: "7 Day Streak", description: "Practice for 7 days in a row", icon: "🔥", locked: !stats || stats.currentStreak < 7 },
    { name: "50 Challenges Solved", description: "Solve 50 coding challenges", icon: "💻", locked: !stats || stats.challengesSolved < 50 },
    { name: "Top Performer", description: "Score 90+ on an interview", icon: "⭐", locked: !stats || (stats.averageScore || 0) < 90 },
    { name: "Quick Learner", description: "Complete 3 interviews in a day", icon: "📚", locked: true },
    { name: "Perfect Score", description: "Get 100% on a coding challenge", icon: "🏆", locked: !stats || (stats.averageCodingScore || 0) < 100 },
  ];

  if (loading) return (
    <div className="min-h-screen flex"><Sidebar /><div className="flex-1 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:pl-64">
        <PageTransition>
        <div className="p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Achievements</h1>
            <p className="text-muted-foreground mt-1">Earn badges by completing milestones</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allAchievements.map((ach) => (
              <Card key={ach.name} className={`glass border-border/50 ${ach.locked ? "opacity-50" : ""}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl">{ach.icon}</span>
                    {ach.locked ? <Lock className="h-4 w-4 text-muted-foreground" /> : <Unlock className="h-4 w-4 text-green-500" />}
                  </div>
                  <h3 className="font-semibold mb-1">{ach.name}</h3>
                  <p className="text-sm text-muted-foreground">{ach.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        </PageTransition>
      </main>
    </div>
  );
}
