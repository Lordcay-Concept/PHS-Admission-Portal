"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Printer, FileText, ChevronLeft, GraduationCap, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function TranscriptManager() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [transcriptData, setTranscriptData] = useState<any>(null);
  
const [logo, setLogo] = useState<string | null>("/images/logo/PHS Logo.webp");
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const fetchTranscript = async () => {
    if (!searchQuery) return toast.error("Enter a Student ID or Name");
    setLoading(true);

    try {
      const { data: student, error: sErr } = await supabase
        .from("students")
        .select("*")
        .or(`full_name.ilike.%${searchQuery}%,admission_no.eq.${searchQuery}`)
        .single();

      if (sErr || !student) throw new Error("Student not found");

      const { data: results, error: rErr } = await supabase
        .from("results")
        .select("*")
        .eq("student_id", student.id)
        .eq("is_approved", true)
        .order("session", { ascending: true });

      if (rErr) throw rErr;

      const grouped = results.reduce((acc: any, item: any) => {
        const key = `${item.class} (${item.session})`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      }, {});

      const allScores = results.map(r => r.total || 0);
      const cumulativeAverage = allScores.length > 0 
        ? (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(2) 
        : "0.00";

      setTranscriptData({ student, grouped, cumulativeAverage, totalSubjects: allScores.length });
      toast.success("Academic records retrieved.");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto min-h-screen bg-slate-50 relative">
      <div className="print:hidden space-y-6 mb-8">
        <Link href="/admin/dashboard" className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
          <ChevronLeft size={14} /> Back to Dashboard
        </Link>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 flex gap-4 bg-white p-4 rounded-2xl shadow-sm border">
            <Input 
              placeholder="Search Name or Admission Number..." 
              className="h-12 rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button onClick={fetchTranscript} disabled={loading} className="h-12 px-8 bg-red-900 rounded-xl">
              {loading ? <Loader2 className="animate-spin" /> : <Search size={18} />}
            </Button>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">School Logo</span>
            <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 p-2 rounded-lg transition-colors">
              <ImageIcon size={20} className="text-slate-600" />
              <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
            </label>
          </div>
        </div>
      </div>

      {transcriptData ? (
        <div className="bg-white p-12 rounded-[2rem] shadow-xl border relative overflow-hidden print:shadow-none print:border-none print:p-0">
          
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] -rotate-45">
            <p className="text-[120px] font-black uppercase select-none tracking-widest text-slate-900">
              OFFICIAL
            </p>
          </div>

          <div className="relative z-10 text-center space-y-4 border-b-4 border-double border-slate-900 pb-8 mb-10">
            {logo ? (
              <img src={logo} alt="School Logo" className="w-24 h-24 mx-auto object-contain mb-2" />
            ) : (
              <div className="w-20 h-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-full mx-auto flex items-center justify-center text-slate-300 print:hidden">
                <ImageIcon size={32} />
              </div>
            )}
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900">Providence High School</h1>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">Knowledge • Discipline • Excellence</p>
              <div className="mt-4 inline-block px-4 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                Official Academic Transcript
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-10 text-sm border-b pb-8 border-slate-100">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Student Particulars</p>
              <p className="text-xl font-black text-slate-900 uppercase">{transcriptData.student.full_name}</p>
              <p className="text-slate-500 font-medium">Gender: {transcriptData.student.gender || "N/A"}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Registration Details</p>
              <p className="text-xl font-black text-slate-900">{transcriptData.student.admission_no || "N/A"}</p>
              <p className="text-slate-500 font-medium italic underline decoration-red-900">Transcript No: #PHS-{Math.floor(1000 + Math.random() * 9000)}</p>
            </div>
          </div>

          <div className="space-y-12 mb-12">
            {Object.entries(transcriptData.grouped).map(([title, scores]: any) => (
              <div key={title} className="relative">
                <h3 className="text-sm font-black uppercase text-slate-900 border-l-4 border-red-900 pl-3 mb-4">{title}</h3>
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-black uppercase text-slate-500 text-left">
                      <th className="p-3 rounded-l-lg">Subject Description</th>
                      <th className="p-3 text-center">Score (%)</th>
                      <th className="p-3 rounded-r-lg text-right">Letter Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {scores.map((s: any) => (
                      <tr key={s.id} className="text-xs font-bold text-slate-700">
                        <td className="p-4 uppercase tracking-tight">{s.subject}</td>
                        <td className="p-4 text-center font-black text-slate-900 text-sm">{s.total}</td>
                        <td className="p-4 text-right">
                          <span className="inline-block w-8 h-8 bg-slate-100 rounded-md leading-8 text-center font-black text-red-900">
                            {s.grade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          <div className="p-8 bg-slate-900 rounded-3xl text-white flex justify-between items-center shadow-lg shadow-slate-900/20">
            <div className="flex items-center gap-5">
               <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                  <GraduationCap size={28} className="text-white" />
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase text-red-300 tracking-widest">Cumulative GPA Summary</p>
                  <p className="text-sm font-medium text-slate-400 italic">This student successfully completed {transcriptData.totalSubjects} approved subjects.</p>
               </div>
            </div>
            <div className="text-right">
               <p className="text-[10px] font-black uppercase text-red-300 tracking-widest">Global Percentage</p>
               <p className="text-4xl font-black">{transcriptData.cumulativeAverage}%</p>
            </div>
          </div>

          <div className="mt-20 pt-10 border-t-2 border-slate-100 flex justify-between items-end">
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-slate-400">Date of Issue</p>
                <p className="font-bold text-slate-900">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              </div>
              <div className="p-4 border border-slate-100 bg-slate-50/50 rounded-xl text-[9px] text-slate-400 uppercase max-w-[250px] leading-relaxed">
                This document is invalid without the official school embossed seal and the registrar's original signature.
              </div>
            </div>
            <div className="text-center space-y-6">
              <div className="w-56 h-20 flex items-center justify-center italic text-slate-300">
                (Official Seal Here)
              </div>
              <div className="w-64 border-b-2 border-slate-900 mx-auto"></div>
              <p className="text-[10px] font-black uppercase text-slate-900 tracking-[0.2em]">Registrar / School Head</p>
            </div>
          </div>

          <Button onClick={() => window.print()} className="mt-12 w-full h-14 bg-red-900 hover:bg-red-800 text-white print:hidden gap-3 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-red-900/20">
            <Printer size={20} /> Print Official Transcript
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-40 text-slate-300">
          <FileText size={64} className="mb-4 opacity-10" />
          <p className="font-black uppercase tracking-[0.3em] text-xs">Awaiting Student Selection</p>
        </div>
      )}
    </div>
  );
}