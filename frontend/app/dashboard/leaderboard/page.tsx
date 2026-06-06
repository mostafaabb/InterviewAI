"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/PageTransition";
import { leaderboard } from "@/lib/api";
import { Medal, Trophy, Loader2, TrendingUp, Award } from "lucide-react";

export default function LeaderboardPage() {
  const [data, setData] = useState<any>(null);
  const [weekly, setWeekly] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [lb, w] = await Promise.all([leaderboard.get(), leaderboard.getWeekly()]);
      setData(lb);
      setWeekly(w);
    } catch {}
    finally { setLoading(false); }
  };

  if (loading) return <div className="min-h-screen flex"><Sidebar /><main className="lg:pl-64 flex-1 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></main></div>;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:pl-64">
        <PageTransition>
        <div className="p-6 lg:p-8 max-w-5xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Leaderboard</h1>
            <p className="text-muted-foreground mt-1">Top performers on coding challenges</p>
          </div>

          {data?.userRank && (
            <Card className="border-primary/20 mb-6">
              <CardContent className="p-4 flex items-center gap-3">
                <Award className="h-6 w-6 text-yellow-500" />
                <p className="text-sm">You're ranked <strong>#{data.userRank}</strong> on the leaderboard</p>
              </CardContent>
            </Card>
          )}

          <div className="grid lg:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center"><Medal className="mr-2 h-5 w-5 text-yellow-500" /> Top 3</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data?.leaderboard?.slice(0, 3).map((u: any, i: number) => (
                    <div key={u.userId} className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${i === 0 ? "bg-yellow-500" : i === 1 ? "bg-gray-400" : "bg-orange-700"}`}>{i + 1}</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.challengesSolved} challenges</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{u.totalScore}</p>
                        <p className="text-xs text-muted-foreground">pts</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center"><Trophy className="mr-2 h-5 w-5 text-primary" /> Weekly Rankings</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {weekly.slice(0, 5).map((w: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-muted">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground">#{i + 1}</span>
                        <span>{w.name}</span>
                      </div>
                      <Badge variant="info">{w.score}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center"><TrendingUp className="mr-2 h-5 w-5 text-emerald-500" /> Stats</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div><p className="text-2xl font-bold">{data?.leaderboard?.length || 0}</p><p className="text-xs text-muted-foreground">Total Participants</p></div>
                  <div><p className="text-2xl font-bold">{data?.leaderboard?.reduce((a: number, u: any) => a + u.challengesSolved, 0) || 0}</p><p className="text-xs text-muted-foreground">Challenges Solved</p></div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-lg">Full Rankings</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-1">
                {data?.leaderboard?.map((u: any, i: number) => (
                  <div key={u.userId} className="flex items-center justify-between p-2.5 rounded-lg text-sm hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-xs font-bold text-muted-foreground">#{i + 1}</span>
                      <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">{u.name?.charAt(0)}</div>
                      <span className="font-medium">{u.name}</span>
                      <Badge variant="secondary" className="text-xs">{u.challengesSolved} solved</Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-muted-foreground">Best: {u.bestScore}%</span>
                      <span className="font-bold text-sm">{u.totalScore}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        </PageTransition>
      </main>
    </div>
  );
}
