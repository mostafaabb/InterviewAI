"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { PageTransition } from "@/components/PageTransition";
import { starAnswers } from "@/lib/api";
import { Star, Loader2, Trash2, CheckCircle2, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

const STAR_CATEGORIES = ["Leadership", "Problem Solving", "Conflict Resolution", "Initiative", "Teamwork", "Failure & Learning"];

export default function StarBuilderPage() {
  const [step, setStep] = useState<"form" | "saved">("form");
  const [situation, setSituation] = useState("");
  const [task, setTask] = useState("");
  const [action, setAction] = useState("");
  const [result, setResult] = useState("");
  const [category, setCategory] = useState(STAR_CATEGORIES[0]);
  const [saving, setSaving] = useState(false);
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAnswers(); }, []);

  const loadAnswers = async () => {
    try { setAnswers(await starAnswers.getAll()); } catch {}
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!situation || !task || !action || !result) { toast.error("Fill in all STAR sections"); return; }
    setSaving(true);
    try {
      const data = await starAnswers.create({ situation, task, action, result, category });
      setAnswers((prev) => [data, ...prev]);
      setSituation(""); setTask(""); setAction(""); setResult("");
      toast.success("STAR answer saved!");
    } catch (error: any) { toast.error(error.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try { await starAnswers.delete(id); setAnswers((prev) => prev.filter((a) => a.id !== id)); toast.success("Deleted"); }
    catch (error: any) { toast.error(error.message); }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:pl-64">
        <PageTransition>
        <div className="p-6 lg:p-8 max-w-4xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">STAR Answer Builder</h1>
              <p className="text-muted-foreground mt-1">Build structured behavioral answers using the STAR method</p>
            </div>
            <Button variant="outline" onClick={() => setStep(step === "form" ? "saved" : "form")}>
              {step === "form" ? "View Saved" : "New Answer"}
            </Button>
          </div>

          {step === "form" ? (
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center"><Star className="mr-2 h-5 w-5 text-yellow-500" /> Build Your STAR Answer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {STAR_CATEGORIES.map((c) => (
                      <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${category === c ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>{c}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1">Situation</label>
                  <p className="text-xs text-muted-foreground mb-2">Describe the context and background</p>
                  <Textarea value={situation} onChange={(e) => setSituation(e.target.value)} placeholder="When I was working as a..." className="min-h-[80px]" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1">Task</label>
                  <p className="text-xs text-muted-foreground mb-2">What was your responsibility or goal?</p>
                  <Textarea value={task} onChange={(e) => setTask(e.target.value)} placeholder="I was responsible for..." className="min-h-[80px]" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1">Action</label>
                  <p className="text-xs text-muted-foreground mb-2">What specific steps did you take?</p>
                  <Textarea value={action} onChange={(e) => setAction(e.target.value)} placeholder="I identified the issue, then I..." className="min-h-[100px]" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1">Result</label>
                  <p className="text-xs text-muted-foreground mb-2">What were the outcomes? Use metrics if possible.</p>
                  <Textarea value={result} onChange={(e) => setResult(e.target.value)} placeholder="The project was delivered 2 weeks early, resulting in..." className="min-h-[80px]" />
                </div>
                <Button onClick={handleSave} disabled={saving} className="w-full">
                  {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Sparkles className="mr-2 h-4 w-4" /> Save & Score</>}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {loading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : answers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No saved STAR answers yet.</p>
              ) : answers.map((a: any) => (
                <Card key={a.id}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="info">{a.category}</Badge>
                      <div className="flex items-center gap-2">
                        <Badge variant={a.score >= 80 ? "success" : "warning"}>{a.score}%</Badge>
                        <button onClick={() => handleDelete(a.id)} className="text-muted-foreground hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><strong>S:</strong> {a.situation}</p>
                      <p><strong>T:</strong> {a.task}</p>
                      <p><strong>A:</strong> {a.action}</p>
                      <p><strong>R:</strong> {a.result}</p>
                    </div>
                    {a.feedback && <p className="mt-3 text-xs text-muted-foreground bg-muted p-2 rounded-lg">{a.feedback}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
        </PageTransition>
      </main>
    </div>
  );
}
