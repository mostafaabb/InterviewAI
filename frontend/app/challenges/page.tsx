"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { challenges } from "@/lib/api";
import { CHALLENGE_CATEGORIES, DIFFICULTIES } from "@/types";
import { Code, Filter, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function ChallengesPage() {
  const [challengeList, setChallengeList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");

  useEffect(() => {
    loadChallenges();
  }, [category, difficulty]);

  const loadChallenges = async () => {
    setLoading(true);
    try {
      const data = await challenges.getAll({ category: category || undefined, difficulty: difficulty || undefined });
      setChallengeList(data);
    } catch (error: any) {
      toast.error("Failed to load challenges");
    } finally {
      setLoading(false);
    }
  };

  const difficultyColor = (diff: string) => {
    switch (diff) {
      case "EASY": return "success";
      case "MEDIUM": return "warning";
      case "HARD": return "destructive";
      default: return "default";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:pl-64">
        <PageTransition>
        <div className="p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Coding Challenges</h1>
            <p className="text-muted-foreground mt-1">Practice coding problems with AI-powered evaluation</p>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <button onClick={() => setCategory("")} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${!category ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>
              All Categories
            </button>
            {CHALLENGE_CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => setCategory(cat === category ? "" : cat)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${category === cat ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>
                {cat}
              </button>
            ))}
          </div>

          <div className="flex gap-2 mb-8">
            {DIFFICULTIES.map((diff) => (
              <button key={diff} onClick={() => setDifficulty(diff === difficulty ? "" : diff)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${difficulty === diff ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>
                {diff}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : challengeList.length === 0 ? (
            <div className="text-center py-12">
              <Code className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">No challenges found</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {challengeList.map((challenge: any) => (
                <Link key={challenge.id} href={`/challenges/${challenge.id}`}>
                  <Card className="glass border-border/50 hover:border-primary/50 transition-all h-full">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Code className="h-5 w-5 text-primary" />
                        </div>
                        <Badge variant={difficultyColor(challenge.difficulty) as any}>{challenge.difficulty}</Badge>
                      </div>
                      <h3 className="font-semibold mb-1">{challenge.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{challenge.description}</p>
                      <div className="mt-3">
                        <Badge variant="secondary" className="text-xs">{challenge.category}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
        </PageTransition>
      </main>
    </div>
  );
}
