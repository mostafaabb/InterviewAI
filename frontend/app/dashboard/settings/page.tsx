"use client";

import { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import { auth } from "@/lib/api";
import { Settings, User, Shield, CreditCard } from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = await auth.updateProfile({ name });
      updateUser(data);
      toast.success("Profile updated");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:pl-64">
        <PageTransition>
        <div className="p-6 lg:p-8 max-w-3xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground mt-1">Manage your account settings</p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center"><User className="mr-2 h-5 w-5 text-primary" /> Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input value={user?.email || ""} disabled className="opacity-50" />
                  </div>
                  <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center"><Shield className="mr-2 h-5 w-5 text-primary" /> Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium capitalize">{user?.plan} Plan</p>
                    <p className="text-sm text-muted-foreground">Unlimited access to all features</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        </PageTransition>
      </main>
    </div>
  );
}
