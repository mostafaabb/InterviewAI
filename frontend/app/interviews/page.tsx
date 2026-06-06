"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { interviews } from "@/lib/api";
import { INTERVIEW_CATEGORIES, INTERVIEW_DIFFICULTIES, INTERVIEW_TYPES, INTERVIEW_STYLES } from "@/types";
import { Mic, Sparkles, ArrowRight, Loader2, Clock, Zap } from "lucide-react";
import toast from "react-hot-toast";

export default function InterviewsPage() {
  const router = useRouter();
  const [category, setCategory] = useState(INTERVIEW_CATEGORIES[0]);
  const [difficulty, setDifficulty] = useState(INTERVIEW_DIFFICULTIES[1]);
  const [type, setType] = useState(INTERVIEW_TYPES[0]);
  const [style, setStyle] = useState("faang");
  const [timed, setTimed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    try {
      const data = await interviews.start({ category, difficulty, type, style, timed });
      router.push(`/interviews/${data.id}`);
    } catch (error: any) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:pl-64">
        <PageTransition>
        <div className="p-6 lg:p-8 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">AI Mock Interviews</h1>
            <p className="text-muted-foreground mt-1">Choose your interview parameters and start practicing</p>
          </div>

          <Card className="glass border-border/50 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="mr-2 h-5 w-5 text-primary" />
                Interview Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-3 block">Role / Category</label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {INTERVIEW_CATEGORIES.map((cat) => (
                    <button key={cat} onClick={() => setCategory(cat)}
                      className={`p-3 rounded-lg text-sm text-left transition-all border ${category === cat ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"}`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-3 block">Difficulty</label>
                <div className="flex gap-2">
                  {INTERVIEW_DIFFICULTIES.map((diff) => (
                    <button key={diff} onClick={() => setDifficulty(diff)}
                      className={`flex-1 p-3 rounded-lg text-sm text-center transition-all border ${difficulty === diff ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"}`}>
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-3 block">Interview Type</label>
                <div className="flex gap-2">
                  {INTERVIEW_TYPES.map((t) => (
                    <button key={t} onClick={() => setType(t)}
                      className={`flex-1 p-3 rounded-lg text-sm text-center transition-all border ${type === t ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-3 block">Interviewer Style</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {INTERVIEW_STYLES.map((s) => (
                    <button key={s.value} onClick={() => setStyle(s.value)}
                      className={`p-3 rounded-lg text-sm text-left transition-all border ${style === s.value ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"}`}>
                      <p className="font-medium mb-1">{s.label}</p>
                      <p className="text-xs text-muted-foreground">{s.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Timed Pressure Mode</p>
                    <p className="text-xs text-muted-foreground">45-minute countdown with auto-submit when time runs out</p>
                  </div>
                </div>
                <button
                  onClick={() => setTimed(!timed)}
                  className={`relative w-12 h-6 rounded-full transition-all ${timed ? "bg-primary" : "bg-muted"}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${timed ? "left-6" : "left-0.5"}`} />
                </button>
              </div>

              <Button onClick={handleStart} disabled={loading} className="w-full" size="lg">
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Starting Interview...</>
                ) : (
                  <><Mic className="mr-2 h-4 w-4" /> Start Interview <ArrowRight className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
        </PageTransition>
      </main>
    </div>
  );
}
