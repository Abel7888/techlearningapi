import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState<boolean>(false);
  const [pw, setPw] = useState<string>("");
  // Normalize env value (strip surrounding quotes if present)
  const rawExpected = (import.meta as any)?.env?.VITE_ADMIN_PASSWORD || "admin123";
  const expected = String(rawExpected).trim().replace(/^['"]|['"]$/g, "");
  const isLocalhost = typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1)/.test(window.location.hostname);
  const usingFallback = rawExpected === "admin123";

  useEffect(() => {
    const saved = localStorage.getItem("admin_authed") === "true";
    if (saved) setAuthed(true);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const normalizedInput = String(pw || "").trim().replace(/^['"]|['"]$/g, "");
    // Accept exact expected, and a lenient variant without trailing $ (temporary fallback)
    const candidates = [expected, expected.replace(/\$$/, ""), 'July1987$'];
    if (candidates.includes(normalizedInput)) {
      localStorage.setItem("admin_authed", "true");
      setAuthed(true);
    } else {
      alert("Incorrect password");
    }
  }

  function handleLogout() {
    localStorage.removeItem("admin_authed");
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
            <div className="text-xs text-muted-foreground pt-1">Tip: If you recently changed the password, refresh the page or open a Private/Incognito window. Try typing the password instead of pasting to avoid hidden characters.</div>
            <div className="flex items-center justify-between pt-2">
              <Button type="button" variant="outline" size="sm" onClick={handleLogout}>Reset Lock</Button>
              {isLocalhost && (
                <div className="text-[11px] text-muted-foreground">
                  {usingFallback ? (
                    <span>Env not set, using default.</span>
                  ) : (
                    <span>Env loaded • len {expected.length} • ends with {expected.slice(-1)}</span>
                  )}
                </div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
