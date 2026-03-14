"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { 
  Users, MessageSquare, LogOut, ExternalLink, ShieldCheck, 
  RefreshCcw, FilePlus, LayoutDashboard, Mail, UserCheck, 
  UserPlus, Calendar, ChevronLeft, ChevronRight, Menu, X, FileText,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils"; 

export default function AdminDashboard() {
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [pendingStaff, setPendingStaff] = useState<any[]>([]);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [pendingResultsCount, setPendingResultsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      const { data: admData, error: admError } = await supabase
        .from("admissions")
        .select("*")
        .order("created_at", { ascending: false });

      const { count: fbCount, error: fbError } = await supabase
        .from("feedback")
        .select("*", { count: "exact", head: true });

      const { count: resCount, error: resError } = await supabase
        .from("results")
        .select("*", { count: "exact", head: true })
        .eq("is_approved", false);

      const { data: staffData } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "staff")
        .eq("is_approved", false);

      if (admError || fbError || resError) throw admError || fbError || resError;

      setAdmissions(admData || []);
      setFeedbackCount(fbCount || 0);
      setPendingResultsCount(resCount || 0);
      setPendingStaff(staffData || []);
    } catch (error: any) {
      toast.error("Sync Error: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function approveStaff(id: string) {
    const { error } = await supabase.from("profiles").update({ is_approved: true }).eq("id", id);
    if (!error) {
      toast.success("Staff member approved!");
      fetchDashboardData();
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      
      <div className="md:hidden bg-red-900 text-white p-4 flex justify-between items-center sticky top-0 z-50 shadow-md">
        <h2 className="font-black italic tracking-tight">PHS MANAGEMENT</h2>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-white/10 rounded-lg">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <aside 
        className={cn(
          "bg-red-900 text-white flex-col sticky top-0 h-screen shadow-2xl transition-all duration-300 z-40 md:flex",
          isCollapsed ? "w-20" : "w-64",
          isMobileMenuOpen ? "flex fixed inset-0 w-full" : "hidden md:flex"
        )}
      >
        <div className="p-6 flex items-center justify-between overflow-hidden whitespace-nowrap">
          {!isCollapsed && (
            <div className="animate-in fade-in duration-500">
              <h2 className="text-xl font-black tracking-tight italic">PHS</h2>
              <p className="text-red-300 text-[10px] uppercase font-bold tracking-widest leading-none">Management</p>
            </div>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:block p-2 hover:bg-white/10 rounded-lg transition-colors ml-auto"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto space-y-1.5 px-4 scrollbar-hide">
          <p className={cn("text-[10px] font-black text-red-400 uppercase tracking-widest px-3 mb-2", isCollapsed && "sr-only")}>
            Main Menu
          </p>
          
          <NavItem href="/admin/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" collapsed={isCollapsed} onClick={() => setIsMobileMenuOpen(false)} active />
          <NavItem href="/admin/admissions" icon={<Users size={20} />} label="Admissions" collapsed={isCollapsed} onClick={() => setIsMobileMenuOpen(false)} />

          <div className="h-px bg-red-800 my-4 mx-2" />
          <p className={cn("text-[10px] font-black text-red-400 uppercase tracking-widest px-3 mb-2", isCollapsed && "sr-only")}>
            Academics
          </p>

          <NavItem href="/admin/students" icon={<UserPlus size={20} />} label="Student Manager" collapsed={isCollapsed} onClick={() => setIsMobileMenuOpen(false)} />
          <NavItem href="/admin/upload-result" icon={<FilePlus size={20} />} label="New Result" collapsed={isCollapsed} onClick={() => setIsMobileMenuOpen(false)} />
          <NavItem href="/admin/transcript" icon={<FileText size={20} />} label="Transcript Manager" collapsed={isCollapsed} onClick={() => setIsMobileMenuOpen(false)} />
          <NavItem href="/admin/settings" icon={<Settings size={20} />} label="System Control" collapsed={isCollapsed} onClick={() => setIsMobileMenuOpen(false)} />

          <Link href="/admin/approval" onClick={() => setIsMobileMenuOpen(false)}>
            <button className="w-full flex items-center justify-between hover:bg-white/5 p-3 rounded-xl transition-colors text-left group">
              <div className="flex items-center gap-3">
                <ShieldCheck size={20} />
                {!isCollapsed && <span className="text-sm font-medium">Result Approvals</span>}
              </div>
              {!isCollapsed && pendingResultsCount > 0 && (
                <span className="bg-white text-red-900 text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                  {pendingResultsCount}
                </span>
              )}
            </button>
          </Link>

          <div className="h-px bg-red-800 my-4 mx-2" />
          <p className={cn("text-[10px] font-black text-red-400 uppercase tracking-widest px-3 mb-2", isCollapsed && "sr-only")}>
            Comm.
          </p>

          <NavItem href="/admin/schedule" icon={<Calendar size={20} />} label="Schedule" collapsed={isCollapsed} onClick={() => setIsMobileMenuOpen(false)} />
          <NavItem href="/admin/feedback" icon={<MessageSquare size={20} />} label="Feedbacks" collapsed={isCollapsed} badge={feedbackCount} onClick={() => setIsMobileMenuOpen(false)} />
          <NavItem href="/admin/newsletter" icon={<Mail size={20} />} label="Newsletter" collapsed={isCollapsed} onClick={() => setIsMobileMenuOpen(false)} />
        </nav>

        <div className="p-4 border-t border-red-800 mb-20 md:mb-0">
          <Button 
            variant="ghost" 
            onClick={handleLogout} 
            className={cn(
              "text-red-200 hover:text-white hover:bg-red-800/50 w-full justify-start p-3 rounded-xl gap-3 transition-all font-bold",
              isCollapsed && "justify-center px-0 text-center"
            )}
          >
            <LogOut size={20} /> 
            {!isCollapsed && <span className="text-sm">Logout</span>}
          </Button>
        </div>
      </aside>

      <main className="flex-1 p-6 lg:p-12 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Overview</h1>
            <p className="text-slate-500 font-medium">Welcome back, Admin.</p>
          </div>
          <Button onClick={fetchDashboardData} variant="outline" className="rounded-xl gap-2 border-slate-200 bg-white hover:bg-slate-50 px-6 font-bold shadow-sm h-12">
            <RefreshCcw size={16} className={loading ? "animate-spin" : ""} /> Refresh
          </Button>
        </header>

        {pendingStaff.length > 0 && (
          <div className="mb-8 p-6 bg-orange-50 rounded-[2rem] border border-orange-100 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-3 mb-4">
               <UserCheck className="text-orange-600" size={24} />
               <h3 className="font-black text-orange-900 uppercase tracking-tight text-sm">Staff Registration Requests</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingStaff.map((staff) => (
                <div key={staff.id} className="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm border border-orange-100">
                  <div className="overflow-hidden">
                    <p className="font-bold text-slate-900 truncate">{staff.full_name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{staff.email}</p>
                  </div>
                  <Button onClick={() => approveStaff(staff.id)} size="sm" className="bg-orange-600 hover:bg-orange-700 rounded-lg font-bold shrink-0 ml-2 text-[10px] uppercase">Approve</Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
          <StatCard icon={<Users className="text-blue-600" />} label="Apps" value={admissions.length} color="bg-blue-50" />
          <StatCard icon={<ShieldCheck className="text-red-600" />} label="Pending" value={pendingResultsCount} color="bg-red-50" />
          <StatCard icon={<MessageSquare className="text-purple-600" />} label="Feedback" value={feedbackCount} color="bg-purple-50" />
          <StatCard icon={<UserCheck className="text-orange-600" />} label="Staff" value={pendingStaff.length} color="bg-orange-50" />
        </div>

        <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 md:p-8 border-b border-slate-50">
            <h3 className="font-black text-xl text-slate-900 uppercase tracking-tight">Recent Admissions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                <tr>
                  <th className="p-6">Student</th>
                  <th className="p-6">Class</th>
                  <th className="p-6">Parent Info</th>
                  <th className="p-6">Status</th>
                  <th className="p-6 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={5} className="p-20 text-center text-slate-400 italic animate-pulse">Synchronizing...</td></tr>
                ) : admissions.length === 0 ? (
                  <tr><td colSpan={5} className="p-20 text-center text-slate-400">No applications.</td></tr>
                ) : (
                  admissions.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-6">
                        <p className="font-bold text-slate-900">{student.first_name} {student.last_name}</p>
                        <p className="text-[10px] text-slate-400">Submitted: {new Date(student.created_at).toLocaleDateString()}</p>
                      </td>
                      <td className="p-6 text-slate-600 font-bold">{student.class_applying_for}</td>
                      <td className="p-6">
                        <p className="text-slate-900 font-bold text-xs">{student.parent_phone}</p>
                        <p className="text-[10px] text-slate-400">{student.parent_email}</p>
                      </td>
                      <td className="p-6">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase",
                          student.status === 'pending' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                        )}>
                          {student.status}
                        </span>
                      </td>
                      <td className="p-6 text-center flex justify-center gap-2">
                        {student.passport_url && (
                          <a href={student.passport_url} target="_blank" className="bg-slate-100 p-2 rounded-lg text-slate-600 hover:bg-red-900 hover:text-white transition-all">
                            <ExternalLink size={14} />
                          </a>
                        )}
                        <Button variant="outline" size="sm" onClick={() => router.push(`/admin/admissions/${student.id}`)} className="rounded-lg text-[10px] font-black uppercase border-slate-200 font-bold">Manage</Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ href, icon, label, collapsed, active = false, badge = 0, onClick }: any) {
  return (
    <Link href={href} className="block" onClick={onClick}>
      <button className={cn(
        "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group",
        active ? "bg-white/10 border border-white/10" : "hover:bg-white/5",
        collapsed && "md:justify-center px-0"
      )}>
        <div className={cn(active ? "text-white" : "text-red-200 group-hover:text-white")}>
          {icon}
        </div>
        {!collapsed && (
          <div className="flex-1 flex justify-between items-center">
            <span className={cn("text-sm font-medium", active ? "font-bold text-white" : "text-red-100")}>{label}</span>
            {badge > 0 && <span className="text-[10px] opacity-100 bg-white text-red-900 font-black px-1.5 rounded">{badge}</span>}
          </div>
        )}
      </button>
    </Link>
  );
}

function StatCard({ icon, label, value, color }: { icon: any, label: string, value: number, color: string }) {
  return (
    <div className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-3 md:gap-4 overflow-hidden">
      <div className={cn(color, "p-3 md:p-4 rounded-xl md:rounded-2xl shrink-0")}>{icon}</div>
      <div className="min-w-0">
        <p className="text-slate-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest truncate">{label}</p>
        <p className="text-lg md:text-2xl font-black text-slate-900">{value}</p>
      </div>
    </div>
  );
}