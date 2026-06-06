"use client";

import { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/PageTransition";
import { fetchAPI } from "@/lib/api";
import { INTERVIEW_CATEGORIES } from "@/types";
import {
  Target, BookOpen, CheckCircle2, Clock,
  ArrowRight, Sparkles, Loader2, BarChart3, Zap
} from "lucide-react";
import toast from "react-hot-toast";

const EXPERIENCE_LEVELS = ["beginner", "intermediate", "advanced"];

export default function LearningPathPage() {
  const [step, setStep] = useState<"configure" | "path">("configure");
  const [targetRole, setTargetRole] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("beginner");
  const [loading, setLoading] = useState(false);
  const [pathData, setPathData] = useState<any>(null);

  const generatePath = async () => {
    if (!targetRole) { toast.error("Select a target role"); return; }
    setLoading(true);
    try {
      const data = await fetchAPI("/learning-paths/generate", {
        method: "POST",
        body: { targetRole, experienceLevel },
      });
      setPathData(data);
      setStep("path");
      toast.success("Learning path generated!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:pl-64">
        <PageTransition>
        <div className="p-6 lg:p-8 max-w-5xl">
          {step === "configure" ? (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold">Personalized Learning Path</h1>
                <p className="text-muted-foreground mt-1">Tell us about your goals and we'll create a custom study plan</p>
              </div>

              <Card className="glass border-border/50 mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center"><Target className="mr-2 h-5 w-5 text-primary" /> Your Goals</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-3 block">Target Role</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {INTERVIEW_CATEGORIES.map((role) => (
                        <button key={role} onClick={() => setTargetRole(role)}
                          className={`p-3 rounded-lg text-sm text-left transition-all border ${targetRole === role ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"}`}>
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-3 block">Experience Level</label>
                    <div className="flex gap-2">
                      {EXPERIENCE_LEVELS.map((level) => (
                        <button key={level} onClick={() => setExperienceLevel(level)}
                          className={`flex-1 p-3 rounded-lg text-sm capitalize text-center transition-all border ${experienceLevel === level ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"}`}>
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button onClick={generatePath} disabled={loading} className="w-full" size="lg">
                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><Sparkles className="mr-2 h-4 w-4" /> Generate Learning Path</>}
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : pathData ? (
            <>
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold">Your Learning Path</h1>
                    <p className="text-muted-foreground mt-1">Personalized for {pathData.stats.targetRole}</p>
                  </div>
                  <Button variant="outline" onClick={() => setStep("configure")}>Regenerate</Button>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card>
                  <CardContent className="p-4 lg:p-6 text-center">
                    <BarChart3 className="h-6 w-6 text-primary mx-auto mb-2" />
                    <div className="text-xl font-bold">{pathData.stats.interviewsCompleted}</div>
                    <p className="text-xs text-muted-foreground">Interviews Done</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 lg:p-6 text-center">
                    <Zap className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                    <div className="text-xl font-bold">{pathData.stats.challengesSolved}</div>
                    <p className="text-xs text-muted-foreground">Challenges Solved</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 lg:p-6 text-center">
                    <Target className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                    <div className="text-xl font-bold">{pathData.stats.averageScore}%</div>
                    <p className="text-xs text-muted-foreground">Avg Score</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 lg:p-6 text-center">
                    <Clock className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                    <div className="text-xl font-bold">{pathData.stats.weekGoal}</div>
                    <p className="text-xs text-muted-foreground">Weekly Goal</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-3">
                {pathData.path.map((item: any, i: number) => (
                  <Card key={i} className={`border-l-4 ${item.status === "current" ? "border-l-primary" : "border-l-muted"}`}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${item.status === "current" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                            {item.order}
                          </div>
                          <div>
                            <h3 className="font-medium">{item.topic}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{item.resources}</p>
                          </div>
                        </div>
                        <Badge variant={item.difficulty === "advanced" ? "destructive" : item.difficulty === "intermediate" ? "warning" : "success"}>
                          {item.difficulty}
                        </Badge>
                      </div>
                      {item.status === "current" && (
                        <Button size="sm" className="mt-3">
                          <BookOpen className="mr-1 h-3 w-3" /> Start Learning
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : null}
        </div>
        </PageTransition>
      </main>
    </div>
  );
}
