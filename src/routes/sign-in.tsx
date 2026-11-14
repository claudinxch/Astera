import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { clearCachedSession } from "@/lib/session-cache";

export const Route = createFileRoute("/sign-in")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    const { error } = await authClient.signIn.email({ email, password });

    if (error) {
      setError(error.message ?? "Login failed");
      return;
    }

    clearCachedSession();
    navigate({ to: "/app" });
  };

  return (
    <div className="flex flex-col gap-2 max-w-sm mx-auto mt-20">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border rounded p-2"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border rounded p-2"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button onClick={handleLogin}>Log in</Button>
    </div>
  );
}
