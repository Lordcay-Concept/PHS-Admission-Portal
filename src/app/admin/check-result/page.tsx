"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Search, GraduationCap, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckResult() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData(e.currentTarget);
    const id = formData.get("student_id");

    const { data, error } = await supabase
      .from("results")
      .select("*")
      .eq("student_id", id)
      .eq("is_approved", true)
      .single();

    if (error || !data) {
      setError("Result not found or not yet published.");
    } else {
      setResult(data);
    }
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#FFFBF5] pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-black text-slate-900 mb-4">Student <span className="text-red-900">Portal</span></h1>
        <p className="text-slate-500 mb-12 font-medium">Enter your Registration Number to view your academic performance.</p>

        <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-2 mb-16">
          <input 
            name="student_id" 
            placeholder="PHS/2024/XXX" 
            required 
            className="flex-1 p-4 rounded-2xl border-2 border-slate-100 focus:border-red-900 outline-none shadow-sm font-bold"
          />
          <Button disabled={loading} className="bg-red-900 h-auto px-8 rounded-2xl">
            {loading ? "..." : <Search />}
          </Button>
        </form>

        {error && <p className="text-red-600 font-bold bg-red-50 p-4 rounded-xl inline-block">{error}</p>}

        {result && (
          <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 text-left print:shadow-none print:border-none">
            <div className="bg-red-900 p-10 text-white flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tight">{result.student_first_name} {result.student_surname}</h2>
                <p className="text-red-100 font-medium">{result.student_id} | {result.class}</p>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-xs uppercase font-black tracking-widest opacity-60">Session</p>
                <p className="font-bold">{result.session} {result.term}</p>
              </div>
            </div>

            <div className="p-10">
              <table className="w-full mb-10">
                <thead className="border-b-2 border-slate-100">
                  <tr>
                    <th className="py-4 text-slate-400 uppercase text-xs font-black">Subject</th>
                    <th className="py-4 text-right text-slate-400 uppercase text-xs font-black">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {result.marks.map((m: any, i: number) => (
                    <tr key={i}>
                      <td className="py-4 font-bold text-slate-700">{m.subject}</td>
                      <td className="py-4 text-right font-black text-red-900 text-lg">{m.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-between items-center border-t pt-8">
                <p className="text-slate-400 text-xs italic">This result is electronically generated and remains property of PHS.</p>
                <Button variant="outline" onClick={() => window.print()} className="rounded-xl gap-2 no-print">
                   <Printer size={16} /> Print Sheet
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}