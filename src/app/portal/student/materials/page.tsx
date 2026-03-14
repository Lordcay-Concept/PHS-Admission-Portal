"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Search, Download, PlayCircle, FileText, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import Link from "next/link";

export default function StudentMaterials() {
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [filters, setFilters] = useState({ session: "", term: "" });

  const fetchMaterials = async () => {
    if (!filters.session || !filters.term) {
      toast.error("Please select both Session and Term");
      return;
    }

    setLoading(true);
    const id = localStorage.getItem("student_id");

    try {
      const { data: student, error: studentError } = await supabase
        .from("students")
        .select("current_class") 
        .eq("admission_number", id)
        .single();

      if (studentError) throw studentError;
      if (!student) {
        toast.error("Student record not found");
        setLoading(false);
        return;
      }

      console.log("Fetching for class:", student.current_class);
      console.log("Filters:", filters);

      const { data, error } = await supabase
        .from("school_materials") 
        .select("*")
        .eq("session", filters.session)
        .eq("term", filters.term)
        .eq("target_class", student.current_class); 

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Found materials:", data);
      setMaterials(data || []);
      setHasSearched(true);
      
      if (data?.length === 0) {
        toast.info("No materials uploaded for this term yet.");
      }
    } catch (err: any) {
      console.error("Error details:", err);
      toast.error("Error loading library: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (url: string) => {
    if (!url) {
      toast.error("No file URL available");
      return;
    }
    window.open(url, "_blank");
  };

  const getFileType = (item: any) => {
    if (item.type === "video") return "Video";
    if (item.type === "document") {
      const ext = item.content_url?.split('.').pop()?.toLowerCase();
      if (ext === 'pdf') return 'PDF';
      if (ext === 'doc' || ext === 'docx') return 'Word';
      return 'Document';
    }
    return "Document";
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pt-10 pb-20">
      <Link href="/portal/student/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-red-900 font-black text-[10px] uppercase transition-all">
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>
      
      <header>
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Learning Library</h1>
        <p className="text-slate-500 font-medium">Access your lesson notes and educational videos.</p>
      </header>

      <Card className="p-8 rounded-[2.5rem] border-none shadow-sm bg-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Academic Session</label>
            <Select onValueChange={(val) => setFilters({ ...filters, session: val })}>
              <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-bold">
                <SelectValue placeholder="Select Session" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2023/2024">2023/2024</SelectItem>
                <SelectItem value="2024/2025">2024/2025</SelectItem>
                <SelectItem value="2025/2026">2025/2026</SelectItem>
                <SelectItem value="2026/2027">2026/2027</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Academic Term</label>
            <Select onValueChange={(val) => setFilters({ ...filters, term: val })}>
              <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-bold">
                <SelectValue placeholder="Select Term" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="First Term">First Term</SelectItem>
                <SelectItem value="Second Term">Second Term</SelectItem>
                <SelectItem value="Third Term">Third Term</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={fetchMaterials} 
            disabled={loading} 
            className="h-14 rounded-2xl bg-red-900 text-white font-black hover:bg-red-800 shadow-lg shadow-red-900/20"
          >
            {loading ? <Loader2 className="animate-spin" /> : <><Search size={18} className="mr-2" /> Load Resources</>}
          </Button>
        </div>
      </Card>

      {hasSearched ? (
        materials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {materials.map((item, i) => {
              const fileType = getFileType(item);
              return (
                <Card key={item.id || i} className="p-8 rounded-[2.5rem] border-none shadow-sm hover:shadow-2xl hover:scale-[1.03] transition-all bg-white group flex flex-col justify-between">
                  <div>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${
                      item.type === 'video' 
                        ? 'bg-red-50 text-red-900 group-hover:bg-red-900 group-hover:text-white' 
                        : 'bg-slate-900 text-white'
                    }`}>
                      {item.type === 'video' ? <PlayCircle size={24} /> : <FileText size={24} />}
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase text-red-900 tracking-widest">
                        {fileType}
                      </span>
                      <h3 className="text-xl font-black text-slate-900 leading-tight group-hover:text-red-900 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-slate-400 text-xs font-medium line-clamp-2 mt-2">
                        Class: {item.target_class} • {item.term} • {item.session}
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleAction(item.content_url)}
                    className="w-full mt-8 h-12 rounded-xl bg-slate-50 text-slate-900 font-bold hover:bg-red-900 hover:text-white transition-all shadow-none group-hover:shadow-md"
                  >
                    {item.type === 'video' ? "Watch Lesson" : "Download"} <Download size={16} className="ml-2" />
                  </Button>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center space-y-4 text-slate-300">
             <AlertCircle size={64} className="mx-auto opacity-20" />
             <p className="font-bold uppercase tracking-widest text-sm">No materials found for this term</p>
          </div>
        )
      ) : (
        <div className="h-80 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-[3.5rem] text-slate-300 bg-white/50">
          <BookOpen size={64} className="mb-4 opacity-10" />
          <p className="font-black text-xs uppercase tracking-[0.3em] text-slate-400 text-center px-10">
            Select a session and term above <br/> to access your learning library
          </p>
        </div>
      )}
    </div>
  );
}