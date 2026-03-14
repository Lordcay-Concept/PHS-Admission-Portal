"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { UserPlus, Search, Trash2, Loader2, CheckCircle2, ArrowLeft, Edit3, UserCheck, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function AdminStudentManager() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [finalizingId, setFinalizingId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  async function syncExistingStudents() {
    setIsSyncing(true);
    const toastId = toast.loading("Repairing student records... pulling data from admissions.");
    
    try {
      const { data: students, error: studentError } = await supabase.from("students").select("*");
      if (studentError) throw studentError;

      let repairedCount = 0;

      for (const student of students) {
        const { data: applicant } = await supabase
          .from("admissions")
          .select("*")
          .eq("first_name", student.first_name)
          .eq("surname", student.surname)
          .single();

        if (applicant) {
          const { error: updateError } = await supabase
            .from("students")
            .update({
              gender: applicant.gender,
              dob: applicant.dob,
              passport_url: applicant.passport_url,
              sponsor_name: applicant.sponsor_name,
              sponsor_phone: applicant.sponsor_phone,
              sponsor_email: applicant.sponsor_email,
              sponsor_address: applicant.sponsor_address,
            })
            .eq("id", student.id);

          if (!updateError) repairedCount++;
        }
      }
      toast.success(`Repaired ${repairedCount} student records!`, { id: toastId });
      fetchStudents();
    } catch (err: any) {
      toast.error("Repair failed: " + err.message, { id: toastId });
    } finally {
      setIsSyncing(false);
    }
  }

  async function fetchStudents() {
    setLoading(true);
    
    const { data: currentStudents, error: studentError } = await supabase
      .from("students")
      .select("*")
      .order("first_name", { ascending: true });

    const { data: admittedApplicants, error: admissionError } = await supabase
      .from("admissions")
      .select("id, first_name, surname, class_applying_for, status")
      .eq("status", "admitted");

    if (studentError || admissionError) {
      toast.error("Error syncing data");
      console.error(studentError || admissionError);
    } else {
      const pendingStudents = (admittedApplicants || []).map(app => ({
        id: app.id,
        first_name: app.first_name,
        surname: app.surname,
        current_class: app.class_applying_for,
        admission_number: "PENDING",
        registration_status: "pending_finalize",
        is_from_admissions: true
      }));

      setStudents([...pendingStudents, ...(currentStudents || [])]);
    }
    setLoading(false);
  }

  async function handleFinalRegister(applicant: any) {
  if (!applicant || !applicant.id) {
    toast.error("System error: Invalid applicant data passed.");
    return;
  }

  setFinalizingId(applicant.id);

  const studentClass = applicant.class_applying_for || applicant.current_class || "Unassigned";

  try {
    const currentYear = new Date().getFullYear();

    const { data: existingStudents } = await supabase
      .from("students")
      .select("admission_number")
      .ilike("admission_number", `PHS/${currentYear}/%`);

    let nextNumber = 1;
    if (existingStudents && existingStudents.length > 0) {
      const numbers = existingStudents.map(s => {
        if (!s.admission_number) return 0;
        const parts = s.admission_number.split('/');
        const lastPart = parts[parts.length - 1];
        return parseInt(lastPart) || 0;
      });
      nextNumber = Math.max(...numbers) + 1;
    }

    const admissionNumber = `PHS/${currentYear}/${nextNumber.toString().padStart(3, '0')}`;

    const { error: insertError } = await supabase
      .from("students")
      .insert([{
        first_name: applicant.first_name,
        surname: applicant.surname,
        gender: applicant.gender,           
        dob: applicant.dob,                 
        
        passport_url: applicant.passport_url, 
        current_class: studentClass,
        admission_number: admissionNumber,
        registration_status: "active",

        sponsor_name: applicant.sponsor_name,
        sponsor_phone: applicant.sponsor_phone,
        sponsor_email: applicant.sponsor_email,
        sponsor_address: applicant.sponsor_address,
      }]);

    if (insertError) throw insertError;

    const { error: updateError } = await supabase
      .from("admissions")
      .update({ status: "registered" }) 
      .eq("id", applicant.id);

    if (updateError) throw updateError;

    toast.success(`Successfully Registered! ID: ${admissionNumber}`);
    fetchStudents(); 
  } catch (error: any) {
    console.error("Finalization Error:", error);
    toast.error("Finalization failed: " + error.message);
  } finally {
    setFinalizingId(null);
  }
}

  async function handleAddStudent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsAdding(true);
    const formData = new FormData(e.currentTarget);
    
    const fullNameInput = formData.get("fullName") as string;
    const nameParts = fullNameInput.split(" ");
    const firstName = nameParts[0];
    const surname = nameParts.slice(1).join(" ") || "";

    const newStudent = {
      first_name: firstName,
      surname: surname,
      admission_number: formData.get("admissionNo") as string,
      current_class: formData.get("class") as string,
      registration_status: "active"
    };

    const { error } = await supabase.from("students").insert([newStudent]);

    if (error) {
      toast.error(error.message.includes("unique") ? "Admission number already exists!" : error.message);
    } else {
      toast.success("Student added successfully!");
      fetchStudents();
      (e.target as HTMLFormElement).reset();
    }
    setIsAdding(false);
  }

  async function handleUpdateStudent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsUpdating(true);
    
    const { error } = await supabase
      .from("students")
      .update({
        first_name: editingStudent.first_name,
        surname: editingStudent.surname,
        admission_number: editingStudent.admission_number,
        current_class: editingStudent.current_class
      })
      .eq("id", editingStudent.id);

    if (error) {
      toast.error("Update failed: " + error.message);
    } else {
      toast.success("Student records updated!");
      fetchStudents();
      setEditingStudent(null);
    }
    setIsUpdating(false);
  }

  async function deleteStudent(student: any) {
    const isPending = student.registration_status === 'pending_finalize';
    const message = isPending 
      ? "This will delete the admission application. Proceed?" 
      : "Are you sure you want to remove this student?";

    if (!confirm(message)) return;

    const targetTable = isPending ? "admissions" : "students";

    const { error } = await supabase
      .from(targetTable)
      .delete()
      .eq("id", student.id);

    if (error) {
      toast.error("Could not delete record: " + error.message);
    } else {
      toast.success("Record removed");
      fetchStudents(); 
    }
  }

  const filteredStudents = students.filter(s => {
    const fullName = `${s.first_name || ''} ${s.surname || ''}`.toLowerCase();
    const idNum = (s.admission_number || '').toLowerCase();
    const searchLower = search.toLowerCase();
    
    return fullName.includes(searchLower) || idNum.includes(searchLower);
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Link href="/admin/dashboard" className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2 mb-2"><ArrowLeft size={14}/> Dashboard</Link>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Student Manager</h1>
            <Button 
              onClick={syncExistingStudents} 
              disabled={isSyncing}
              variant="outline" 
              className="rounded-full h-8 text-[10px] font-black uppercase border-red-100 text-red-900 hover:bg-red-50"
            >
              {isSyncing ? <Loader2 size={12} className="animate-spin mr-1" /> : <RefreshCw size={12} className="mr-1" />}
              Repair Missing Data
            </Button>
          </div>
          <p className="text-slate-500 font-medium">Add and manage student records for the portal.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 h-fit border-slate-200 shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 uppercase font-black text-slate-800">
              <UserPlus className="w-5 h-5 text-red-900" />
              New Registration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <Input name="fullName" placeholder="Full Name" required className="rounded-xl bg-slate-50 border-none h-12" />
              <Input name="admissionNo" placeholder="Admission Number" required className="rounded-xl bg-slate-50 border-none h-12" />
              <Input name="class" placeholder="Class (e.g. JSS 1)" className="rounded-xl bg-slate-50 border-none h-12" />
              <Button disabled={isAdding} className="w-full bg-red-900 hover:bg-red-800 text-white font-black rounded-xl h-12 shadow-lg shadow-red-900/10">
                {isAdding ? <Loader2 className="animate-spin" /> : "REGISTER STUDENT"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-slate-200 shadow-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-black uppercase text-slate-800 tracking-tight">Directory</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <Input 
                placeholder="Search name or ID..." 
                className="pl-10 rounded-xl bg-slate-50 border-none h-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-8 text-slate-400 font-bold italic animate-pulse"><Loader2 className="animate-spin mr-2" /> Loading Students...</div>
            ) : (
              <div className="rounded-xl border border-slate-100 overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="font-black text-[10px] uppercase">Full Name</TableHead>
                      <TableHead className="font-black text-[10px] uppercase">ID No.</TableHead>
                      <TableHead className="font-black text-[10px] uppercase">Class</TableHead>
                      <TableHead className="text-right font-black text-[10px] uppercase">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id} className="hover:bg-slate-50/50">
                        <TableCell className="font-bold text-slate-700">
                          <div className="flex flex-col">
                            <span className="flex items-center gap-2">
                                {student.first_name} {student.surname}
                                {student.registration_status === 'active' && (
                                    <CheckCircle2 className="text-green-500 w-4 h-4" />
                                )}
                            </span>
                            {student.registration_status !== 'active' && (
                                <span className="text-[9px] text-orange-500 font-black uppercase">Pending Activation</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{student.admission_number}</TableCell>
                        <TableCell className="font-bold text-slate-600">{student.current_class}</TableCell>
                        <TableCell className="text-right flex justify-end items-center gap-2">
                          
                          {student.registration_status !== 'active' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleFinalRegister(student)}
                              className="bg-green-600 hover:bg-green-700 text-white font-bold text-[10px] px-3 h-8 rounded-lg gap-1 uppercase"
                              disabled={finalizingId === student.id}
                            >
                              {finalizingId === student.id ? <Loader2 size={12} className="animate-spin" /> : <UserCheck size={14} />}
                              Finalize
                            </Button>
                          )}
                          
                          <Button variant="ghost" size="icon" onClick={() => setEditingStudent(student)} className="hover:bg-slate-100 rounded-lg h-8 w-8">
                            <Edit3 size={16} className="text-slate-500" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteStudent(student)} className="hover:bg-red-50 rounded-lg h-8 w-8">
                            <Trash2 size={16} className="text-red-400" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!editingStudent} onOpenChange={() => setEditingStudent(null)}>
        <DialogContent className="rounded-[2rem] border-none shadow-2xl p-8 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight uppercase">Update Record</DialogTitle>
          </DialogHeader>
          {editingStudent && (
            <form onSubmit={handleUpdateStudent} className="space-y-6 mt-4">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">First Name</label>
                  <Input 
                    value={editingStudent.first_name} 
                    onChange={(e) => setEditingStudent({...editingStudent, first_name: e.target.value})}
                    className="rounded-xl bg-slate-50 border-none font-bold h-12"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Surname</label>
                  <Input 
                    value={editingStudent.surname} 
                    onChange={(e) => setEditingStudent({...editingStudent, surname: e.target.value})}
                    className="rounded-xl bg-slate-50 border-none font-bold h-12"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Admission No.</label>
                  <Input 
                    value={editingStudent.admission_number} 
                    onChange={(e) => setEditingStudent({...editingStudent, admission_number: e.target.value})}
                    className="rounded-xl bg-slate-50 border-none font-bold h-12"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Current Class</label>
                  <Input 
                    value={editingStudent.current_class} 
                    onChange={(e) => setEditingStudent({...editingStudent, current_class: e.target.value})}
                    className="rounded-xl bg-slate-50 border-none font-bold h-12"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setEditingStudent(null)} className="flex-1 rounded-xl font-bold h-12">Cancel</Button>
                <Button disabled={isUpdating} className="flex-1 bg-red-900 hover:bg-red-800 text-white rounded-xl font-black h-12">
                  {isUpdating ? <Loader2 className="animate-spin" /> : "SAVE CHANGES"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export { AdminStudentManager as StudentManager };