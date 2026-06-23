"use client";
import Link from "next/link";
import { FormEvent, useState } from "react";

export function AuthForm({ mode }: { mode: "signin" | "register" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleChoice, setRoleChoice] = useState("Share reviews"); // "Share reviews" | "Manage my business"
  const [message, setMessage] = useState("");
  const register = mode === "register";

  async function submit(event: FormEvent) {
    event.preventDefault();
    const isFirebaseConfigured = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

    if (!isFirebaseConfigured) {
      // Determine role from selection and email
      let role = "REVIEWER";
      if (email.toLowerCase().includes("admin")) {
        role = "ADMIN";
      } else if (roleChoice === "Manage my business") {
        role = "OWNER";
      }

      if (register) {
        try {
          const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              token: `mock-token-${email.toLowerCase()}`, 
              roleChoice, 
              isMock: true, 
              email: email.toLowerCase() 
            })
          });
          const data = await res.json();
          if (!res.ok) {
            setMessage(data.error || "Registration failed");
            return;
          }
        } catch (err: any) {
          setMessage(err.message || "Failed to register");
          return;
        }
      } else {
        try {
          const res = await fetch("/api/auth/signin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              token: `mock-token-${email.toLowerCase()}`, 
              isMockGoogle: true, 
              mockEmail: email.toLowerCase() 
            })
          });
          const data = await res.json();
          if (!res.ok) {
            setMessage(data.error || "Sign-in failed");
            return;
          }
        } catch (err: any) {
          setMessage(err.message || "Failed to sign in");
          return;
        }
      }

      // Set mock cookies for SQLite dynamic database queries
      document.cookie = `mock-user-email=${encodeURIComponent(email)}; path=/; max-age=31536000`;
      document.cookie = `mock-user-role=${encodeURIComponent(role)}; path=/; max-age=31536000`;
      
      setMessage(register ? "Registration successful! Redirecting..." : `Mock Sign-In Successful! Signed in locally as ${email} (${role}). Redirecting...`);
      setTimeout(() => {
        window.location.href = role === "ADMIN" ? "/admin" : "/";
      }, 1500);
    } else {
      try {
        setMessage(register ? "Creating account..." : "Signing in...");
        const { auth: clientAuth } = await import("@/lib/firebase");
        const { signInWithEmailAndPassword, createUserWithEmailAndPassword } = await import("firebase/auth");

        let credential;
        if (register) {
          credential = await createUserWithEmailAndPassword(clientAuth, email, password);
          const token = await credential.user.getIdToken();
          
          const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, roleChoice })
          });
          
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Backend registration failed");
          
          const role = data.user.role;
          document.cookie = `mock-user-email=${encodeURIComponent(email)}; path=/; max-age=31536000`;
          document.cookie = `mock-user-role=${encodeURIComponent(role)}; path=/; max-age=31536000`;

          setMessage("Registration successful! Redirecting...");
          setTimeout(() => {
            window.location.href = role === "ADMIN" ? "/admin" : "/";
          }, 1500);
        } else {
          credential = await signInWithEmailAndPassword(clientAuth, email, password);
          const token = await credential.user.getIdToken();
          
          const res = await fetch("/api/auth/signin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token })
          });
          
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Backend sign-in failed");

          const role = data.user.role;
          document.cookie = `mock-user-email=${encodeURIComponent(email)}; path=/; max-age=31536000`;
          document.cookie = `mock-user-role=${encodeURIComponent(role)}; path=/; max-age=31536000`;

          setMessage("Sign-in successful! Redirecting...");
          setTimeout(() => {
            window.location.href = role === "ADMIN" ? "/admin" : "/";
          }, 1500);
        }
      } catch (error: any) {
        console.error("Firebase auth error:", error);
        setMessage(`Error: ${error.message}`);
      }
    }
  }

  async function signInWithGoogle() {
    const isFirebaseConfigured = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

    if (!isFirebaseConfigured) {
      // Mock Google Sign-In
      const mockEmail = prompt("Enter mock Gmail address for visual Google login test:", "reviewer-google@gmail.com");
      if (!mockEmail) return;
      
      const normalizedEmail = mockEmail.toLowerCase();
      const role = normalizedEmail.includes("admin") ? "ADMIN" : "REVIEWER";

      document.cookie = `mock-user-email=${encodeURIComponent(normalizedEmail)}; path=/; max-age=31536000`;
      document.cookie = `mock-user-role=${encodeURIComponent(role)}; path=/; max-age=31536000`;

      // Trigger backend call to trigger mailer
      try {
        await fetch("/api/auth/signin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            token: `mock-google-token-${normalizedEmail}`, 
            isMockGoogle: true, 
            mockEmail: normalizedEmail 
          })
        });
      } catch (err) {
        console.error("Mock social signin alert failed", err);
      }

      setMessage(`Mock Google Sign-In Successful! Signed in locally as ${normalizedEmail}. Redirecting...`);
      setTimeout(() => {
        window.location.href = role === "ADMIN" ? "/admin" : "/";
      }, 1500);
    } else {
      try {
        setMessage("Connecting to Google...");
        const { auth: clientAuth, googleProvider } = await import("@/lib/firebase");
        const { signInWithPopup } = await import("firebase/auth");

        const credential = await signInWithPopup(clientAuth, googleProvider);
        const token = await credential.user.getIdToken();

        const res = await fetch("/api/auth/signin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Social login failed");

        const role = data.user.role;
        document.cookie = `mock-user-email=${encodeURIComponent(credential.user.email || "")}; path=/; max-age=31536000`;
        document.cookie = `mock-user-role=${encodeURIComponent(role)}; path=/; max-age=31536000`;

        setMessage("Google Sign-in successful! Redirecting...");
        setTimeout(() => {
          window.location.href = role === "ADMIN" ? "/admin" : "/";
        }, 1500);
      } catch (error: any) {
        console.error("Google auth error:", error);
        setMessage(`Error: ${error.message}`);
      }
    }
  }

  return (
    <div className="mt-8 space-y-4">
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm font-bold">Email
          <input 
            required 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-xl border border-[#e7dff0] px-4 py-3 outline-[#7441b5] text-[#21152d]" 
            placeholder="you@example.com" 
          />
        </label>
        <label className="block text-sm font-bold">Password
          <input 
            required 
            minLength={8} 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-xl border border-[#e7dff0] px-4 py-3 outline-[#7441b5] text-[#21152d]" 
            placeholder="At least 8 characters" 
          />
        </label>
        {register && (
          <label className="block text-sm font-bold">I want to
            <select 
              value={roleChoice}
              onChange={(e) => setRoleChoice(e.target.value)}
              className="mt-2 w-full rounded-xl border border-[#e7dff0] bg-white px-4 py-3 text-[#21152d]"
            >
              <option value="Share reviews">Share reviews</option>
              <option value="Manage my business">Manage my business</option>
            </select>
          </label>
        )}
        <button className="w-full rounded-xl bg-[#ff6679] px-5 py-3.5 font-black text-white">
          {register ? "Create account" : "Sign in"}
        </button>
      </form>

      <div className="relative my-6 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#e7dff0]"></div>
        </div>
        <span className="relative bg-[#fbf9ff] px-4 text-xs font-bold uppercase tracking-wider text-[#756a7d]">
          or continue with
        </span>
      </div>

      <button
        type="button"
        onClick={signInWithGoogle}
        className="w-full rounded-xl border border-[#e7dff0] bg-white px-5 py-3.5 font-bold text-[#21152d] flex items-center justify-center gap-3 hover:bg-slate-50 transition"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        Sign in with Google
      </button>

      {message && <p className="rounded-xl bg-[#f4eff9] p-3 text-sm font-semibold text-[#7441b5]">{message}</p>}
      
      <p className="text-center text-sm text-[#756a7d]">
        {register ? "Already a member?" : "New to VibeCheck?"}{" "}
        <Link className="font-bold text-[#7441b5]" href={register ? "/auth/signin" : "/auth/register"}>
          {register ? "Sign in" : "Create account"}
        </Link>
      </p>
    </div>
  );
}

