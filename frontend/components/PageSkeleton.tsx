"use client";

import { Sidebar } from "@/components/dashboard/Sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { PageTransition } from "@/components/PageTransition";

export function PageSkeleton({ sidebar = true }: { sidebar?: boolean }) {
  return (
    <div className="min-h-screen flex">
      {sidebar && <Sidebar />}
      <main className={sidebar ? "lg:pl-64 flex-1" : "flex-1"}>
        <PageTransition>
          <div className="p-6 lg:p-8 max-w-4xl">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-5 w-96 mb-8" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
            </div>
            <Skeleton className="h-64 mb-6" />
            <Skeleton className="h-48" />
          </div>
        </PageTransition>
      </main>
    </div>
  );
}

export function ListSkeleton({ sidebar = true, count = 6 }: { sidebar?: boolean; count?: number }) {
  return (
    <div className="min-h-screen flex">
      {sidebar && <Sidebar />}
      <main className={sidebar ? "lg:pl-64 flex-1" : "flex-1"}>
        <PageTransition>
          <div className="p-6 lg:p-8 max-w-6xl">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-5 w-96 mb-8" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: count }).map((_, i) => (
                <Skeleton key={i} className="h-40" />
              ))}
            </div>
          </div>
        </PageTransition>
      </main>
    </div>
  );
}
