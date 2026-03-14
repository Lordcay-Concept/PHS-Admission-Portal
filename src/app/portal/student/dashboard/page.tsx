"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, User, FileText, ArrowRight, Loader2, Mail, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function StudentDashboard() {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      const id = localStorage.getItem("student_id");
      if (!id) {
        router.push("/portal/student/check");
        return;
      }

      const { data } = await supabase
        .from("students")
        .select("first_name, surname, passport_url, admission_number, current_class")
        .eq("admission_number", id)
        .single();

      if (data) setStudent(data);
      setLoading(false);
    };
    fetchStudent();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("student_id");
    router.push("/");
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-red-900" size={40} />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-10 pt-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700 px-4">
      
      <div className="bg-[#8B1D1D] rounded-[3.5rem] p-8 md:p-14 text-white relative overflow-hidden shadow-2xl border-b-8 border-red-950">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          
          <div className="relative">
            <div className="w-40 h-40 md:w-48 md:h-48 rounded-[2.5rem] bg-black/20 border-2 border-white/10 overflow-hidden shadow-2xl flex items-center justify-center backdrop-blur-sm">
              {student?.passport_url ? (
                <img 
                  src={student.passport_url} 
                  alt={`${student.first_name}'s Profile`} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center space-y-2 opacity-40">
                  <User size={60} strokeWidth={1} className="mx-auto" />
                  <p className="text-[8px] font-black uppercase tracking-widest">No Passport</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="inline-flex items-center gap-2 bg-black/20 px-4 py-1.5 rounded-full backdrop-blur-md mb-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">Student Portal Active</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-black mb-2 tracking-tighter">
              Welcome, {student?.first_name || "Student"}!
            </h1>
            
            <p className="text-red-100 text-lg font-medium opacity-90 leading-relaxed max-w-xl">
              Manage your profile, check results, and track your progress all in one place.
            </p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
               <div className="bg-black/30 px-5 py-2 rounded-full border border-white/5 inline-flex items-center">
                  <p className="font-bold tracking-widest text-sm text-red-100">{student?.admission_number}</p>
               </div>
               {student?.current_class && (
              <div className="bg-black/30 px-5 py-2 rounded-full border border-white/5 inline-flex items-center">
              <p className="font-bold tracking-widest text-sm text-red-100 uppercase">{student.current_class}</p>
            </div>
              )}
            </div>
          </div>
        </div>

        <GraduationCap className="absolute bottom-[-40px] right-10 text-white/5 w-80 h-80 -rotate-12" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-12 rounded-[3.5rem] border-none shadow-sm bg-white relative">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Student Services</h2>
              <p className="text-slate-500 font-medium">Quick access to your student tools</p>
            </div>
          </div>
          
          <div className="grid gap-4">
            {[
              { text: "Update Bio-Data Records", sub: "Personal information & Settings", icon: User, path: "/portal/student/profile" },
              { text: "View Academic Report", sub: "Terminal results & Grades", icon: FileText, path: "/portal/student/result" },
              { text: "Learning Resources", sub: "Course materials & Syllabus", icon: BookOpen, path: "/portal/student/materials" }
            ].map((step, i) => (
              <div 
                key={i} 
                onClick={() => router.push(step.path)}
                className="flex items-center justify-between group bg-slate-50 hover:bg-white hover:shadow-xl hover:scale-[1.02] p-6 rounded-[2.5rem] transition-all border border-transparent hover:border-slate-100 cursor-pointer"
              >
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-slate-900 group-hover:bg-[#8B1D1D] group-hover:text-white transition-colors">
                    <step.icon size={24} />
                  </div>
                  <div>
                    <span className="block font-black text-slate-900 uppercase text-sm tracking-tight">{step.text}</span>
                    <span className="text-xs text-slate-400 font-medium">{step.sub}</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-red-50 group-hover:text-[#8B1D1D] transition-all">
                  <ArrowRight size={18} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-8">
          <Card className="p-10 rounded-[3rem] bg-[#0A1128] text-white flex flex-col justify-between shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#8B1D1D]/20 rounded-full blur-3xl group-hover:bg-[#8B1D1D]/40 transition-all" />
            <div className="relative z-10">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-8">
                <Mail className="text-red-400" />
              </div>
              <h2 className="text-3xl font-black mb-4 tracking-tight uppercase leading-none">Help <br/>Desk</h2>
              <p className="text-slate-400 font-medium leading-relaxed mb-8 text-sm">
                Need help? Reach out to the admin office for portal issues.
              </p>
              <p className="text-red-400 text-xs font-black mb-6 break-all">SUPPORT@POSSIBLEHEIGHTS.COM</p>
            </div>
            <Button className="w-full h-14 rounded-2xl bg-white text-slate-900 font-black hover:bg-slate-200 relative z-10">
              Contact Admin
            </Button>
          </Card>

          <Button 
            onClick={handleLogout}
            variant="outline"
            className="w-full h-16 rounded-[2rem] border-2 border-slate-200 font-black text-slate-500 hover:text-[#8B1D1D] hover:border-red-200 hover:bg-red-50 transition-all flex gap-3 uppercase text-[10px] tracking-[0.2em]"
          >
            <LogOut size={16} /> Secure Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}