"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { 
  CheckCircle, Loader2, LogOut, Users, 
  FileText, ArrowLeft, History, Printer, 
  RotateCcw, CheckCheck, Award, BarChart3, TrendingUp,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

function calculateGrade(total: number) {
  if (total >= 70) return "A";
  if (total >= 60) return "B";
  if (total >= 50) return "C";
  if (total >= 45) return "D";
  if (total >= 40) return "E";
  return "F";
}

function getOrdinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

function DetailScoreBox({ label, value, max }: { label: string, value: any, max: string }) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 text-center shadow-sm">
      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">{label}</p>
      <p className="text-xl font-black text-slate-900">{value || 0}</p>
      <p className="text-[8px] font-bold text-slate-300 mt-1">/{max}</p>
    </div>
  );
}

function SummaryRow({ summary, onClick, showApprove = false, onApprove, isHistory = false }: any) {
  const subjects = Object.keys(summary.subject_scores || {});
  const subjectCount = subjects.length;
  
  const subjectValues = Object.values(summary.subject_scores || {}) as any[];
  const overallTotal = subjectValues.reduce((sum, subj) => sum + (subj.total || 0), 0);
  const overallAverage = subjectCount > 0 ? (overallTotal / subjectCount).toFixed(2) : "0.00";
  
  const status = summary.is_approved ? 'approved' : 'pending';
  
  return (
    <div 
      onClick={onClick}
      className="group bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:shadow-md hover:border-red-100 transition-all cursor-pointer"
    >
      <div className="flex items-center gap-6">
        <div className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl transition-colors", 
          isHistory ? "bg-green-50 text-green-700 group-hover:bg-green-100" : "bg-red-50 text-red-900 group-hover:bg-red-100"
        )}>
          {subjectCount}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-slate-900 text-white text-[9px] font-black rounded uppercase">{summary.class}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase">{subjectCount} subjects</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 leading-none">Student: {summary.student_id}</h3>
          <p className="text-slate-500 text-xs font-medium uppercase mt-1">
            {summary.term} • {summary.session}
          </p>
          {summary.rejection_reason && !summary.is_approved && (
            <div className="mt-2 text-xs text-red-600 font-medium">
              ⚠️ Revision required
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 group-hover:bg-white transition-colors">
        <div className="text-center">
          <p className="text-[9px] font-black text-slate-400 uppercase">Total</p>
          <p className="text-lg font-black text-slate-900">{overallTotal}</p>
        </div>
        <div className="w-px h-6 bg-slate-200" />
        <div className="text-center">
          <p className="text-[9px] font-black text-slate-400 uppercase">Average</p>
          <p className="text-lg font-black text-red-900">{overallAverage}%</p>
        </div>
        <div className="w-px h-6 bg-slate-200" />
        <div className="text-center">
          <p className="text-[9px] font-black text-slate-400 uppercase">Status</p>
          {status === 'approved' ? (
            <div className="flex items-center gap-1.5 text-green-600 font-black text-[10px] uppercase">
              <CheckCircle size={14} /> Approved
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-amber-600 font-black text-[10px] uppercase">
              <span>Pending</span>
            </div>
          )}
        </div>
      </div>

      {showApprove && !summary.is_approved && (
        <Button 
          onClick={(e) => { e.stopPropagation(); onApprove(summary); }} 
          className="bg-red-900 hover:bg-red-800 rounded-xl gap-2 h-12 px-6 font-bold w-full lg:w-auto"
        >
          <CheckCircle size={18} /> Approve File
        </Button>
      )}
    </div>
  );
}

function SummaryDetailView({ summary, onApprove, onRevoke, revoking, openRevokeDialog }: any) {
  const [classStats, setClassStats] = useState<any>(null);
  const [studentPosition, setStudentPosition] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const subjects = Object.entries(summary.subject_scores || {}).map(([name, data]: any) => ({
    name,
    ...data,
    grade: calculateGrade(data.total)
  }));

  const totalSubjects = subjects.length;
  const overallTotal = subjects.reduce((sum, subj) => sum + (subj.total || 0), 0);
  const overallAverage = totalSubjects > 0 ? (overallTotal / totalSubjects).toFixed(2) : "0.00";

  useEffect(() => {
    const loadClassStats = async () => {
      setLoading(true);
      try {
        const { data: classSummaries } = await supabase
          .from("result_summaries")
          .select("*")
          .eq("class", summary.class)
          .eq("term", summary.term)
          .eq("session", summary.session);

        if (!classSummaries || classSummaries.length === 0) {
          setClassStats({ classAverage: 0, totalStudents: 0 });
          return;
        }

        const studentsWithTotals = classSummaries.map(s => {
          const subjs = Object.values(s.subject_scores || {}) as any[];
          const total = subjs.reduce((sum, subj) => sum + (subj.total || 0), 0);
          return {
            student_id: s.student_id,
            overallTotal: total,
          };
        });

        const rankedStudents = [...studentsWithTotals].sort((a, b) => b.overallTotal - a.overallTotal);
        const classTotal = rankedStudents.reduce((sum, s) => sum + s.overallTotal, 0);
        const classAverage = classTotal / rankedStudents.length;
        const position = rankedStudents.findIndex(s => s.student_id === summary.student_id) + 1;

        setClassStats({
          classAverage: classAverage.toFixed(2),
          totalStudents: rankedStudents.length
        });

        setStudentPosition({
          position,
          ordinal: position + getOrdinal(position)
        });
      } catch (error) {
        console.error("Error loading class stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadClassStats();
  }, [summary]);

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Student Master File</h4>
            <p className="text-3xl font-black text-slate-900 uppercase">ID: {summary.student_id}</p>
            <p className="text-sm font-bold text-red-900 mt-1">{summary.class} • {summary.term} | {summary.session}</p>
          </div>
          <div className="text-right">
            <Badge className={`${summary.is_approved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'} border-none px-4 py-2 text-xs font-black uppercase`}>
              {summary.is_approved ? '✓ Approved' : '⏳ Pending'}
            </Badge>
          </div>
        </div>
        {summary.rejection_reason && !summary.is_approved && (
          <div className="mt-4 bg-red-50 p-4 rounded-xl border-2 border-red-200">
            <p className="text-[10px] font-black text-red-500 uppercase mb-1">Revision Reason</p>
            <p className="text-sm text-red-700">"{summary.rejection_reason}"</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-2xl border border-blue-200">
          <p className="text-[9px] font-black text-blue-600 uppercase mb-1">Overall Total</p>
          <p className="text-3xl font-black text-blue-900">{overallTotal}</p>
          <p className="text-[10px] text-blue-600 mt-1 font-bold">across {totalSubjects} subjects</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-2xl border border-purple-200">
          <p className="text-[9px] font-black text-purple-600 uppercase mb-1">Student Average</p>
          <p className="text-3xl font-black text-purple-900">{overallAverage}%</p>
          <p className="text-[10px] text-purple-600 mt-1 font-bold">per subject</p>
        </div>
        
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-5 rounded-2xl border border-amber-200">
          <p className="text-[9px] font-black text-amber-600 uppercase mb-1">Class Average</p>
          <p className="text-3xl font-black text-amber-900">{loading ? '...' : classStats?.classAverage || '0.00'}%</p>
          <p className="text-[10px] text-amber-600 mt-1 font-bold">{summary.class}</p>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-5 rounded-2xl border border-emerald-200">
          <p className="text-[9px] font-black text-emerald-600 uppercase mb-1">Position</p>
          <p className="text-3xl font-black text-emerald-900">
            {loading ? '...' : studentPosition ? `${studentPosition.position}${getOrdinal(studentPosition.position)}` : 'N/A'}
          </p>
          <p className="text-[10px] text-emerald-600 mt-1 font-bold">
            out of {loading ? '...' : classStats?.totalStudents || '0'} students
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Subject Performance</h4>
          <Badge variant="outline" className="border-slate-200 text-slate-600">
            {totalSubjects} Subjects
          </Badge>
        </div>
        
        {subjects.map((subj, index) => (
          <div key={subj.name} className="bg-white p-5 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-sm">
                  {index + 1}
                </span>
                <h5 className="font-black text-slate-900 uppercase">{subj.name}</h5>
              </div>
              <Badge className={`${
                subj.grade === 'A' ? 'bg-green-100 text-green-700' :
                subj.grade === 'B' ? 'bg-blue-100 text-blue-700' :
                subj.grade === 'C' ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700'
              } border-none px-3 py-1 text-xs font-black`}>
                Grade {subj.grade}
              </Badge>
            </div>
            
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl text-center">
                <p className="text-[8px] font-black text-slate-400 uppercase">CA1</p>
                <p className="text-lg font-black text-slate-900">{subj.ca1}</p>
                <p className="text-[8px] text-slate-400">/15</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl text-center">
                <p className="text-[8px] font-black text-slate-400 uppercase">CA2</p>
                <p className="text-lg font-black text-slate-900">{subj.ca2}</p>
                <p className="text-[8px] text-slate-400">/15</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl text-center">
                <p className="text-[8px] font-black text-slate-400 uppercase">Exam</p>
                <p className="text-lg font-black text-slate-900">{subj.exam}</p>
                <p className="text-[8px] text-slate-400">/70</p>
              </div>
              <div className="bg-red-50 p-3 rounded-xl text-center border border-red-100">
                <p className="text-[8px] font-black text-red-400 uppercase">Total</p>
                <p className="text-lg font-black text-red-900">{subj.total}</p>
                <p className="text-[8px] text-red-400">/100</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Official Remarks</h4>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 space-y-4">
          <div>
            <p className="text-[10px] font-black text-blue-600 uppercase mb-1">Teacher's Remark</p>
            <p className="text-sm font-medium text-slate-600 italic">"{summary.teacher_remark || 'No remark provided'}"</p>
          </div>
          <div className="h-px bg-slate-100" />
          <div>
            <p className="text-[10px] font-black text-green-600 uppercase mb-1">Principal's Comment</p>
            <p className="text-sm font-medium text-slate-600 italic">"{summary.principal_comment || 'No comment provided'}"</p>
          </div>
        </div>
      </div>

      <div className="pt-4 flex gap-3">
        {summary.is_approved ? (
          <Button 
            onClick={() => openRevokeDialog(summary)} 
            className="flex-1 h-14 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 font-black uppercase text-xs gap-2 border border-red-200"
          >
            <RotateCcw size={18} /> Revoke Approval
          </Button>
        ) : (
          <Button 
            onClick={() => onApprove(summary)} 
            className="flex-1 h-14 rounded-2xl bg-red-900 text-white hover:bg-red-800 font-black uppercase text-xs gap-2 shadow-lg"
          >
            <CheckCircle size={18} /> Approve Entire File
          </Button>
        )}
        <Button 
          variant="outline" 
          className="h-14 rounded-2xl border-slate-200 font-black uppercase text-xs gap-2"
          onClick={() => window.print()}
        >
          <Printer size={18} /> Print Report
        </Button>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-white p-20 rounded-[3rem] text-center border-2 border-dashed border-slate-200">
      <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="text-green-500 w-10 h-10" />
      </div>
      <h3 className="text-2xl font-black text-slate-900 uppercase">Portal Sync Clean</h3>
      <p className="text-slate-500 max-w-sm mx-auto mt-2 font-medium">{message}</p>
    </div>
  );
}

// --- MAIN PAGE COMPONENT ---

export default function AdminApprovalPage() {
  const [pendingSummaries, setPendingSummaries] = useState<any[]>([]);
  const [approvedSummaries, setApprovedSummaries] = useState<any[]>([]);
  const [pendingStaff, setPendingStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  const [selectedSummary, setSelectedSummary] = useState<any>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [revokeReason, setRevokeReason] = useState("");
  const [summaryToRevoke, setSummaryToRevoke] = useState<any>(null);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [pendingData, approvedData, staffData] = await Promise.all([
        supabase.from("result_summaries").select("*").eq("is_approved", false).order('class', { ascending: true }),
        supabase.from("result_summaries").select("*").eq("is_approved", true).order('created_at', { ascending: false }).limit(50),
        supabase.from("profiles").select("*").eq("role", "staff").eq("is_approved", false)
      ]);

      if (pendingData.error) throw pendingData.error;
      if (approvedData.error) throw approvedData.error;

      setPendingSummaries(pendingData.data || []);
      setApprovedSummaries(approvedData.data || []);
      setPendingStaff(staffData.data || []);
    } catch (error: any) {
      toast.error("Data Sync Failed: " + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/login");

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user?.id)
        .single();

      if (profile?.role === "admin") {
        setIsAdmin(true);
        fetchAllData();
      } else {
        router.push("/dashboard");
      }
    };
    checkUser();
  }, [router, fetchAllData]);

  const summariesByClass = useMemo(() => {
    return pendingSummaries.reduce((acc: any, sum) => {
      if (!acc[sum.class]) acc[sum.class] = [];
      acc[sum.class].push(sum);
      return acc;
    }, {});
  }, [pendingSummaries]);

  const handleApproveSummary = async (summary: any) => {
    try {
      const { error } = await supabase
        .from("result_summaries")
        .update({ is_approved: true })
        .eq("id", summary.id);
      
      if (error) throw error;

      toast.success(`Master file for student ${summary.student_id} approved.`);
      setPendingSummaries(prev => prev.filter(s => s.id !== summary.id));
      setApprovedSummaries(prev => [{ ...summary, is_approved: true }, ...prev.slice(0, 49)]);
      setIsSheetOpen(false);
    } catch (error: any) {
      toast.error("Approval failed: " + error.message);
    }
  };

  const handleBulkApprove = async (className: string) => {
    const summariesToApprove = summariesByClass[className];
    const ids = summariesToApprove.map((s: any) => s.id);
    
    try {
      const { error } = await supabase
        .from("result_summaries")
        .update({ is_approved: true })
        .in("id", ids);
      
      if (error) throw error;

      toast.success(`All master files for ${className} approved!`);
      fetchAllData();
    } catch (error: any) {
      toast.error("Bulk approval failed.");
    }
  };

  const openRevokeDialog = (summary: any) => {
    setSummaryToRevoke(summary);
    setRevokeReason("");
    setShowRevokeDialog(true);
  };

  const confirmRevoke = async () => {
    if (!revokeReason.trim()) {
      toast.error("Please provide a reason for revoking");
      return;
    }

    setRevoking(true);
    try {
      const { error } = await supabase
        .from("result_summaries")
        .update({ 
          is_approved: false,
          rejection_reason: revokeReason
        })
        .eq("id", summaryToRevoke.id);

      if (error) throw error;

      toast.success("Approval revoked. Reason saved.");
      setShowRevokeDialog(false);
      setIsSheetOpen(false);
      fetchAllData();
    } catch (err: any) {
      toast.error("Failed to revoke: " + err.message);
    } finally {
      setRevoking(false);
      setSummaryToRevoke(null);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-red-900 w-10 h-10" /></div>;
  if (!isAdmin) return null;

  return (
    <section className="min-h-screen bg-slate-50 p-6 md:p-12 pb-32">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <Link href="/admin/dashboard" className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2 hover:text-red-900 transition-colors">
              <ArrowLeft size={14}/> Back to Dashboard
            </Link>
            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Admin Control</h1>
          </div>
          <Button variant="outline" onClick={() => supabase.auth.signOut().then(() => router.push("/login"))} className="rounded-xl border-slate-200 font-bold">
            <LogOut size={18} className="mr-2" /> Logout
          </Button>
        </div>

        <Tabs defaultValue="results" className="w-full">
          <TabsList className="bg-slate-200/50 p-1.5 rounded-2xl mb-8 w-fit flex-wrap h-auto">
            <TabsTrigger value="results" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-red-900 font-bold gap-2">
              <FileText size={16} /> Pending Files ({pendingSummaries.length})
            </TabsTrigger>
            <TabsTrigger value="staff" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-red-900 font-bold gap-2">
              <Users size={16} /> Staff ({pendingStaff.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-red-900 font-bold gap-2">
              <History size={16} /> Archive Ledger ({approvedSummaries.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="results" className="space-y-12">
            {pendingSummaries.length === 0 ? (
              <EmptyState message="No master files awaiting approval." />
            ) : (
              Object.keys(summariesByClass).map((className) => (
                <div key={className} className="space-y-4">
                  <div className="flex items-center justify-between bg-slate-100 p-4 rounded-2xl">
                    <h2 className="text-xl font-black text-slate-900 uppercase">
                      {className} <span className="text-slate-400 ml-2">({summariesByClass[className].length})</span>
                    </h2>
                    <Button 
                      onClick={() => handleBulkApprove(className)}
                      variant="outline" 
                      className="border-red-900 text-red-900 hover:bg-red-900 hover:text-white font-black uppercase text-[10px] gap-2 rounded-xl"
                    >
                      <CheckCheck size={14} /> Approve All {className}
                    </Button>
                  </div>
                  
                  <div className="grid gap-4">
                    {summariesByClass[className].map((summary: any) => (
                      <SummaryRow 
                        key={summary.id}
                        summary={summary} 
                        onClick={() => {
                          setSelectedSummary(summary);
                          setIsSheetOpen(true);
                        }}
                        onApprove={handleApproveSummary}
                        showApprove 
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <div className="grid gap-4">
              {approvedSummaries.length > 0 ? (
                approvedSummaries.map((summary) => (
                  <SummaryRow 
                    key={summary.id} 
                    summary={summary} 
                    isHistory 
                    onClick={() => {
                      setSelectedSummary(summary);
                      setIsSheetOpen(true);
                    }}
                  />
                ))
              ) : (
                <EmptyState message="No approved files in archive." />
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="staff" className="space-y-6">
            <div className="grid gap-4">
              {pendingStaff.length > 0 ? (
                pendingStaff.map((staff) => (
                  <div key={staff.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="font-black text-slate-900 uppercase">{staff.full_name}</p>
                      <p className="text-xs text-slate-400 font-bold uppercase">{staff.email}</p>
                    </div>
                    <Button className="bg-slate-900 rounded-xl h-10 px-6 font-bold uppercase text-[10px]">Approve Access</Button>
                  </div>
                ))
              ) : (
                <EmptyState message="All staff access requests are cleared." />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-xl overflow-y-auto bg-slate-50 border-none p-6">
          <SheetHeader className="mb-8">
            <div className="flex justify-between items-start">
              <div className="bg-red-900 text-white p-2 rounded-xl">
                <FileText size={24} />
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-xl font-bold gap-2 text-slate-500" 
                onClick={() => window.print()}
              >
                <Printer size={16} /> Print
              </Button>
            </div>
            <SheetTitle className="text-3xl font-black uppercase tracking-tighter text-slate-900 mt-4">
              {selectedSummary?.is_approved ? "Master File Archive" : "Review Master File"}
            </SheetTitle>
          </SheetHeader>
          
          {selectedSummary && (
            <SummaryDetailView 
              summary={selectedSummary}
              onApprove={handleApproveSummary}
              onRevoke={confirmRevoke}
              revoking={revoking}
              openRevokeDialog={openRevokeDialog}
            />
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <SheetContent className="sm:max-w-md bg-slate-50 border-none p-6">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-2xl font-black uppercase tracking-tighter text-red-900">
              Revoke Approval
            </SheetTitle>
          </SheetHeader>
          
          <div className="space-y-6">
            <div className="bg-red-50 p-4 rounded-2xl border border-red-200">
              <p className="text-xs text-red-700">
                You are about to revoke approval for student <span className="font-bold">{summaryToRevoke?.student_id}</span>. 
                This will require the staff to review and resubmit.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-2">
                Reason for Revoking <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full h-32 p-4 rounded-2xl border border-slate-200 bg-white focus:ring-2 focus:ring-red-900 focus:border-red-900 outline-none font-medium"
                placeholder="Explain why this result needs correction..."
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1 h-12 rounded-xl border-slate-200 font-bold"
                onClick={() => setShowRevokeDialog(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 h-12 rounded-xl bg-red-900 hover:bg-red-800 text-white font-bold"
                onClick={confirmRevoke}
                disabled={revoking}
              >
                {revoking ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                Confirm Revoke
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
}