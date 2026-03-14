"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";
import { UserPlus, Loader2, ArrowLeft } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const { error: authError } = await supabase.auth.signUp({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      options: {
        data: { full_name: formData.get("fullName") as string }
      }
    });

    if (authError) {
      toast.error(authError.message);
    } else {
      toast.success("Account created! You can now log in.");
      router.push("/login");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-8 md:p-12 relative">
        
        <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-red-900 transition-colors text-xs font-bold uppercase tracking-widest">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="text-center mb-10 mt-4">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-900 mx-auto mb-6">
            <UserPlus size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900">Staff Signup</h1>
          <p className="text-slate-500 font-medium mt-2">Create your teaching account.</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          <Input name="fullName" placeholder="Full Name" required className="h-12 rounded-xl bg-slate-50 border-slate-200" />
          <Input name="email" type="email" placeholder="Email Address" required className="h-12 rounded-xl bg-slate-50 border-slate-200" />
          <Input name="password" type="password" placeholder="Password" required className="h-12 rounded-xl bg-slate-50 border-slate-200" />

          <Button disabled={loading} className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg transition-all">
            {loading ? <Loader2 className="animate-spin" /> : "Create Account"}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">
            Already have an account? <Link href="/login" className="text-red-900 font-black hover:underline">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}