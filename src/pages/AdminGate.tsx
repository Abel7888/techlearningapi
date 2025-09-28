import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState<boolean>(false);
  const [pw, setPw] = useState<string>("");
  const [error, setError] = useState<string>("");
  const isLocalhost = typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1)/.test(window.location.hostname);

  useEffect(() => {
    const saved = localStorage.getItem("admin_token");
    if (saved) setAuthed(true);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const resp = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw })
      });
      if (!resp.ok) {
        const t = await resp.text().catch(() => '');
        setError(t || 'Login failed');
        return;
      }
      const data = await resp.json();
      if (data?.token) {
        localStorage.setItem('admin_token', data.token);
        setAuthed(true);
      } else {
        setError('Login failed: no token');
      }
    } catch (e: any) {
      setError(e?.message || 'Login failed');
    }
  }

  function handleLogout() {
    localStorage.removeItem('admin_token');
    setAuthed(false);
  }

  if (authed) {
    return (
      <div>
        <div className="container mx-auto px-6 pt-4 pb-0 flex justify-end">
          <Button variant="outline" size="sm" onClick={handleLogout}>Sign out</Button>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Access</CardTitle>
          <CardDescription>Enter the admin password to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <Input type="password" placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)} />
            <Button type="submit" className="w-full">Unlock Admin</Button>
            {error && <div className="text-xs text-red-500">{error}</div>}
            <div className="text-xs text-muted-foreground pt-1">Tip: If you recently changed the password, refresh the page or open a Private/Incognito window. Try typing the password instead of pasting to avoid hidden characters.</div>
            <div className="flex items-center justify-between pt-2">
              <Button type="button" variant="outline" size="sm" onClick={handleLogout}>Reset Lock</Button>
              {isLocalhost && (<div className="text-[11px] text-muted-foreground">Local mode</div>)}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
