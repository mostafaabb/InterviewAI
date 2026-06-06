"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/PageTransition";
import { insights } from "@/lib/api";
import { COMPANIES } from "@/types";
import { Loader2, Clock, DollarSign, Users, Zap } from "lucide-react";
import toast from "react-hot-toast";

export default function CompanyInsightsPage() {
  const [selectedCompany, setSelectedCompany] = useState("Google");
  const [insightList, setInsightList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadInsights(); }, [selectedCompany]);

  const loadInsights = async () => {
    setLoading(true);
    try { setInsightList(await insights.getAll(selectedCompany)); }
    catch { toast.error("Failed to load insights"); }
    finally { setLoading(false); }
  };

  const current = insightList[0];

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:pl-64">
        <PageTransition>
        <div className="p-6 lg:p-8 max-w-5xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Company Interview Intel</h1>
            <p className="text-muted-foreground mt-1">Real interview processes, questions, and tips for top tech companies</p>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {COMPANIES.map((c) => (
              <button key={c.name} onClick={() => setSelectedCompany(c.name)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${selectedCompany === c.name ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"}`}>
                <span className={`inline-block w-6 h-6 rounded ${c.color} text-white text-xs font-bold leading-6 text-center mr-2`}>{c.icon}</span>
                {c.name}
              </button>
            ))}
          </div>

          {loading ? <Loader2 className="h-8 w-8 animate-spin mx-auto mt-12" /> : current ? (
            <div className="space-y-6">
              <Card className="border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold">{current.company} — {current.role}</h2>
                      <p className="text-sm text-muted-foreground">{current.level}</p>
                    </div>
                    <Badge variant="success">Verified</Badge>
                  </div>
                  {current.salary && (
                    <div className="flex items-center gap-2 text-sm mb-3">
                      <DollarSign className="h-4 w-4 text-green-500" /> <span className="font-medium">{current.salary}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center"><Clock className="mr-2 h-5 w-5 text-primary" /> Interview Process</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm">{current.process}</p>
                  {current.timeline && (
                    <div className="mt-4 space-y-2">
                      {(() => { try { return JSON.parse(current.timeline).map((t: string, i: number) => (
                        <div key={i} className="flex items-center gap-3 text-sm"><div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">{i + 1}</div>{t}</div>
                      )); } catch { return null; }})()}
                    </div>
                  )}
                </CardContent>
              </Card>

              {current.questions && (
                <Card>
                        <CardHeader><CardTitle className="text-lg flex items-center"><Zap className="mr-2 h-5 w-5 text-yellow-500" /> Common Questions</CardTitle></CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {(() => { try { return JSON.parse(current.questions).map((q: string, i: number) => (
                         <li key={i} className="flex items-start gap-2 text-sm p-2 rounded-lg bg-muted"><Zap className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />{q}</li>
                      )); } catch { return null; }})()}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {current.tips && (
                <Card>
                  <CardHeader><CardTitle className="text-lg">Pro Tips</CardTitle></CardHeader>
                  <CardContent><p className="text-sm">{current.tips}</p></CardContent>
                </Card>
              )}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">No insights available for this company yet.</p>
          )}
        </div>
        </PageTransition>
      </main>
    </div>
  );
}
