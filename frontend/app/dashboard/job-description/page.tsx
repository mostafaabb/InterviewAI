"use client";

import { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { jobDescriptions } from "@/lib/api";
import { Briefcase, Loader2, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

export default function JobDescriptionPage() {
  const [content, setContent] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!content.trim()) return;
    setAnalyzing(true);
    try {
      const data = await jobDescriptions.analyze(content);
      setResult(data.analysis);
      toast.success("Analysis complete!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:pl-64">
        <PageTransition>
        <div className="p-6 lg:p-8 max-w-3xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Job Description Analyzer</h1>
            <p className="text-muted-foreground mt-1">Paste a job description to get interview insights</p>
          </div>

          <Card className="mb-6">
            <CardContent className="p-6">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste the job description here..."
                className="w-full h-48 p-4 rounded-xl border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button onClick={handleAnalyze} disabled={analyzing || !content.trim()} className="w-full mt-4">
                {analyzing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : "Analyze Job Description"}
              </Button>
            </CardContent>
          </Card>

          {result && (
            <div className="space-y-6">
              {result.requiredSkills?.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-lg">Required Skills</CardTitle></CardHeader>
                  <CardContent><div className="flex flex-wrap gap-2">{result.requiredSkills.map((s: string) => <Badge key={s} variant="info">{s}</Badge>)}</div></CardContent>
                </Card>
              )}

              {result.missingSkills?.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-lg">Missing Skills to Learn</CardTitle></CardHeader>
                  <CardContent><div className="flex flex-wrap gap-2">{result.missingSkills.map((s: string) => <Badge key={s} variant="warning">{s}</Badge>)}</div></CardContent>
                </Card>
              )}

              {result.interviewTopics?.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-lg">Topics to Study</CardTitle></CardHeader>
                  <CardContent><ul className="space-y-2">{result.interviewTopics.map((t: string, i: number) => <li key={i} className="flex items-start gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />{t}</li>)}</ul></CardContent>
                </Card>
              )}

              {result.customQuestions?.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-lg">Potential Interview Questions</CardTitle></CardHeader>
                  <CardContent><ul className="space-y-2">{result.customQuestions.map((q: string, i: number) => <li key={i} className="flex items-start gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />{q}</li>)}</ul></CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
        </PageTransition>
      </main>
    </div>
  );
}
