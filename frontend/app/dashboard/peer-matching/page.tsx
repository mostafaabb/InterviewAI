"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/PageTransition";
import { peerSessions } from "@/lib/api";
import { INTERVIEW_CATEGORIES, INTERVIEW_DIFFICULTIES } from "@/types";
import { Users, Search, Loader2, CheckCircle2, Clock, UserPlus } from "lucide-react";
import toast from "react-hot-toast";

export default function PeerMatchingPage() {
  const [category, setCategory] = useState(INTERVIEW_CATEGORIES[0]);
  const [difficulty, setDifficulty] = useState(INTERVIEW_DIFFICULTIES[1]);
  const [searching, setSearching] = useState(false);
  const [match, setMatch] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadSessions(); }, []);

  const loadSessions = async () => {
    try { setSessions(await peerSessions.getMine()); } catch {}
    finally { setLoading(false); }
  };

  const findMatch = async () => {
    setSearching(true);
    setMatch(null);
    try {
      await peerSessions.create({ category, difficulty });
      let attempts = 0;
      const poll = setInterval(async () => {
        attempts++;
        const found = await peerSessions.findMatch(category, difficulty);
        if (found) { setMatch(found); clearInterval(poll); setSearching(false); toast.success("Match found!"); }
        else if (attempts > 10) { clearInterval(poll); setSearching(false); toast.error("No match found. Try again later."); }
      }, 2000);
    } catch (error: any) { setSearching(false); toast.error(error.message); }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:pl-64">
        <PageTransition>
        <div className="p-6 lg:p-8 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Peer Mock Interviews</h1>
            <p className="text-muted-foreground mt-1">Practice with other candidates in real-time</p>
          </div>

          <Card className="glass border-border/50 mb-6">
            <CardHeader><CardTitle className="flex items-center"><Users className="mr-2 h-5 w-5 text-primary" /> Find a Practice Partner</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {INTERVIEW_CATEGORIES.slice(0, 4).map((cat) => (
                    <button key={cat} onClick={() => setCategory(cat)} className={`p-2 rounded-lg text-xs text-left transition-all border ${category === cat ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>{cat}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Difficulty</label>
                <div className="flex gap-2">
                  {INTERVIEW_DIFFICULTIES.map((d) => (
                    <button key={d} onClick={() => setDifficulty(d)} className={`flex-1 p-2 rounded-lg text-xs text-center transition-all border ${difficulty === d ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>{d}</button>
                  ))}
                </div>
              </div>
              <Button onClick={findMatch} disabled={searching} className="w-full">
                {searching ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Searching for partner...</> : <><Search className="mr-2 h-4 w-4" /> Find Match</>}
              </Button>
            </CardContent>
          </Card>

          {match && (
            <Card className="border-primary/20 mb-6">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-lg font-bold">{match.creator?.name?.charAt(0)}</div>
                  <div>
                    <p className="font-semibold">{match.creator?.name}</p>
                    <p className="text-sm text-muted-foreground">{match.category} • {match.difficulty}</p>
                  </div>
                  <Badge variant="success" className="ml-auto">Matched</Badge>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle className="text-lg">Your Sessions</CardTitle></CardHeader>
            <CardContent>
              {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : sessions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No sessions yet. Find a partner to start!</p>
              ) : (
                <div className="space-y-2">
                  {sessions.map((s: any) => (
                    <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                      <div>
                        <p className="text-sm font-medium">{s.category} • {s.difficulty}</p>
                        <p className="text-xs text-muted-foreground">Partner: {s.partner?.name || s.creator?.name || "Waiting..."}</p>
                      </div>
                      <Badge variant={s.status === "COMPLETED" ? "success" : s.status === "MATCHED" ? "info" : "warning"}>{s.status}</Badge>
                    </div>
                  ))}
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
