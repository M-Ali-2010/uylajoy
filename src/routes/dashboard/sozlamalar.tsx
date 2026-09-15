import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/uyjoy/dashboard/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/i18n";
import { authApi } from "@/lib/api-client";
import { useAuthStore, type User } from "@/lib/auth-store";

export const Route = createFileRoute("/dashboard/sozlamalar")({
  head: () => ({
    meta: [{ title: "Sozlamalar — UyJoy.uz" }, { name: "robots", content: "noindex" }],
  }),
  component: () => (
    <DashboardShell title="settings">
      <Settings />
    </DashboardShell>
  ),
});

function Settings() {
  const { t } = useTranslation();
  const { user, updateUser } = useAuthStore();
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [changing, setChanging] = useState(false);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authApi.updateProfile({ name, phone: phone || undefined });
      updateUser(res.user as Partial<User>);
      toast.success(t.dashboard.profileSaved);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t.common.error);
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChanging(true);
    try {
      await authApi.changePassword({ currentPassword: current, newPassword: next });
      setCurrent("");
      setNext("");
      toast.success(t.profile.changePassword);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t.common.error);
    } finally {
      setChanging(false);
    }
  };

  return (
    <div className="grid max-w-3xl gap-6">
      <form
        onSubmit={saveProfile}
        className="space-y-4 rounded-xl border border-border bg-card p-6"
      >
        <h2 className="font-display font-bold">{t.dashboard.profile}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="s-name">{t.dashboard.name}</Label>
            <Input
              id="s-name"
              value={name}
              minLength={2}
              maxLength={80}
              required
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="s-phone">{t.dashboard.phone}</Label>
            <Input
              id="s-phone"
              type="tel"
              value={phone}
              placeholder="+998 90 123 45 67"
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="s-email">Email</Label>
            <Input id="s-email" value={user?.email ?? ""} disabled />
          </div>
        </div>
        <Button type="submit" loading={saving}>
          {t.dashboard.save}
        </Button>
      </form>

      <form
        onSubmit={changePassword}
        className="space-y-4 rounded-xl border border-border bg-card p-6"
      >
        <h2 className="font-display font-bold">{t.profile.changePassword}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="s-cur">{t.auth.password}</Label>
            <Input
              id="s-cur"
              type="password"
              autoComplete="current-password"
              required
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="s-new">{t.auth.resetPassword}</Label>
            <Input
              id="s-new"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={next}
              onChange={(e) => setNext(e.target.value)}
            />
          </div>
        </div>
        <Button type="submit" variant="outline" loading={changing}>
          {t.profile.changePassword}
        </Button>
      </form>
    </div>
  );
}
