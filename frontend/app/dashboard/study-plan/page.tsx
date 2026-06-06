"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PageTransition } from "@/components/PageTransition";
import { studyPlans } from "@/lib/api";
import { INTERVIEW_CATEGORIES } from "@/types";
import { Calendar, Loader2, CheckCircle2, Clock, Target, BookOpen } from "lucide-react";
import toast from "react-hot-toast";

export default function StudyPlanPage() {
  const [step, setStep] = useState<"create" | "view">("create");
  const [targetRole, setTargetRole] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [creating, setCreating] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadPlans(); }, []);

  const loadPlans = async () => {
    try { setPlans(await studyPlans.getAll()); } catch {}
    finally { setLoading(false); }
  };

  const createPlan = async () => {
    if (!targetRole) { toast.error("Select a target role"); return; }
    setCreating(true);
    try {
      const data = await studyPlans.create({ targetRole, targetDate: targetDate || undefined });
      setPlan(data);
      setPlans((prev) => [data, ...prev]);
      setStep("view");
      toast.success("Study plan created!");
    } catch (error: any) { toast.error(error.message); }
    finally { setCreating(false); }
  };

  const toggleDay = async (planId: string, dayIndex: number) => {
    try {
      const updated = await studyPlans.update(planId, { dayIndex });
      setPlans((prev) => prev.map((p) => (p.id === planId ? { ...p, ...updated } : p)));
      if (plan?.id === planId) setPlan((prev: any) => ({ ...prev, ...updated }));
    } catch { toast.error("Failed to update"); }
  };

  const viewPlan = (p: any) => {
    setPlan(p);
    setStep("view");
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:pl-64">
        <PageTransition>
        <div className="p-6 lg:p-8 max-w-4xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Study Timeline</h1>
              <p className="text-muted-foreground mt-1">Personalized day-by-day interview prep schedule</p>
            </div>
            <Button variant="outline" onClick={() => setStep("create")}>New Plan</Button>
          </div>

          {step === "create" ? (
            <Card className="glass border-border/50 mb-6">
              <CardHeader><CardTitle className="flex items-center"><Calendar className="mr-2 h-5 w-5 text-primary" /> Create Study Plan</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Target Role</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {INTERVIEW_CATEGORIES.map((role) => (
                      <button key={role} onClick={() => setTargetRole(role)} className={`p-2 rounded-lg text-xs text-left transition-all border ${targetRole === role ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>{role}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1">Target Interview Date (optional)</label>
                  <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
                </div>
                <Button onClick={createPlan} disabled={creating} className="w-full">
                  {creating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><Target className="mr-2 h-4 w-4" /> Generate Study Plan</>}
                </Button>
              </CardContent>
            </Card>
          ) : plan ? (
            <div className="space-y-6">
              <Card className="border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold">{plan.targetRole} Prep</h2>
                      <p className="text-sm text-muted-foreground">{plan.stats?.totalDays || plan.schedule?.length} days • {plan.stats?.totalHours || "—"} hours total</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{Math.round(plan.progress || 0)}%</div>
                      <p className="text-xs text-muted-foreground">Complete</p>
                    </div>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-primary to-indigo-500 transition-all" style={{ width: `${plan.progress || 0}%` }} />
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                {(plan.schedule || []).map((day: any, i: number) => (
                  <button key={i} onClick={() => toggleDay(plan.id, i)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-sm transition-all border ${day.completed ? "border-green-500/30 bg-green-500/5" : "border-border hover:bg-muted"}`}>
                    <div className="flex items-center gap-3">
                      {day.completed ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />}
                      <div className="text-left">
                        <p className={`font-medium ${day.completed ? "line-through text-muted-foreground" : ""}`}>Day {day.day}: {day.topic}</p>
                        <p className="text-xs text-muted-foreground">{day.date} • {day.duration}min</p>
                      </div>
                    </div>
                    <Badge variant={day.completed ? "success" : "secondary"}>{day.completed ? "Done" : "Pending"}</Badge>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">No study plans yet. Create one to get started!</p>
            </div>
          )}

          {plans.length > 0 && step !== "create" && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-3">Previous Plans</h3>
              <div className="space-y-2">
                {plans.filter((p) => p.id !== plan?.id).map((p: any) => (
                  <button key={p.id} onClick={() => viewPlan(p)} className="w-full flex items-center justify-between p-3 rounded-lg bg-muted text-sm hover:bg-accent transition-colors">
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <span className="font-medium">{p.targetRole}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{Math.round(p.progress || 0)}%</span>
                      <Badge variant={p.status === "ACTIVE" ? "info" : "secondary"}>{p.status}</Badge>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        </PageTransition>
      </main>
    </div>
  );
}
