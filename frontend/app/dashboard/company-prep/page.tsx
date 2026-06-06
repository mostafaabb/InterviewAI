"use client";

import { Sidebar } from "@/components/dashboard/Sidebar";
import { PageTransition } from "@/components/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { COMPANIES } from "@/types";
import { Building, ArrowRight, ExternalLink, BookOpen, Target, Star } from "lucide-react";
import Link from "next/link";

const companyData: Record<string, { focus: string; tips: string[]; topics: string[] }> = {
  Google: {
    focus: "Algorithms & System Design",
    tips: ["Focus on optimal time/space complexity", "Practice coding on a whiteboard", "Know Google's behavioral principles (Googleyness)", "Be ready for multiple rounds of system design"],
    topics: ["Dynamic Programming", "Graph Algorithms", "System Design (Scale)", "Sorting & Searching", "Object-Oriented Design"],
  },
  Meta: {
    focus: "Frontend & Behavioral",
    tips: ["Product sense questions are critical", "Know React/React Native internals", "Practice behavioral STAR stories", "Be ready to code on a shared document"],
    topics: ["React Internals", "JavaScript Fundamentals", "System Design (Frontend)", "Behavioral STAR", "Product Metrics"],
  },
  Amazon: {
    focus: "Leadership Principles",
    tips: ["Study Amazon's 16 Leadership Principles", "Use STAR format for every behavioral answer", "Be ready for bar raiser interviews", "Focus on customer obsession examples"],
    topics: ["Leadership Principles", "System Design", "Object-Oriented Design", "API Design", "Scalability"],
  },
  Microsoft: {
    focus: "Full Stack & Problem Solving",
    tips: ["Prepare for design docs and whiteboarding", "Know Azure/cloud concepts", "Practice algorithmic problem solving", "Be ready for pair programming"],
    topics: ["Algorithm Design", "Cloud Architecture", "Full Stack Design", "Data Structures", "Testing Strategies"],
  },
  Apple: {
    focus: "Craft & Detail Oriented",
    tips: ["Focus on polish and attention to detail", "Know hardware-software integration", "Practice explaining complex topics simply", "Be ready for passionate technical debates"],
    topics: ["UI/UX Design", "Performance Optimization", "System Programming", "Hardware-Software Integration", "Swift/Objective-C"],
  },
  Netflix: {
    focus: "High Performance & Culture",
    tips: ["Study Netflix culture deck", "Focus on freedom and responsibility", "Be ready for deep domain expertise questions", "Emphasize your impact and results"],
    topics: ["Microservices Architecture", "Content Delivery Systems", "Data Engineering", "A/B Testing", "Streaming Technology"],
  },
};

export default function CompanyPrepPage() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:pl-64">
        <PageTransition>
        <div className="p-6 lg:p-8 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Company-Specific Prep</h1>
            <p className="text-muted-foreground mt-1">Tailored preparation for top tech companies</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {COMPANIES.map((company) => {
              const data = companyData[company.name];
              return (
                <Card key={company.name} className="glass border-border/50 hover:border-primary/50 transition-all">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${company.color} flex items-center justify-center text-white font-bold text-lg mb-4`}>
                      {company.icon}
                    </div>
                    <h3 className="text-lg font-bold mb-1">{company.name}</h3>
                    <p className="text-sm text-primary font-medium mb-3">{data.focus}</p>
                    <div className="space-y-2 mb-4">
                      {data.tips.slice(0, 2).map((tip, i) => (
                        <p key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                          <Star className="h-3 w-3 text-yellow-500 mt-0.5 shrink-0" />
                          {tip}
                        </p>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {data.topics.slice(0, 3).map((topic) => (
                        <span key={topic} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">{topic}</span>
                      ))}
                    </div>
                    <Link href={`/interviews`}>
                      <Button variant="outline" size="sm" className="w-full">
                        Start Practice <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
        </PageTransition>
      </main>
    </div>
  );
}
