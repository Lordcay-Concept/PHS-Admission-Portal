"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Printer, Loader2, AlertCircle, ChevronLeft, Plus, Eye, EyeOff, Save, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ClassRegisterPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("2ND TERM");
  const [selectedSession, setSelectedSession] = useState("2025/2026");

  const [weeks, setWeeks] = useState([{ id: 1, isVisible: true }]); 
  const [showAllWeeks, setShowAllWeeks] = useState(false);
  const [attendance, setAttendance] = useState<Record<string, Record<number, Record<number, boolean>>>>({});
  
  const days = ["M", "T", "W", "Th","F"];

  const fetchRegisterData = async () => {
    if (!selectedClass) {
        toast.error("Please select a class first");
        return;
    }
    
    setLoading(true);
    
    const { data: studentData, error: sError } = await supabase
      .from("students")
      .select("admission_number, first_name, surname")
      .eq("current_class", selectedClass)
      .or("registration_status.eq.active,registration_status.eq.pending_registration")
      .order("surname", { ascending: true });

    if (sError) {
      toast.error("Error fetching students");
      setLoading(false);
      return;
    }

    const { data: attendanceData } = await supabase
      .from("attendance")
      .select("*")
      .eq("term", selectedTerm)
      .eq("session", selectedSession);

    const loadedAtt: any = {};
    let maxWeek = 1;

    studentData?.forEach(s => { loadedAtt[s.admission_number] = {}; });

    if (attendanceData) {
      attendanceData.forEach(rec => {
        if (loadedAtt[rec.student_id]) {
          if (!loadedAtt[rec.student_id][rec.week_number]) loadedAtt[rec.student_id][rec.week_number] = {};
          loadedAtt[rec.student_id][rec.week_number][rec.day_index] = rec.status;
          if (rec.week_number > maxWeek) maxWeek = rec.week_number;
        }
      });
    }

    setStudents(studentData || []);
    setAttendance(loadedAtt);
    
    setWeeks(Array.from({ length: maxWeek }, (_, i) => ({ 
        id: i + 1, 
        isVisible: i + 1 === maxWeek 
    })));
    setLoading(false);
  };

  const addNewWeek = () => {
    const newWeekId = weeks.length + 1;
    setWeeks(prev => {
      const closedPrevious = prev.map(w => ({ ...w, isVisible: false }));
      return [...closedPrevious, { id: newWeekId, isVisible: true }];
    });
    setShowAllWeeks(false);
    toast.info(`Week ${newWeekId} opened`);
  };

  const saveAttendance = async () => {
    setIsSaving(true);
    const payload: any[] = [];

    Object.entries(attendance).forEach(([studentId, weeksObj]) => {
      Object.entries(weeksObj).forEach(([weekId, daysObj]) => {
        Object.entries(daysObj).forEach(([dayIdx, status]) => {
          payload.push({
            student_id: studentId,
            week_number: parseInt(weekId),
            day_index: parseInt(dayIdx),
            status: status,
            term: selectedTerm,
            session: selectedSession
          });
        });
      });
    });

    if (payload.length === 0) {
      setIsSaving(false);
      return toast.error("No changes to save.");
    }

    const { error } = await supabase
      .from("attendance")
      .upsert(payload, { onConflict: 'student_id,week_number,day_index,term,session' });

    if (error) toast.error("Save failed: " + error.message);
    else toast.success("Attendance updated successfully!");
    setIsSaving(false);
  };

  const toggleAttendance = (studentId: string, weekId: number, dayIndex: number) => {
    setAttendance(prev => {
      const studentRecord = prev[studentId] || {};
      const weekRecord = studentRecord[weekId] || {};
      return {
        ...prev,
        [studentId]: {
          ...studentRecord,
          [weekId]: { ...weekRecord, [dayIndex]: !(weekRecord[dayIndex] || false) }
        }
      };
    });
  };

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex justify-between items-center mb-6">
            <Link href="/portal/staff" className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase hover:text-red-900 transition-colors">
                <ChevronLeft size={16} /> Dashboard
            </Link>
            <div className="flex gap-2 print:hidden">
                <Button 
                    onClick={() => setShowAllWeeks(!showAllWeeks)} 
                    variant="outline" 
                    className="rounded-xl font-bold text-xs h-11"
                    disabled={students.length === 0}
                >
                    {showAllWeeks ? <EyeOff size={16} className="mr-2"/> : <Eye size={16} className="mr-2"/>}
                    {showAllWeeks ? "Hide Old" : "View All"}
                </Button>
                <Button 
                    onClick={addNewWeek} 
                    variant="secondary" 
                    className="rounded-xl font-bold text-xs h-11"
                    disabled={students.length === 0}
                >
                    <Plus size={16} className="mr-2" /> New Week
                </Button>
                <Button onClick={saveAttendance} disabled={isSaving || students.length === 0} className="bg-red-900 text-white rounded-xl px-6 font-black h-11">
                    {isSaving ? <Loader2 className="animate-spin" /> : <Save size={18} className="mr-2"/>} SAVE
                </Button>
                <button onClick={() => window.print()} className="p-2 bg-white border rounded-xl hover:bg-slate-100"><Printer size={20}/></button>
            </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 mb-8 flex flex-wrap gap-4 items-end print:hidden">
            <div className="flex-1 min-w-[200px]">
                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Select Class</label>
                <select 
                    value={selectedClass} 
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full bg-slate-100 border-none rounded-xl h-12 px-4 font-bold text-slate-700 focus:ring-2 focus:ring-red-900"
                >
                    <option value="">Choose Class...</option>
                    <option value="JSS 1">JSS 1</option>
                    <option value="JSS 2">JSS 2</option>
                    <option value="JSS 3">JSS 3</option>
                    <option value="SSS 1">SSS 1</option>
                    <option value="SSS 2">SSS 2</option>
                    <option value="SSS 3">SSS 3</option>
                </select>
            </div>
            <div className="flex-1 min-w-[150px]">
                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Term</label>
                <select value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)} className="w-full bg-slate-100 border-none rounded-xl h-12 px-4 font-bold text-slate-700">
                    <option value="1ST TERM">1ST TERM</option>
                    <option value="2ND TERM">2ND TERM</option>
                    <option value="3RD TERM">3RD TERM</option>
                </select>
            </div>
            <Button onClick={fetchRegisterData} className="h-12 bg-slate-900 text-red-900 rounded-xl px-8 font-bold gap-2">
                <Filter size={18} /> Load Students
            </Button>
        </div>

        {loading ? (
          <div className="py-20 text-center bg-white rounded-[2rem] shadow-sm">
            <Loader2 className="animate-spin mx-auto text-red-900 mb-4" size={40} />
            <p className="font-black text-slate-400 text-xs uppercase tracking-widest">Syncing Records...</p>
          </div>
        ) : students.length > 0 ? (
          <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
             <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-xs border-collapse">
                    <thead className="bg-slate-900 text-white text-[10px] uppercase">
                        <tr>
                            <th className="p-4 text-center border-r border-slate-700">S/N</th>
                            <th className="p-4 text-left min-w-[220px] border-r border-slate-700">Student Identity</th>
                            {weeks.map(w => (w.isVisible || showAllWeeks) && (
                                <th key={w.id} colSpan={5} className="text-center bg-slate-800 border-r border-slate-700 p-2">
                                    Week {w.id}
                                    <div className="flex mt-2 justify-around opacity-60">
                                        {days.map(d => <span key={d} className="text-[8px]">{d}</span>)}
                                    </div>
                                </th>
                            ))}
                            <th className="p-4 bg-red-950">Pres.</th>
                            <th className="p-4 bg-red-950">%</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((s, i) => {
                            const stats = (id: string) => {
                                let p = 0;
                                Object.values(attendance[id] || {}).forEach(w => Object.values(w).forEach(d => { if(d) p++ }));
                                return { p, pct: Math.round((p / (weeks.length * 5)) * 100) || 0 };
                            };
                            const st = stats(s.admission_number);
                            return (
                                <tr key={s.admission_number} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                    <td className="p-4 text-center font-bold text-slate-400">{i + 1}</td>
                                    <td className="p-4 font-black text-slate-800 uppercase leading-tight">
                                        {s.surname} {s.first_name}
                                        <p className="text-[9px] font-normal text-slate-400">{s.admission_number}</p>
                                    </td>
                                    {weeks.map(w => (w.isVisible || showAllWeeks) && days.map((day, dIdx) => {
                                        const isPresent = attendance[s.admission_number]?.[w.id]?.[dIdx] || false;
                                        return (
                                            <td key={dIdx} className="p-0 border-r border-slate-50 w-10">
                                                <button 
                                                    onClick={() => toggleAttendance(s.admission_number, w.id, dIdx)}
                                                    className={`w-full h-12 font-black transition-all ${isPresent ? "bg-green-500 text-white" : "text-slate-200 hover:bg-slate-100"}`}
                                                >
                                                    {isPresent ? "P" : "•"}
                                                </button>
                                            </td>
                                        );
                                    }))}
                                    <td className="p-4 text-center font-black bg-slate-50 text-red-900">{st.p}</td>
                                    <td className={`p-4 text-center font-black ${st.pct < 50 ? 'text-red-500' : 'text-green-600'}`}>{st.pct}%</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
             </div>
          </div>
        ) : (
            <div className="py-20 text-center bg-white rounded-[2rem] shadow-sm border-2 border-dashed border-slate-200">
                <AlertCircle size={48} className="mx-auto text-slate-200 mb-4" />
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No Class Selected</p>
                <p className="text-slate-300 text-xs mt-1">Select class and session above to load student records</p>
            </div>
        )}
      </div>
    </div>
  );
}