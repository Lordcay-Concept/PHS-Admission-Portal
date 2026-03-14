"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { GraduationCap, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function StudentCheckPage() {
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase
      .from("students")
      .select("admission_number")
      .eq("admission_number", id.trim().toUpperCase())
      .maybeSingle();

    if (error || !data) {
      toast.error("Admission Number not found. Check and try again.");
      setLoading(false);
    } else {
      localStorage.setItem("student_id", data.admission_number);
      router.push("/portal/student/dashboard");
      toast.success("Identity Verified!");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/clean-gray-paper.png')]">
      <Card className="w-full max-w-md p-10 md:p-14 rounded-[3rem] shadow-2xl border-none relative overflow-hidden bg-white">
        <div className="absolute top-0 right-0 w-40 h-40 bg-red-900/5 rounded-full -mr-20 -mt-20" />
        
        <div className="relative z-10 text-center">
          <div className="w-24 h-24 bg-red-900 rounded-[2rem] flex items-center justify-center text-white mx-auto mb-8 shadow-2xl shadow-red-900/30 rotate-3">
            <GraduationCap size={48} />
          </div>
          
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Student Portal</h1>
          <p className="text-slate-400 font-medium mb-12">Enter your Admission Number to access your dashboard</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black uppercase tracking-widest text-red-900 ml-5">Registration ID</label>
              <Input 
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="PHS/YEAR/NO."
                className="h-16 rounded-2xl border-slate-200 bg-slate-50 text-xl font-bold px-8 focus:ring-red-900 uppercase placeholder:text-slate-300"
                required
              />
            </div>

            <Button disabled={loading} className="w-full h-16 rounded-2xl bg-red-900 hover:bg-red-800 text-white font-bold text-lg transition-all hover:scale-[1.02] shadow-xl shadow-red-900/20">
              {loading ? <Loader2 className="animate-spin" /> : <span className="flex items-center gap-2">Verify & Enter <ArrowRight size={20}/></span>}
            </Button>
          </form>

          <div className="mt-12 pt-8 border-t border-slate-50 flex items-center justify-center gap-2 text-slate-300">
            <ShieldCheck size={16} />
            <p className="text-[10px] font-black uppercase tracking-widest">Authorized Student Access Only</p>
          </div>
        </div>
      </Card>
    </div>
  );
}