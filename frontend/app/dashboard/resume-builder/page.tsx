"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/PageTransition";
import { resumeTemplates } from "@/lib/api";
import { File, Loader2, CheckCircle2, Download, Eye } from "lucide-react";
import toast from "react-hot-toast";

export default function ResumeBuilderPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [preview, setPreview] = useState(false);

  useEffect(() => { loadTemplates(); }, []);

  const loadTemplates = async () => {
    try { setTemplates(await resumeTemplates.getAll()); }
    catch { toast.error("Failed to load templates"); }
    finally { setLoading(false); }
  };

  const renderPreview = (t: any) => {
    const s = typeof t.structure === "string" ? JSON.parse(t.structure) : t.structure;
    return (
      <div className="space-y-4 p-6 bg-white rounded-lg shadow-sm border" style={{ fontFamily: s.font || "Inter" }}>
        <div className="text-center border-b pb-4">
          <div className="w-16 h-16 rounded-full bg-gray-200 mx-auto mb-2" />
          <h3 className="text-lg font-bold">Your Name</h3>
          <p className="text-sm text-gray-500">email@example.com • (555) 123-4567</p>
        </div>
        {s.sections?.filter((sec: string) => sec !== "header").map((sec: string) => (
          <div key={sec}>
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-700 border-b pb-1 mb-2">{sec.replace(/-/g, " ")}</h4>
            <div className="h-3 rounded bg-gray-100 w-full mb-1" />
            <div className="h-3 rounded bg-gray-100 w-3/4 mb-1" />
            <div className="h-3 rounded bg-gray-100 w-1/2" />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:pl-64">
        <PageTransition>
        <div className="p-6 lg:p-8 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Resume Builder</h1>
            <p className="text-muted-foreground mt-1">Choose from ATS-optimized templates and build your resume</p>
          </div>

          {loading ? <Loader2 className="h-8 w-8 animate-spin mx-auto mt-12" /> : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {templates.map((t, i) => (
                <Card key={i} className={`cursor-pointer transition-all hover:border-primary/50 ${selected?.name === t.name ? "ring-2 ring-primary" : ""}`} onClick={() => { setSelected(t); setPreview(false); }}>
                  <CardContent className="p-4">
                    <div className="w-full h-32 rounded-lg bg-muted mb-3 flex items-center justify-center text-muted-foreground text-xs">
                      {t.name === "Modern Clean" ? "📄 Two-Column" : t.name === "ATS Optimized" ? "📋 Single Col" : t.name === "Technical Focus" ? "💻 Dev Focus" : t.name === "Executive" ? "👔 Executive" : "📄 Template"}
                    </div>
                    <h3 className="font-medium text-sm">{t.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{t.description}</p>
                    {t.category && <Badge variant="secondary" className="mt-2 text-xs">{t.category}</Badge>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {selected && (
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">{selected.name} — Preview</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setPreview(!preview)}>
                    {preview ? "Close Preview" : <><Eye className="mr-1 h-4 w-4" /> Preview</>}
                  </Button>
                </CardHeader>
                <CardContent>
                  {preview ? renderPreview(selected) : (
                    <div className="text-sm space-y-3">
                      <h4 className="font-semibold">Template Details</h4>
                      {(() => { try {
                        const s = JSON.parse(selected.structure);
                        return (<div className="space-y-2">
                          <p><strong>Layout:</strong> {s.columns === 1 ? "Single Column" : "Two Column"}</p>
                          <p><strong>Font:</strong> {s.font}</p>
                          <p><strong>Sections:</strong> {s.sections?.join(", ")}</p>
                        </div>);
                      } catch { return null; }})()}
                      <Button className="w-full mt-4"><Download className="mr-2 h-4 w-4" /> Build with this Template</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg">Tips</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {[
                    "Customize each section for the job you're applying to",
                    "Use action verbs and quantify achievements (%, $, time saved)",
                    "Keep it to 1-2 pages maximum",
                    "Include relevant keywords from the job description",
                    "Save as PDF to preserve formatting across systems",
                  ].map((tip, i) => (
                    <div key={i} className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />{tip}</div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
        </PageTransition>
      </main>
    </div>
  );
}
