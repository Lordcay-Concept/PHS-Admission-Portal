"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";
import { Lock, Mail, Loader2, ArrowRight, ArrowLeft, KeyRound, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showResetSheet, setShowResetSheet] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error("Auth Error:", authError.message);
        toast.error(authError.message);
        setLoading(false);
        return;
      }

      if (!user) {
        toast.error("Login failed - no user returned");
        setLoading(false);
        return;
      }

      console.log("Auth successful, fetching profile for UID:", user.id);
      
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, is_approved")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Database Error Detail:", profileError);
        toast.error(`Profile error: ${profileError.message}`);
        setLoading(false);
        return;
      }

      if (!profile) {
        console.error("No profile row found for this ID");
        toast.error("Profile not found in database.");
        setLoading(false);
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const redirectTo = params.get('redirect');

      setTimeout(() => {
        if (profile.role === "admin") {
          toast.success("Welcome back, Admin");
          router.push(redirectTo || "/admin/dashboard");
        } else if (profile.is_approved) {
          toast.success("Welcome, Staff Member");
          router.push(redirectTo || "/portal/staff");
        } else {
          toast.error("Account pending approval.");
          supabase.auth.signOut();
        }
      }, 100);
      
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordReset() {
    if (!resetEmail) {
      toast.error("Please enter your email address");
      return;
    }

    setResetLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setResetSent(true);
      toast.success("Password reset link sent to your email!");
      
      setTimeout(() => {
        setShowResetSheet(false);
        setResetSent(false);
        setResetEmail("");
      }, 3000);
      
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email");
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-8 md:p-12 relative">
        
        <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-red-900 transition-colors text-xs font-bold uppercase tracking-widest">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="text-center mb-10 mt-4">
          <div className="w-16 h-16 bg-red-900 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-red-900/20">
            <Lock size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900">Portal Login</h1>
          <p className="text-slate-500 font-medium mt-2">Staff & Administration Access</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-400 ml-3">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <Input 
                name="email" 
                type="email" 
                placeholder="staff@school.com" 
                className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200" 
                required 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-400 ml-3">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <Input 
                name="password" 
                type="password" 
                placeholder="••••••••" 
                className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200" 
                required 
              />
            </div>
          </div>

          <div className="text-right">
            <button
              type="button"
              onClick={() => setShowResetSheet(true)}
              className="text-xs font-bold text-red-900 hover:underline focus:outline-none"
            >
              Forgot Password?
            </button>
          </div>

          <Button disabled={loading} className="w-full h-12 rounded-xl bg-red-900 hover:bg-red-800 text-white font-bold text-lg shadow-lg shadow-red-900/20">
            {loading ? <Loader2 className="animate-spin" /> : <span className="flex items-center gap-2">Login <ArrowRight size={18}/></span>}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">
            New Staff? <Link href="/signup" className="text-red-900 font-black hover:underline">Create Account</Link>
          </p>
        </div>
      </div>

      <Sheet open={showResetSheet} onOpenChange={setShowResetSheet}>
        <SheetContent className="sm:max-w-md bg-white p-6">
          <SheetHeader className="mb-6">
            <div className="flex items-center justify-between">
              <div className="bg-red-50 p-3 rounded-xl">
                <KeyRound className="text-red-900 w-6 h-6" />
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full"
                onClick={() => setShowResetSheet(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <SheetTitle className="text-2xl font-black text-slate-900 mt-4">
              Reset Password
            </SheetTitle>
            <SheetDescription className="text-slate-500">
              {resetSent 
                ? "Check your email for the reset link" 
                : "Enter your email address and we'll send you a link to reset your password"
              }
            </SheetDescription>
          </SheetHeader>

          {!resetSent ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 ml-3">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
                  <Input
                    type="email"
                    placeholder="staff@school.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-12 rounded-xl border-slate-200 font-bold"
                  onClick={() => setShowResetSheet(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 h-12 rounded-xl bg-red-900 hover:bg-red-800 text-white font-bold"
                  onClick={handlePasswordReset}
                  disabled={resetLoading}
                >
                  {resetLoading ? <Loader2 className="animate-spin w-4 h-4" /> : "Send Reset Link"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="text-green-600 w-8 h-8" />
              </div>
              <p className="text-slate-600 text-sm mb-2">
                Reset link sent to:
              </p>
              <p className="font-bold text-slate-900 text-lg">
                {resetEmail}
              </p>
              <p className="text-xs text-slate-400 mt-4">
                Didn't receive it? Check your spam folder or try again.
              </p>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}