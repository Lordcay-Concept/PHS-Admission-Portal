"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";
import { Lock, Loader2, ArrowLeft, KeyRound } from "lucide-react";

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || !hash.includes('access_token')) {
      toast.error("Invalid or expired reset link");
    }
  }, []);

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      toast.success("Password updated successfully!");
      
      setTimeout(() => {
        router.push("/login");
      }, 2000);
      
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-8 md:p-12">
        
        <Link href="/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-red-900 transition-colors text-xs font-bold uppercase tracking-widest mb-8">
          <ArrowLeft size={16} /> Back to Login
        </Link>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-900 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-red-900/20">
            <KeyRound size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900">Set New Password</h1>
          <p className="text-slate-500 font-medium mt-2">Enter your new password below</p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-400 ml-3">New Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200"
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-400 ml-3">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200"
                required
              />
            </div>
          </div>

          <Button 
            disabled={loading} 
            className="w-full h-12 rounded-xl bg-red-900 hover:bg-red-800 text-white font-bold text-lg shadow-lg shadow-red-900/20"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Update Password"}
          </Button>
        </form>
      </div>
    </div>
  );
}