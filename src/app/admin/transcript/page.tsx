"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Loader2, Search, Printer, ChevronLeft, 
  GraduationCap, Image as ImageIcon, Award, Calendar,
  BookOpen, Scale, FileText
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Student {
  admission_number: string;
  first_name: string;
  surname: string;
  gender: string;
  date_of_birth?: string;
  current_class?: string;
}

interface Course {
  subject: string;
  total: number;
  grade: string;
  ca1?: number;
  ca2?: number;
  exam?: number;
  credit_hours?: number;
}

interface TermResult {
  term: string;
  session: string;
  class: string;
  courses: Course[];
  term_gpa: number;
  term_credits: number;
  term_total: number;
}

interface TranscriptData {
  student: Student;
  terms: TermResult[];
  cumulative_gpa: number;
  total_credits: number;
  overall_average: number;
  degree_info?: {
    name: string;
    conferred_date: string;
    honors?: string;
  };
}

export default function TranscriptManager() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [transcriptData, setTranscriptData] = useState<TranscriptData | null>(null);
  const [logo, setLogo] = useState<string | null>("/images/logo/PHS Logo.webp");
  const [sealImage, setSealImage] = useState<string | null>("/images/seal/School Seal.png");
  const [registrarSignature, setRegistrarSignature] = useState<string | null>("/images/signature/MGT Signature.png");
  const [issuanceDate] = useState(new Date());

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const calculateGradePoints = (grade: string): number => {
    const scale: Record<string, number> = {
      'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0, 'D-': 0.7,
      'F': 0.0
    };
    return scale[grade] || 0;
  };

  const fetchTranscript = async () => {
    if (!searchQuery) return toast.error("Enter a Student ID or Name");
    setLoading(true);

    try {
      let student = null;
      
      const { data: studentByAdmission } = await supabase
        .from("students")
        .select("*")
        .eq("admission_number", searchQuery.trim())
        .maybeSingle();
        
      if (studentByAdmission) {
        student = studentByAdmission;
      } else {
        const searchTerms = searchQuery.trim().split(' ');
        if (searchTerms.length === 1) {
          const { data: studentByName } = await supabase
            .from("students")
            .select("*")
            .or(`first_name.ilike.%${searchTerms[0]}%,surname.ilike.%${searchTerms[0]}%`)
            .maybeSingle();
          if (studentByName) student = studentByName;
        } else if (searchTerms.length >= 2) {
          const { data: studentByName } = await supabase
            .from("students")
            .select("*")
            .ilike('first_name', `%${searchTerms[0]}%`)
            .ilike('surname', `%${searchTerms.slice(1).join(' ')}%`)
            .maybeSingle();
          if (studentByName) student = studentByName;
        }
      }

      if (!student) throw new Error("Student not found");

      const { data: results, error: rErr } = await supabase
        .from("results")
        .select("*")
        .eq("student_id", student.admission_number)
        .eq("is_approved", true)
        .order("session", { ascending: true })
        .order("term", { ascending: true });

      if (rErr) throw rErr;

      if (!results || results.length === 0) {
        toast.info("No approved results found for this student");
      }

      const termMap = new Map<string, TermResult>();
      
      results.forEach((result: any) => {
        const key = `${result.session}-${result.term}`;
        
        if (!termMap.has(key)) {
          termMap.set(key, {
            term: result.term,
            session: result.session,
            class: result.class,
            courses: [],
            term_gpa: 0,
            term_credits: 0,
            term_total: 0
          });
        }
        
        const termData = termMap.get(key)!;
        termData.courses.push({
          subject: result.subject,
          total: result.total,
          grade: result.grade,
          ca1: result.ca1,
          ca2: result.ca2,
          exam: result.exam,
          credit_hours: 1
        });
      });

      const terms: TermResult[] = Array.from(termMap.values()).map(term => {
        const totalPoints = term.courses.reduce((sum, course) => {
          const gradePoints = calculateGradePoints(course.grade);
          const credits = course.credit_hours || 1;
          return sum + (gradePoints * credits);
        }, 0);
        
        const totalCredits = term.courses.reduce((sum, course) => 
          sum + (course.credit_hours || 1), 0);
        
        const termTotal = term.courses.reduce((sum, course) => 
          sum + course.total, 0);
        
        return {
          ...term,
          term_gpa: totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : 0,
          term_credits: totalCredits,
          term_total: termTotal
        };
      });

      const totalPoints = terms.reduce((sum, term) => {
        const termPoints = term.courses.reduce((s, course) => {
          const gradePoints = calculateGradePoints(course.grade);
          const credits = course.credit_hours || 1;
          return s + (gradePoints * credits);
        }, 0);
        return sum + termPoints;
      }, 0);

      const totalCredits = terms.reduce((sum, term) => sum + term.term_credits, 0);
      
      const overallTotal = terms.reduce((sum, term) => sum + term.term_total, 0);
      const courseCount = results.length;

      setTranscriptData({
        student: {
          ...student,
          date_of_birth: student.dob || student.date_of_birth
        },
        terms,
        cumulative_gpa: totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : 0,
        total_credits: totalCredits,
        overall_average: courseCount > 0 ? Number((overallTotal / courseCount).toFixed(2)) : 0
      });
      
      toast.success("Transcript generated successfully.");
    } catch (err: any) {
      console.error("Transcript error:", err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const gradingScale = [
    { grade: 'A', points: '4.0', range: '70-100' },
    { grade: 'B', points: '3.0', range: '60-69' },
    { grade: 'C', points: '2.0', range: '50-59' },
    { grade: 'D', points: '1.0', range: '45-49' },
    { grade: 'E', points: '0.0', range: '40-44' },
    { grade: 'F', points: '0.0', range: '0-39' }
  ];

  return (
    <div className="p-4 max-w-5xl mx-auto min-h-screen bg-slate-50">
      {/* Search Controls - unchanged */}
      <div className="print:hidden space-y-4 mb-6">
        <Link href="/admin/dashboard" className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2 hover:text-red-900">
          <ChevronLeft size={14} /> Back to Dashboard
        </Link>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2 flex gap-3 bg-white p-3 rounded-xl shadow-sm border">
            <Input 
              placeholder="Search by Admission Number or Name..." 
              className="h-10 rounded-lg text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchTranscript()}
            />
            <Button onClick={fetchTranscript} disabled={loading} className="h-10 px-6 bg-red-900 rounded-lg hover:bg-red-800">
              {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <Search size={16} />}
            </Button>
          </div>

          <div className="bg-white p-3 rounded-xl shadow-sm border flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase">School Seal</span>
            <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 p-1.5 rounded-lg transition-colors">
              <ImageIcon size={18} className="text-slate-600" />
              <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => setSealImage(reader.result as string);
                  reader.readAsDataURL(file);
                }
              }} />
            </label>
          </div>

          <div className="bg-white p-3 rounded-xl shadow-sm border flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Registrar Signature</span>
            <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 p-1.5 rounded-lg transition-colors">
              <ImageIcon size={18} className="text-slate-600" />
              <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => setRegistrarSignature(reader.result as string);
                  reader.readAsDataURL(file);
                }
              }} />
            </label>
          </div>
        </div>
      </div>

      {transcriptData ? (
        <div className="bg-white p-6 rounded-2xl shadow-xl border relative overflow-hidden print:shadow-none print:border print:p-4 print:rounded-none">
          
          {/* Watermark - made smaller */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02] -rotate-45">
            <p className="text-[80px] font-black uppercase select-none tracking-widest text-slate-900">
              OFFICIAL
            </p>
          </div>

          {/* Header - more compact */}
          <div className="relative z-10 flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-4">
            <div className="flex-1">
              {logo ? (
                <img src={logo} alt="Institutional Seal" className="h-14 w-auto object-contain" />
              ) : (
                <div className="w-14 h-14 bg-slate-50 border-2 border-dashed border-slate-200 rounded-full flex items-center justify-center text-slate-300">
                  <GraduationCap size={24} />
                </div>
              )}
            </div>
            
            <div className="flex-1 text-center min-w-fit px-2">
              <h1 className="text-xl font-black uppercase tracking-tight text-slate-900 whitespace-nowrap">
                POSSIBLE HEIGHT SCHOOLS
              </h1>
              <h2 className="text-[10px] font-black uppercase tracking-tight text-slate-500 whitespace-nowrap">
                EMPOWERING THE LEADERS OF TOMORROW
              </h2>
              <p className="text-[8px] font-bold text-slate-600 uppercase tracking-[0.2em] mt-0.5 whitespace-nowrap">
                Official Academic Transcript
              </p>
              <p className="text-[7px] text-slate-500 mt-1 whitespace-nowrap">
                12 School Road, Utako, Abuja · Est. 2005
              </p>
            </div>
            
            <div className="flex-1 text-right">
              <p className="text-[8px] font-bold text-slate-500 uppercase">Issue Date</p>
              <p className="text-xs font-bold text-slate-900 whitespace-nowrap">
                {issuanceDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </p>
              <p className="text-[7px] text-slate-400 mt-1 whitespace-nowrap">
                ID: TR-{Math.floor(10000 + Math.random() * 90000)}
              </p>
            </div>
          </div>

          {/* Student Info - more compact */}
          <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="space-y-2">
              <div>
                <p className="text-[7px] font-black uppercase text-slate-500 tracking-wider">Student Name (Legal)</p>
                <p className="text-base font-bold text-slate-900 uppercase leading-tight">
                  {transcriptData.student.surname}, {transcriptData.student.first_name}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[7px] font-black uppercase text-slate-500">Student ID</p>
                  <p className="text-xs font-bold text-slate-900">{transcriptData.student.admission_number}</p>
                </div>
                <div>
                  <p className="text-[7px] font-black uppercase text-slate-500">Date of Birth</p>
                  <p className="text-xs font-bold text-slate-900">
                    {transcriptData.student.date_of_birth 
                      ? new Date(transcriptData.student.date_of_birth).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })
                      : 'Not provided'}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-[7px] font-black uppercase text-slate-500">Current Classification</p>
                <p className="text-xs font-bold text-slate-900">{transcriptData.student.current_class || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[7px] font-black uppercase text-slate-500">Gender</p>
                <p className="text-xs font-bold text-slate-900">{transcriptData.student.gender || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Academic Record - COMPACT */}
          <div className="space-y-4 mb-4">
            {transcriptData.terms.map((term, termIndex) => (
              <div key={`${term.session}-${term.term}`} className="border border-slate-200 rounded-lg overflow-hidden">
                {/* Term Header - compact */}
                <div className="bg-slate-800 text-white px-4 py-2 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Calendar size={12} className="text-slate-300" />
                    <h3 className="font-bold uppercase text-xs">{term.term} • {term.session}</h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[7px] text-slate-300 uppercase">GPA</p>
                      <p className="text-xs font-bold">{term.term_gpa.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[7px] text-slate-300 uppercase">Credits</p>
                      <p className="text-xs font-bold">{term.term_credits}</p>
                    </div>
                  </div>
                </div>

                {/* Course Table - extremely compact */}
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-1.5 text-left text-[8px] font-black uppercase text-slate-600">Subject</th>
                      <th className="px-3 py-1.5 text-center text-[8px] font-black uppercase text-slate-600">Cred</th>
                      <th className="px-3 py-1.5 text-center text-[8px] font-black uppercase text-slate-600">Score</th>
                      <th className="px-3 py-1.5 text-center text-[8px] font-black uppercase text-slate-600">Grade</th>
                      <th className="px-3 py-1.5 text-center text-[8px] font-black uppercase text-slate-600">Pts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {term.courses.map((course, idx) => {
                      const gradePoints = calculateGradePoints(course.grade);
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="px-3 py-1.5 font-medium text-slate-800 text-[10px] truncate max-w-[150px]">{course.subject}</td>
                          <td className="px-3 py-1.5 text-center text-slate-600 text-[10px]">{course.credit_hours || 1}</td>
                          <td className="px-3 py-1.5 text-center font-bold text-slate-900 text-[10px]">{course.total}</td>
                          <td className="px-3 py-1.5 text-center">
                            <span className={`inline-flex items-center justify-center w-5 h-5 rounded-md text-[8px] font-bold
                              ${course.grade === 'A' ? 'bg-green-100 text-green-700' :
                                course.grade === 'B' ? 'bg-blue-100 text-blue-700' :
                                course.grade === 'C' ? 'bg-amber-100 text-amber-700' :
                                'bg-red-100 text-red-700'}`}>
                              {course.grade}
                            </span>
                          </td>
                          <td className="px-3 py-1.5 text-center font-bold text-slate-700 text-[10px]">{gradePoints.toFixed(1)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          {/* Summary Section - compact */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-slate-900 text-white p-4 rounded-lg">
              <p className="text-[8px] font-black uppercase text-slate-400 tracking-wider mb-1">Cumulative Summary</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[7px] text-slate-400">Cumulative GPA</p>
                  <p className="text-xl font-black">{transcriptData.cumulative_gpa.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[7px] text-slate-400">Total Credits</p>
                  <p className="text-lg font-bold">{transcriptData.total_credits}</p>
                </div>
                <div>
                  <p className="text-[7px] text-slate-400">Overall Avg</p>
                  <p className="text-base font-bold">{transcriptData.overall_average}%</p>
                </div>
                <div>
                  <p className="text-[7px] text-slate-400">Terms</p>
                  <p className="text-base font-bold">{transcriptData.terms.length}</p>
                </div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-3">
              <p className="text-[8px] font-black uppercase text-slate-500 mb-1 flex items-center gap-1">
                <Scale size={12} /> Grading Scale
              </p>
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[7px]">
                {gradingScale.map((item) => (
                  <div key={item.grade} className="flex justify-between">
                    <span className="font-bold">{item.grade}</span>
                    <span className="text-slate-600">{item.range}%</span>
                    <span className="text-slate-500">({item.points})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Signatures - compact */}
          <div className="flex justify-between items-end mt-4 pt-4 border-t-2 border-slate-200">
            <div className="space-y-3">
              <div>
                <p className="text-[7px] font-black uppercase text-slate-500">Issued By</p>
                <p className="text-xs font-bold text-slate-900">Office of the Registrar</p>
              </div>
              <div className="space-y-1">
                {registrarSignature ? (
                  <img 
                    src={registrarSignature} 
                    alt="Registrar's Signature" 
                    className="h-8 object-contain mb-1"
                  />
                ) : (
                  <div className="w-32 border-b-2 border-slate-900"></div>
                )}
                <p className="text-[8px] font-bold text-slate-800">Registrar's Signature</p>
              </div>
            </div>
            
            <div className="text-center">
              {sealImage ? (
                <img 
                  src={sealImage} 
                  alt="Institutional Seal" 
                  className="w-16 h-16 object-contain mx-auto mb-1"
                />
              ) : (
                <div className="w-16 h-16 border-2 border-slate-300 rounded-full mx-auto mb-1 flex items-center justify-center text-slate-400">
                  <Award size={24} />
                </div>
              )}
              <p className="text-[7px] font-black uppercase text-slate-500">Seal</p>
            </div>
            
            <div className="text-right space-y-3">
              <div>
                <p className="text-[7px] font-black uppercase text-slate-500">Date</p>
                <p className="text-xs font-bold text-slate-900">
                  {issuanceDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="text-[7px] font-black uppercase text-slate-500">Status</p>
                <p className="text-xs font-black text-red-900 uppercase tracking-wider">Official</p>
              </div>
            </div>
          </div>

          {/* Footer - compact */}
          <div className="mt-4 text-center">
            <p className="text-[6px] text-slate-400 uppercase tracking-wider">
              Verify at www.possibleheightschools.edu/verify · ID: TR-{Math.floor(10000 + Math.random() * 90000)}
            </p>
          </div>

          <Button onClick={() => window.print()} className="mt-6 w-full h-10 bg-red-900 hover:bg-red-800 text-white print:hidden gap-2 rounded-xl font-black uppercase tracking-widest text-sm">
            <Printer size={16} /> Print Official Transcript
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-slate-300 bg-white rounded-2xl border border-dashed">
          <FileText size={48} className="mb-3 opacity-10" />
          <p className="font-black uppercase tracking-[0.3em] text-xs">Enter Student Information</p>
          <p className="text-xs text-slate-400 mt-1">Search by admission number or name</p>
        </div>
      )}
    </div>
  );
}