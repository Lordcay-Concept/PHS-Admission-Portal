"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { FilePlus, Save, Loader2, Plus, Trash2, ArrowLeft} from "lucide-react";

export default function UploadResult() {
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([{ subject: "", score: "" }]);

  const addSubject = () => setSubjects([...subjects, { subject: "", score: "" }]);
  const removeSubject = (index: number) => setSubjects(subjects.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    const resultData = {
      student_name: formData.get("first_name") + " " + formData.get("surname"),
      student_id: formData.get("student_id"),
      class: formData.get("class"),
      term: formData.get("term"),
      session: formData.get("session"),
      marks: subjects, 
      is_approved: false, 
    };

    const { error } = await supabase.from("results").insert([resultData]);

    setLoading(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Result uploaded! Awaiting admin approval.");
      (e.target as HTMLFormElement).reset();
      setSubjects([{ subject: "", score: "" }]);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
                 <Link href="/admin/dashboard" className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2 mb-2"><ArrowLeft size={14}/> Dashboard</Link>
        <div className="flex items-center gap-4 mb-10">
          <div className="bg-red-900 p-3 rounded-2xl text-white"><FilePlus /></div>
          <h1 className="text-3xl font-black text-slate-900 uppercase">Upload Result</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-400 ml-2">Full Name</label>
              <input name="name" required className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-red-900" placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-400 ml-2">Student ID/Reg No</label>
              <input name="student_id" required className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-red-900" placeholder="PHS/2024/001" />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <select name="class" className="p-4 rounded-2xl bg-slate-50 border-none outline-red-900 text-sm">
              <option>JSS 1</option><option>JSS 2</option><option>JSS 3</option>
              <option>SSS 1</option><option>SSS 2</option><option>SSS 3</option>
            </select>
            <select name="term" className="p-4 rounded-2xl bg-slate-50 border-none outline-red-900 text-sm">
              <option>First Term</option><option>Second Term</option><option>Third Term</option>
            </select>
            <input name="session" placeholder="2024/2025" className="p-4 rounded-2xl bg-slate-50 border-none outline-red-900 text-sm" />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Subject Scores</h3>
              <Button type="button" onClick={addSubject} variant="outline" className="rounded-full gap-2 text-xs"><Plus size={14}/> Add Subject</Button>
            </div>
            {subjects.map((s, i) => (
              <div key={i} className="flex gap-4 items-center">
                <input 
                  placeholder="Subject (e.g. Maths)" 
                  className="flex-1 p-3 rounded-xl bg-slate-50 border-none text-sm"
                  onChange={(e) => {
                    const newSubs = [...subjects];
                    newSubs[i].subject = e.target.value;
                    setSubjects(newSubs);
                  }}
                />
                <input 
                  placeholder="Score" 
                  type="number" 
                  className="w-24 p-3 rounded-xl bg-slate-50 border-none text-sm"
                  onChange={(e) => {
                    const newSubs = [...subjects];
                    newSubs[i].score = e.target.value;
                    setSubjects(newSubs);
                  }}
                />
                <button type="button" onClick={() => removeSubject(i)} className="text-red-400 hover:text-red-600"><Trash2 size={18}/></button>
              </div>
            ))}
          </div>

          <Button disabled={loading} className="w-full py-8 bg-red-900 rounded-2xl font-bold text-lg">
            {loading ? <Loader2 className="animate-spin" /> : "Save & Submit for Approval"}
          </Button>
        </form>
      </div>
    </main>
  );
}