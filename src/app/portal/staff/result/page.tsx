"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";
import { 
  Save, RefreshCw, ClipboardCheck, 
  Loader2, ChevronLeft, History, Search, Filter, AlertCircle,
  CheckCircle, Clock4, User, BarChart3, Users, Target, Trophy, MessageSquareText,
  FileText, Printer
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export default function StaffResultPortal() {
  const [students, setStudents] = useState<any[]>([]);
  const [scores, setScores] = useState<any>({});
  const [summaries, setSummaries] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({ class: "", subject: "", term: "", session: "" });
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [sheetRejection, setSheetRejection] = useState<string | null>(null);

  const [historySummaries, setHistorySummaries] = useState<any[]>([]);
  const [searchingHistory, setSearchingHistory] = useState(false);
  const [histAdm, setHistAdm] = useState("");
  const [histSession, setHistSession] = useState("");
  const [histTerm, setHistTerm] = useState("");

  const [selectedHistorySummary, setSelectedHistorySummary] = useState<any>(null);
  const [isHistorySheetOpen, setIsHistorySheetOpen] = useState(false);
  
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [editingAllScores, setEditingAllScores] = useState<any>({});
  const [editingSummary, setEditingSummary] = useState<any>({});
  const [selectedSubjectForEdit, setSelectedSubjectForEdit] = useState<string>("");

  useEffect(() => {
    const getSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        fetchHistory(user.id);
      }
    };
    getSession();
  }, []);

  const stats = useMemo(() => {
    if (students.length === 0) return { classAverage: 0, studentStats: {} };
    const studentData = students.map(s => ({
      id: s.admission_number,
      total: scores[s.admission_number]?.total || 0,
    }));
    const sorted = [...studentData].sort((a, b) => b.total - a.total);
    const studentStats: any = {};
    let classSum = 0;

    studentData.forEach(s => {
      const position = sorted.findIndex(item => item.id === s.id) + 1;
      studentStats[s.id] = {
        grandTotal: s.total,
        average: (s.total).toFixed(1), 
        position: position
      };
      classSum += s.total;
    });

    return {
      classAverage: (classSum / students.length).toFixed(1),
      studentStats
    };
  }, [students, scores]);

  const loadData = async () => {
    if (!config.class || !config.subject || !config.term || !config.session) {
      return toast.error("Please select Session, Term, Class, and Subject first.");
    }
    
    setLoading(true);
    setSheetRejection(null); 
    try {
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("*")
        .eq("current_class", config.class)
        .eq("registration_status", "active")
        .order("surname", { ascending: true });

      if (studentError) throw studentError;

      const { data: existingSummaries } = await supabase
        .from("result_summaries")
        .select("*")
        .eq("class", config.class)
        .eq("term", config.term)
        .eq("session", config.session);

      const initialScores: any = {};
      const initialSummaries: any = {};

      studentData?.forEach(student => {
        const summary = existingSummaries?.find(s => s.student_id === student.admission_number);
        
        const subjectData = summary?.subject_scores?.[config.subject] || {};
        
        initialScores[student.admission_number] = {
          ca1: subjectData.ca1 || 0,
          ca2: subjectData.ca2 || 0,
          exam: subjectData.exam || 0,
          total: subjectData.total || 0,
          grade: subjectData.grade || ""
        };

        initialSummaries[student.admission_number] = {
          teacher_remark: summary?.teacher_remark || "",
          principal_comment: summary?.principal_comment || ""
        };
      });

      setStudents(studentData || []);
      setScores(initialScores);
      setSummaries(initialSummaries);
      toast.success("Spreadsheet loaded.");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStudentsOnly = async (classname: string, term: string, session: string) => {
    setLoading(true);
    try {
      const { data: studentData } = await supabase
        .from("students")
        .select("*")
        .eq("current_class", classname)
        .eq("registration_status", "active")
        .order("surname", { ascending: true });
      
      if (studentData) {
        setStudents(studentData || []);
        
        const emptyScores: any = {};
        const emptySummaries: any = {};
        studentData.forEach((student: any) => {
          emptyScores[student.admission_number] = {
            ca1: 0, ca2: 0, exam: 0, total: 0, grade: ""
          };
          emptySummaries[student.admission_number] = {
            teacher_remark: "", principal_comment: ""
          };
        });
        
        setScores(emptyScores);
        setSummaries(emptySummaries);
        
        toast.success("Students loaded. Select a subject to edit.");
      }
    } catch (err) {
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const loadStudentForEdit = async (studentId: string, classname: string, term: string, session: string) => {
    setLoading(true);
    try {
      const { data: summaryData } = await supabase
        .from("result_summaries")
        .select("*")
        .eq("student_id", studentId)
        .eq("class", classname)
        .eq("term", term)
        .eq("session", session)
        .single();

      if (summaryData) {
        const allSubjects = summaryData.subject_scores || {};
        
        setEditingStudent({
          student_id: studentId,
          class: classname,
          term: term,
          session: session,
          ...summaryData
        });

        setEditingAllScores(allSubjects);
        
        const subjectList = Object.keys(allSubjects);
        if (subjectList.length > 0) {
          setSelectedSubjectForEdit(subjectList[0]);
        }

        setEditingSummary({
          teacher_remark: summaryData.teacher_remark || "",
          principal_comment: summaryData.principal_comment || ""
        });

        setIsEditSheetOpen(true);
      }
    } catch (err) {
      toast.error("Failed to load student data");
    } finally {
      setLoading(false);
    }
  };

  const handleEditScoreChange = (field: string, value: string) => {
    if (!selectedSubjectForEdit || !editingAllScores[selectedSubjectForEdit]) return;
    
    const numValue = parseFloat(value) || 0;
    const currentSubjectData = editingAllScores[selectedSubjectForEdit];
    
    const updated = { ...currentSubjectData, [field]: numValue };
    updated.total = (updated.ca1 || 0) + (updated.ca2 || 0) + (updated.exam || 0);
    updated.grade = calculateGrade(updated.total);
    
    setEditingAllScores({
      ...editingAllScores,
      [selectedSubjectForEdit]: updated
    });
  };

  const saveAllStudentEdits = async () => {
    if (!editingStudent) return;
    
    setLoading(true);
    try {
      const { data: existingSummary } = await supabase
        .from("result_summaries")
        .select("*")
        .eq("student_id", editingStudent.student_id)
        .eq("class", editingStudent.class)
        .eq("term", editingStudent.term)
        .eq("session", editingStudent.session)
        .single();

      const scoreValues = Object.values(editingAllScores) as any[];
      const totalSum = scoreValues.reduce((acc, curr) => acc + (curr.total || 0), 0);
      const avg = scoreValues.length ? (totalSum / scoreValues.length) : 0;

      const staffIds = new Set<string>();
      Object.values(editingAllScores).forEach((subj: any) => {
        if (subj.staff_id) staffIds.add(subj.staff_id);
      });

      const { error } = await supabase
        .from("result_summaries")
        .upsert({
          student_id: editingStudent.student_id,
          class: editingStudent.class,
          term: editingStudent.term,
          session: editingStudent.session,
          subject_scores: editingAllScores,
          average: parseFloat(avg.toFixed(2)),
          teacher_remark: editingSummary.teacher_remark || existingSummary?.teacher_remark || "",
          principal_comment: editingSummary.principal_comment || existingSummary?.principal_comment || "",
          is_approved: false,
          rejection_reason: null,
          staff_ids: Array.from(staffIds)
        }, { onConflict: 'student_id,term,class,session' });

      if (error) throw error;

      toast.success("All student results updated and sent for approval!");
      setIsEditSheetOpen(false);
      
      if (currentUserId) fetchHistory(currentUserId);
      
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (userId: string) => {
    setSearchingHistory(true);
    try {
      const { data, error } = await supabase
        .from("result_summaries")
        .select("*")
        .overlaps('staff_ids', [userId])
        .order("created_at", { ascending: false });
      if (error) throw error;
      setHistorySummaries(data || []);
    } catch (err: any) {
      toast.error("Failed to fetch history");
    } finally {
      setSearchingHistory(false);
    }
  };

  const handleSearchHistory = async () => {
    if (!currentUserId) return;
    setSearchingHistory(true);
    try {
      let query = supabase
        .from("result_summaries")
        .select("*")
        .overlaps('staff_ids', [currentUserId]);
      
      if (histAdm) query = query.ilike('student_id', `%${histAdm}%`);
      if (histSession) query = query.eq('session', histSession);
      if (histTerm) query = query.eq('term', histTerm);
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      setHistorySummaries(data || []);
    } catch (err: any) {
      toast.error("Search failed: " + err.message);
    } finally {
      setSearchingHistory(false);
    }
  };

  const calculateGrade = (total: number) => {
    if (total >= 70) return "A";
    if (total >= 60) return "B";
    if (total >= 50) return "C";
    if (total >= 45) return "D";
    if (total >= 40) return "E";
    return "F";
  };

  const handleScoreChange = (admNo: string, field: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    const updated = { ...scores[admNo], [field]: numValue };
    updated.total = (updated.ca1 || 0) + (updated.ca2 || 0) + (updated.exam || 0);
    updated.grade = calculateGrade(updated.total);
    setScores({ ...scores, [admNo]: updated });
  };

  const handleRemarkChange = (admNo: string, field: string, value: string) => {
    setSummaries({
      ...summaries,
      [admNo]: { ...summaries[admNo], [field]: value }
    });
  };

  const saveAll = async () => {
    if (students.length === 0) return;
    if (!config.subject) return toast.error("Please enter a subject name.");
    setLoading(true);

    try {
      const studentIds = students.map(s => s.admission_number);

      const { data: existingSummaries } = await supabase
        .from("result_summaries")
        .select("*")
        .in("student_id", studentIds)
        .eq("class", config.class)
        .eq("term", config.term)
        .eq("session", config.session);

      const summariesPayload = students.map(s => {
        const currentStudentScores = scores[s.admission_number];
        const existingRecord = existingSummaries?.find(ex => ex.student_id === s.admission_number);
        
        const existingSubjectScores = existingRecord?.subject_scores || {};
        
        const updatedSubjectScores = {
          ...existingSubjectScores,
          [config.subject]: {
            ca1: currentStudentScores.ca1,
            ca2: currentStudentScores.ca2,
            exam: currentStudentScores.exam,
            total: currentStudentScores.total,
            grade: currentStudentScores.grade,
            staff_id: currentUserId
          }
        };

        const scoreValues: any[] = Object.values(updatedSubjectScores);
        const totalSum = scoreValues.reduce((acc, curr) => acc + (curr.total || 0), 0);
        const avg = scoreValues.length ? (totalSum / scoreValues.length) : 0;

        const staffIds = new Set<string>();
        Object.values(updatedSubjectScores).forEach((subj: any) => {
          if (subj.staff_id) staffIds.add(subj.staff_id);
        });

        return {
          student_id: s.admission_number,
          class: config.class,
          term: config.term,
          session: config.session,
          subject_scores: updatedSubjectScores,
          average: parseFloat(avg.toFixed(2)),
          teacher_remark: summaries[s.admission_number]?.teacher_remark || existingRecord?.teacher_remark || "",
          principal_comment: summaries[s.admission_number]?.principal_comment || existingRecord?.principal_comment || "",
          is_approved: false,
          rejection_reason: null,
          staff_ids: Array.from(staffIds)
        };
      });

      const { error } = await supabase
        .from("result_summaries")
        .upsert(summariesPayload, { onConflict: 'student_id,term,class,session' });

      if (error) throw error;

      toast.success("Results submitted for admin approval!");
      setSheetRejection(null);
      if (currentUserId) fetchHistory(currentUserId);
      
      toast.info("Your changes are pending admin approval.");
      
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  function getOrdinal(n: number) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  }

  const calculateSummaryStats = (summary: any) => {
    const subjects = Object.entries(summary.subject_scores || {}).map(([name, data]: any) => ({
      name,
      ...data,
      grade: calculateGrade(data.total)
    }));
    
    const totalSubjects = subjects.length;
    const overallTotal = subjects.reduce((sum, subj) => sum + (subj.total || 0), 0);
    const overallAverage = totalSubjects > 0 ? (overallTotal / totalSubjects).toFixed(2) : "0.00";
    
    return { subjects, totalSubjects, overallTotal, overallAverage };
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto pb-32">
      <Link 
        href="/portal/staff" 
        className="inline-flex items-center gap-2 text-slate-500 hover:text-red-900 font-bold text-xs uppercase tracking-widest mb-6 transition-colors group"
      >
        <div className="p-2 rounded-full bg-slate-100 group-hover:bg-red-100 transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </div>
        Back to Dashboard
      </Link>

      <Tabs defaultValue="sheet" className="w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Result Management</h1>
            <p className="text-slate-500 font-medium tracking-tight">One student, one file. Master upload system.</p>
          </div>
          <TabsList className="bg-slate-200/50 p-1 rounded-xl h-auto border border-slate-200 shadow-sm">
            <TabsTrigger 
              value="sheet" 
              className="rounded-lg px-6 py-2 font-bold data-[state=active]:bg-red-900 data-[state=active]:text-white transition-all"
            >
              Score Entry
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="rounded-lg px-6 py-2 font-bold data-[state=active]:bg-red-900 data-[state=active]:text-white gap-2 transition-all"
            >
              <History className="w-4 h-4" /> Submission Ledger
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="sheet" className="space-y-6">
          {sheetRejection && (
            <div className="mb-6 bg-red-50 border-2 border-red-200 p-5 rounded-[2rem] flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="bg-red-500 p-2 rounded-xl text-white shadow-lg shadow-red-200">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Admin Correction Requested</h4>
                <p className="text-red-900 font-bold text-sm leading-tight">"{sheetRejection}"</p>
              </div>
            </div>
          )}

          <Card className="border-none shadow-xl bg-white overflow-hidden rounded-[2.5rem]">
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <div>
                <CardTitle className="text-xl font-black uppercase tracking-tight">Academic Spreadsheet</CardTitle>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Master File Mode</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={loadData} 
                  disabled={loading} 
                  variant="outline" 
                  className="rounded-xl gap-2 border-slate-700 text-white hover:bg-slate-800"
                >
                  {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <RefreshCw className="w-4 h-4" />} 
                  Refresh List
                </Button>
                <Button 
                  onClick={saveAll} 
                  disabled={loading || students.length === 0} 
                  className="rounded-xl gap-2 bg-red-900 hover:bg-red-800 text-white font-black uppercase text-xs px-8 shadow-lg shadow-red-900/20"
                >
                  <Save className="w-4 h-4" /> Update Student Folders
                </Button>
              </div>
            </div>
            
            <CardContent className="p-6 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <ConfigField 
                  label="Session" 
                  options={["2024/2025", "2025/2026"]} 
                  onValueChange={(v: string) => setConfig({ ...config, session: v })} 
                />
                <ConfigField 
                  label="Term" 
                  options={["1st Term", "2nd Term", "3rd Term"]} 
                  onValueChange={(v: string) => setConfig({ ...config, term: v })} 
                />
                <ConfigField 
                  label="Class" 
                  options={["JSS 1", "JSS 2", "JSS 3", "SSS 1", "SSS 2", "SSS 3"]} 
                  onValueChange={(v: string) => setConfig({ ...config, class: v })} 
                />
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Subject</label>
                  <Input 
                    className="bg-white rounded-xl h-12 border-slate-200 font-bold" 
                    placeholder="e.g. Mathematics" 
                    onChange={(e) => setConfig({ ...config, subject: e.target.value })} 
                  />
                </div>
              </div>

              {students.length > 0 ? (
                <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="font-bold uppercase text-[10px]">Student Identity</TableHead>
                        <TableHead className="text-center font-bold uppercase text-[10px]">CA1 (15)</TableHead>
                        <TableHead className="text-center font-bold uppercase text-[10px]">CA2 (15)</TableHead>
                        <TableHead className="text-center font-bold uppercase text-[10px]">Exam (70)</TableHead>
                        <TableHead className="font-bold text-center uppercase text-[10px] text-red-900">Total</TableHead>
                        <TableHead className="font-bold text-center uppercase text-[10px]">Grade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((s) => (
                        <TableRow key={s.admission_number} className="hover:bg-slate-50/50">
                          <TableCell className="font-bold text-slate-900">
                            {s.surname} {s.first_name}
                            <p className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">{s.admission_number}</p>
                          </TableCell>
                          <TableCell>
                            <ScoreInput 
                              value={scores[s.admission_number]?.ca1} 
                              onChange={(v) => handleScoreChange(s.admission_number, "ca1", v)} 
                            />
                          </TableCell>
                          <TableCell>
                            <ScoreInput 
                              value={scores[s.admission_number]?.ca2} 
                              onChange={(v) => handleScoreChange(s.admission_number, "ca2", v)} 
                            />
                          </TableCell>
                          <TableCell>
                            <ScoreInput 
                              value={scores[s.admission_number]?.exam} 
                              onChange={(v) => handleScoreChange(s.admission_number, "exam", v)} 
                            />
                          </TableCell>
                          <TableCell className="text-center font-black text-red-900 text-xl">
                            {scores[s.admission_number]?.total || 0}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="w-10 h-10 inline-flex items-center justify-center bg-slate-900 text-white rounded-xl font-black text-sm">
                              {scores[s.admission_number]?.grade || "-"}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                  <ClipboardCheck className="w-12 h-12 mx-auto text-slate-200 mb-4" />
                  <p className="text-slate-400 font-black uppercase text-xs tracking-widest">
                    Select filters and click "Refresh List" to begin entry
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {students.length > 0 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1 border-none shadow-lg bg-slate-900 text-white rounded-[2rem] p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-white/10 rounded-2xl">
                      <BarChart3 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-black uppercase text-sm tracking-tight">Class Insight</h3>
                      <p className="text-white/50 text-[10px] uppercase font-bold">{config.subject} Statistics</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <StatRow label="Total Students" value={students.length} icon={Users} />
                    <StatRow label="Class Average" value={`${stats.classAverage}%`} icon={Target} />
                  </div>
                </Card>

                <Card className="lg:col-span-2 border-none shadow-lg bg-white rounded-[2rem] p-6 overflow-hidden">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <h3 className="font-black uppercase text-slate-900 tracking-tight">Merit List & Position</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2">
                    {students.map((s) => {
                      const st = stats.studentStats[s.admission_number];
                      return (
                        <div key={s.admission_number} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <div>
                            <p className="font-black text-slate-800 text-xs uppercase leading-none mb-1">
                              {s.surname} {s.first_name}
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">
                              Total: {st.grandTotal} | Avg: {st.average}%
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] font-black text-slate-400 uppercase">Pos.</p>
                            <p className="text-xl font-black text-red-900 leading-none">
                              {st.position}<span className="text-[10px] ml-0.5 font-bold">{getOrdinal(st.position)}</span>
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>

              <Card className="border-none shadow-xl bg-white overflow-hidden rounded-[2.5rem]">
                <div className="bg-slate-100 p-6 border-b border-slate-200 flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <MessageSquareText className="text-slate-600 w-5 h-5" />
                  </div>
                  <h3 className="font-black text-slate-900 uppercase tracking-tight">Academic Remarks</h3>
                </div>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {students.map((s) => (
                      <div key={s.admission_number} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col md:flex-row gap-6 items-start">
                        <div className="min-w-[180px]">
                          <p className="font-black text-slate-900 uppercase text-xs mb-1">
                            {s.surname} {s.first_name}
                          </p>
                          <Badge className="bg-slate-200 text-slate-600 border-none font-bold text-[9px] uppercase">
                            {s.admission_number}
                          </Badge>
                        </div>
                        <div className="flex-1 w-full space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Teacher's Remark</label>
                          <Input 
                            placeholder="Enter remark..."
                            value={summaries[s.admission_number]?.teacher_remark || ""}
                            onChange={(e) => handleRemarkChange(s.admission_number, "teacher_remark", e.target.value)}
                            className="bg-white rounded-xl border-slate-200 h-11 text-sm font-medium"
                          />
                        </div>
                        <div className="flex-1 w-full space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Principal's Comment</label>
                          <Input 
                            placeholder="Enter comment..."
                            value={summaries[s.admission_number]?.principal_comment || ""}
                            onChange={(e) => handleRemarkChange(s.admission_number, "principal_comment", e.target.value)}
                            className="bg-white rounded-xl border-slate-200 h-11 text-sm font-medium"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
            
        <TabsContent value="history" className="space-y-6">
          <Card className="border-none shadow-sm bg-white rounded-[2.5rem] p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-50 text-red-900 rounded-2xl">
                  <Filter className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 uppercase tracking-tight text-xl leading-none">Record Archive</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Click any record to view full details
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Admission No.</label>
                <Input 
                  placeholder="Search ID..." 
                  value={histAdm} 
                  onChange={(e) => setHistAdm(e.target.value)} 
                  className="rounded-xl h-12 bg-white" 
                />
              </div>
              <ConfigField 
                label="Session" 
                options={["2023/2024", "2024/2025", "2025/2026"]} 
                onValueChange={setHistSession} 
              />
              <ConfigField 
                label="Term" 
                options={["1st Term", "2nd Term", "3rd Term"]} 
                onValueChange={setHistTerm} 
              />
              <Button 
                onClick={handleSearchHistory} 
                disabled={searchingHistory} 
                className="h-12 bg-slate-900 hover:bg-black rounded-xl font-black uppercase text-xs gap-2"
              >
                {searchingHistory ? <Loader2 className="animate-spin w-4 h-4" /> : <Search className="w-4 h-4" />} 
                Fetch Records
              </Button>
            </div>
          </Card>

          <div className="grid gap-4">
            {historySummaries.length > 0 ? (
              historySummaries.map((summary: any) => {
                const mySubjects = Object.entries(summary.subject_scores || {})
                  .filter(([_, data]: [string, any]) => data.staff_id === currentUserId)
                  .map(([subject, data]: [string, any]) => ({ subject, ...data }));
                
                const { overallTotal, overallAverage } = calculateSummaryStats(summary);

                return (
                  <Card 
                    key={summary.id} 
                    className="p-6 rounded-[2.5rem] border-none shadow-sm bg-white hover:ring-2 ring-red-900/5 transition-all cursor-pointer hover:shadow-md"
                    onClick={() => {
                      setSelectedHistorySummary(summary);
                      setIsHistorySheetOpen(true);
                    }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-xl">
                          {mySubjects.length}
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 text-lg uppercase tracking-tight">
                            Student: {summary.student_id}
                          </h4>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <Badge variant="secondary" className="text-[9px] font-black uppercase bg-slate-100 text-slate-500">
                              {summary.term} • {summary.session}
                            </Badge>
                            <Badge variant="outline" className="text-[9px] font-black uppercase border-slate-200">
                              {summary.class}
                            </Badge>
                          </div>
                          <div className="mt-2 grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <span className="text-slate-400">Overall Total:</span>
                              <span className="font-bold ml-1 text-slate-900">{overallTotal}</span>
                            </div>
                            <div>
                              <span className="text-slate-400">Average:</span>
                              <span className="font-bold ml-1 text-slate-900">{overallAverage}%</span>
                            </div>
                          </div>
                          <div className="mt-1 text-xs text-slate-600">
                            <span className="font-bold">Your subjects:</span> {mySubjects.map((s: any) => s.subject).join(', ')}
                          </div>
                          
                          {summary.rejection_reason && !summary.is_approved && (
                            <div className="mt-3 bg-red-50 p-3 rounded-xl border border-red-200">
                              <p className="text-[9px] font-black text-red-500 uppercase mb-1">Revision Required</p>
                              <p className="text-xs text-red-700 mb-2">"{summary.rejection_reason}"</p>
                              <Button 
                                size="sm"
                                className="bg-red-900 hover:bg-red-800 text-white h-8 px-3 rounded-lg text-[10px] font-black"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  loadStudentForEdit(
                                    summary.student_id,
                                    summary.class,
                                    summary.term,
                                    summary.session
                                  );
                                }}
                              >
                                Edit Full Record
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right min-w-[80px]">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Status</p>
                        {summary.is_approved ? (
                          <div className="flex items-center gap-1.5 text-green-600 font-black text-[10px] uppercase">
                            <CheckCircle className="w-3.5 h-3.5" /> Approved
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-amber-600 font-black text-[10px] uppercase">
                            <Clock4 className="w-3.5 h-3.5" /> Pending
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
                <User className="w-10 h-10 mx-auto text-slate-200 mb-2" />
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest leading-loose">
                  No submission history found.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Sheet open={isHistorySheetOpen} onOpenChange={setIsHistorySheetOpen}>
        <SheetContent className="sm:max-w-xl overflow-y-auto bg-slate-50 border-none p-6">
          <SheetHeader className="mb-8">
            <div className="flex justify-between items-start">
              <div className="bg-red-900 text-white p-2 rounded-xl">
                <FileText className="w-6 h-6" />
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-xl font-bold gap-2 text-slate-500" 
                onClick={() => window.print()}
              >
                <Printer className="w-4 h-4" /> Print
              </Button>
            </div>
            <SheetTitle className="text-3xl font-black uppercase tracking-tighter text-slate-900 mt-4">
              Submission Preview
            </SheetTitle>
          </SheetHeader>
          
          {selectedHistorySummary && (
            <div className="space-y-6 pb-12">
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Student Master File</p>
                <p className="text-2xl font-black text-slate-900">ID: {selectedHistorySummary.student_id}</p>
                <p className="text-sm font-bold text-red-900 mt-1">
                  {selectedHistorySummary.class} • {selectedHistorySummary.term} | {selectedHistorySummary.session}
                </p>
                <div className="mt-3 flex gap-2">
                  <Badge className={selectedHistorySummary.is_approved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
                    {selectedHistorySummary.is_approved ? 'Approved' : 'Pending'}
                  </Badge>
                </div>

                {selectedHistorySummary.rejection_reason && !selectedHistorySummary.is_approved && (
                  <div className="mt-4 bg-red-50 p-4 rounded-xl border-2 border-red-200">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="text-red-500 w-5 h-5 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">
                          Admin Correction Requested
                        </p>
                        <p className="text-sm text-red-700 font-medium mb-3">
                          "{selectedHistorySummary.rejection_reason}"
                        </p>
                        <Button 
                          className="bg-red-900 hover:bg-red-800 text-white h-10 px-4 rounded-xl text-xs font-black"
                          onClick={() => {
                            setIsHistorySheetOpen(false);
                            loadStudentForEdit(
                              selectedHistorySummary.student_id,
                              selectedHistorySummary.class,
                              selectedHistorySummary.term,
                              selectedHistorySummary.session
                            );
                          }}
                        >
                          Edit Full Record
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {(() => {
                const subjects = Object.entries(selectedHistorySummary.subject_scores || {});
                const totalSubjects = subjects.length;
                const overallTotal = subjects.reduce((sum: number, [_, data]: any) => sum + (data.total || 0), 0);
                const overallAverage = totalSubjects > 0 ? (overallTotal / totalSubjects).toFixed(2) : "0.00";
                
                const mySubjects = subjects
                  .filter(([_, data]: any) => data.staff_id === currentUserId)
                  .map(([name, data]: [string, any]) => ({ name, ...data }));
                
                return (
                  <>
                    <div className="grid grid-cols-3 gap-4">
                      <Card className="bg-blue-50 p-4 rounded-2xl border border-blue-200">
                        <p className="text-[8px] font-black text-blue-600 uppercase">Total Subjects</p>
                        <p className="text-2xl font-black text-blue-900">{totalSubjects}</p>
                      </Card>
                      <Card className="bg-purple-50 p-4 rounded-2xl border border-purple-200">
                        <p className="text-[8px] font-black text-purple-600 uppercase">Overall Total</p>
                        <p className="text-2xl font-black text-purple-900">{overallTotal}</p>
                      </Card>
                      <Card className="bg-green-50 p-4 rounded-2xl border border-green-200">
                        <p className="text-[8px] font-black text-green-600 uppercase">Average</p>
                        <p className="text-2xl font-black text-green-900">{overallAverage}%</p>
                      </Card>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Your Subject Entries</h4>
                      {mySubjects.length > 0 ? (
                        mySubjects.map((subj) => (
                          <Card key={subj.name} className="bg-white p-4 rounded-2xl border border-slate-100">
                            <div className="flex justify-between items-center mb-3">
                              <div className="flex items-center gap-2">
                                <h5 className="font-black text-slate-900 uppercase">{subj.name}</h5>
                                {selectedHistorySummary.rejection_reason && !selectedHistorySummary.is_approved && (
                                  <Badge className="bg-red-100 text-red-700 border-none text-[8px]">
                                    Needs Revision
                                  </Badge>
                                )}
                              </div>
                              <Badge className="bg-slate-900 text-white border-none text-[9px] font-bold">
                                Grade {calculateGrade(subj.total)}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                              <div className="text-center">
                                <p className="text-[8px] font-black text-slate-400">CA1</p>
                                <p className="font-bold text-lg">{subj.ca1}</p>
                                <p className="text-[8px] text-slate-400">/15</p>
                              </div>
                              <div className="text-center">
                                <p className="text-[8px] font-black text-slate-400">CA2</p>
                                <p className="font-bold text-lg">{subj.ca2}</p>
                                <p className="text-[8px] text-slate-400">/15</p>
                              </div>
                              <div className="text-center">
                                <p className="text-[8px] font-black text-slate-400">Exam</p>
                                <p className="font-bold text-lg">{subj.exam}</p>
                                <p className="text-[8px] text-slate-400">/70</p>
                              </div>
                              <div className="text-center bg-red-50 rounded-lg p-1">
                                <p className="text-[8px] font-black text-red-400">Total</p>
                                <p className="font-bold text-lg text-red-900">{subj.total}</p>
                                <p className="text-[8px] text-red-400">/100</p>
                              </div>
                            </div>
                          </Card>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500 italic">No subjects uploaded by you in this file.</p>
                      )}
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">All Subjects in File</h4>
                      <Card className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-slate-50">
                              <tr>
                                <th className="text-left p-3 text-[9px] font-black text-slate-400 uppercase">Subject</th>
                                <th className="text-center p-3 text-[9px] font-black text-slate-400 uppercase">CA1</th>
                                <th className="text-center p-3 text-[9px] font-black text-slate-400 uppercase">CA2</th>
                                <th className="text-center p-3 text-[9px] font-black text-slate-400 uppercase">Exam</th>
                                <th className="text-center p-3 text-[9px] font-black text-slate-400 uppercase">Total</th>
                                <th className="text-center p-3 text-[9px] font-black text-slate-400 uppercase">Grade</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(selectedHistorySummary.subject_scores || {}).map(([name, data]: any) => (
                                <tr key={name} className="border-t border-slate-100">
                                  <td className="p-3 font-bold text-slate-900">{name}</td>
                                  <td className="text-center p-3">{data.ca1}</td>
                                  <td className="text-center p-3">{data.ca2}</td>
                                  <td className="text-center p-3">{data.exam}</td>
                                  <td className="text-center p-3 font-bold text-red-900">{data.total}</td>
                                  <td className="text-center p-3">
                                    <Badge className="bg-slate-900 text-white text-[8px]">
                                      {calculateGrade(data.total)}
                                    </Badge>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </Card>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent className="sm:max-w-2xl overflow-y-auto bg-slate-50 border-none p-6">
          <SheetHeader className="mb-6">
            <div className="bg-red-900 text-white p-2 rounded-xl w-fit mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <SheetTitle className="text-2xl font-black uppercase tracking-tighter text-slate-900">
              Edit Student Full Record
            </SheetTitle>
            {editingStudent && (
              <p className="text-sm text-slate-500 mt-1">
                {editingStudent.student_id} • {editingStudent.class} • {editingStudent.term} {editingStudent.session}
              </p>
            )}
          </SheetHeader>

          {editingStudent && (
            <div className="space-y-6">
              {selectedHistorySummary?.rejection_reason && (
                <div className="bg-red-50 p-4 rounded-xl border-2 border-red-200">
                  <p className="text-[10px] font-black text-red-500 uppercase mb-1">Admin Feedback</p>
                  <p className="text-sm text-red-700">"{selectedHistorySummary.rejection_reason}"</p>
                </div>
              )}

              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-2">Select Subject to Edit</label>
                <Select value={selectedSubjectForEdit} onValueChange={setSelectedSubjectForEdit}>
                  <SelectTrigger className="w-full h-12 rounded-xl border-slate-200 font-bold">
                    <SelectValue placeholder="Choose a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(editingAllScores).map((subject) => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedSubjectForEdit && editingAllScores[selectedSubjectForEdit] && (
                <Card className="bg-white p-6 rounded-xl border border-slate-200">
                  <h4 className="text-sm font-black text-slate-900 uppercase mb-4">{selectedSubjectForEdit}</h4>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-[8px] font-black text-slate-500 uppercase block mb-1">CA 1 (15)</label>
                      <Input 
                        type="number"
                        value={editingAllScores[selectedSubjectForEdit].ca1}
                        onChange={(e) => handleEditScoreChange("ca1", e.target.value)}
                        className="h-12 text-center font-bold rounded-xl border-slate-200"
                        max="15"
                      />
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-slate-500 uppercase block mb-1">CA 2 (15)</label>
                      <Input 
                        type="number"
                        value={editingAllScores[selectedSubjectForEdit].ca2}
                        onChange={(e) => handleEditScoreChange("ca2", e.target.value)}
                        className="h-12 text-center font-bold rounded-xl border-slate-200"
                        max="15"
                      />
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-slate-500 uppercase block mb-1">Exam (70)</label>
                      <Input 
                        type="number"
                        value={editingAllScores[selectedSubjectForEdit].exam}
                        onChange={(e) => handleEditScoreChange("exam", e.target.value)}
                        className="h-12 text-center font-bold rounded-xl border-slate-200"
                        max="70"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <Card className="bg-slate-100 p-3 rounded-xl text-center">
                      <p className="text-[8px] font-black text-slate-500 uppercase">Total</p>
                      <p className="text-2xl font-black text-red-900">{editingAllScores[selectedSubjectForEdit].total}</p>
                    </Card>
                    <Card className="bg-slate-100 p-3 rounded-xl text-center">
                      <p className="text-[8px] font-black text-slate-500 uppercase">Grade</p>
                      <p className="text-2xl font-black text-slate-900">{editingAllScores[selectedSubjectForEdit].grade}</p>
                    </Card>
                  </div>
                </Card>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Teacher's Remark</label>
                <Input 
                  value={editingSummary.teacher_remark}
                  onChange={(e) => setEditingSummary({...editingSummary, teacher_remark: e.target.value})}
                  placeholder="Enter remark..."
                  className="h-12 rounded-xl border-slate-200"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1 h-12 rounded-xl border-slate-200 font-bold"
                  onClick={() => setIsEditSheetOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 h-12 rounded-xl bg-red-900 hover:bg-red-800 text-white font-bold"
                  onClick={saveAllStudentEdits}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="animate-spin mr-2 w-4 h-4" /> : null}
                  Submit All for Approval
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function ScoreInput({ value, onChange }: { value: any, onChange: (v: string) => void }) {
  return (
    <Input 
      type="number" 
      className="w-20 mx-auto text-center font-bold h-10 rounded-lg border-slate-200 focus:ring-red-900 focus:border-red-900" 
      value={value || ""} 
      onChange={(e) => onChange(e.target.value)} 
    />
  );
}

function ConfigField({ label, options, onValueChange }: any) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-black uppercase text-slate-500 ml-2">{label}</label>
      <Select onValueChange={onValueChange}>
        <SelectTrigger className="bg-white rounded-xl h-12 border-slate-200 font-bold">
          <SelectValue placeholder={`Select ${label}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt: string) => (
            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function StatRow({ label, value, icon: Icon }: { label: string, value: any, icon: any }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
      <div className="flex items-center gap-2 text-white/70">
        <Icon className="w-3.5 h-3.5" />
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-xl font-black">{value}</span>
    </div>
  );
}