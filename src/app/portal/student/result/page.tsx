"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Printer, 
  GraduationCap, 
  Search, 
  User, 
  Loader2, 
  ArrowLeft, 
  FileQuestion, 
  Award 
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import Link from "next/link";

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

function getOverallRemark(average: string) {
  const avg = parseFloat(average);
  if (avg >= 70) return 'EXCELLENT';
  if (avg >= 60) return 'VERY GOOD';
  if (avg >= 50) return 'GOOD';
  if (avg >= 45) return 'FAIR';
  if (avg >= 40) return 'PASS';
  return 'NEEDS IMPROVEMENT';
}

export default function StudentResults() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [student, setStudent] = useState<any>(null);
  const [filters, setFilters] = useState({ session: "", term: "" });
  const [summary, setSummary] = useState<any>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [classStats, setClassStats] = useState<any>(null);
  const [studentPosition, setStudentPosition] = useState<any>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializePage = async () => {
      const id = localStorage.getItem("student_id");
      
      if (id) {
        const { data: studentData } = await supabase
          .from("students")
          .select("first_name, surname, current_class, passport_url, admission_number")
          .eq("admission_number", id)
          .single();
        setStudent(studentData);
      }

      const { data: settings } = await supabase
        .from('system_settings')
        .select('*')
        .single();

      if (settings) {
        setFilters({ 
          session: settings.current_session, 
          term: settings.current_term 
        });
      }
    };
    
    initializePage();
  }, []);

  const fetchResults = async () => {
    if (!filters.session || !filters.term) {
      toast.error("Please select both Session and Term");
      return;
    }

    setLoading(true);
    setHasSearched(true);
    const id = localStorage.getItem("student_id");

    try {
      const { data: summaryData, error } = await supabase
        .from("result_summaries")
        .select("*")
        .eq("student_id", id)
        .eq("session", filters.session)
        .eq("term", filters.term)
        .maybeSingle();

      if (error) throw error;

      if (summaryData) {
        const subjectScores = summaryData.subject_scores || {};
        const resultsArray = Object.entries(subjectScores).map(([subject, data]: [string, any]) => ({
          subject,
          ca1: data.ca1 || data.first_ca || 0,
          ca2: data.ca2 || data.second_ca || 0,
          exam: data.exam || 0,
          total: data.total || 0,
          grade: data.grade || calculateGrade(data.total || 0),
        }));

        setResults(resultsArray);
        setSummary(summaryData);

        const { data: classSummaries } = await supabase
          .from("result_summaries")
          .select("*")
          .eq("class", student?.current_class)
          .eq("session", filters.session)
          .eq("term", filters.term);

        if (classSummaries && classSummaries.length > 0) {
          const studentsWithTotals = classSummaries.map(s => {
            const subjects = Object.values(s.subject_scores || {}) as any[];
            const total = subjects.reduce((sum, subj) => sum + (subj.total || 0), 0);
            return {
              student_id: s.student_id,
              total
            };
          });

          const sorted = [...studentsWithTotals].sort((a, b) => b.total - a.total);
          const classTotal = sorted.reduce((sum, s) => sum + s.total, 0);
          const classAverage = classTotal / sorted.length;
          const position = sorted.findIndex(s => s.student_id === id) + 1;

          setClassStats({
            classAverage: classAverage.toFixed(2),
            totalStudents: sorted.length
          });

          setStudentPosition({
            position,
            ordinal: position + getOrdinal(position)
          });
        }
      } else {
        setResults([]);
        setSummary(null);
        setClassStats(null);
        setStudentPosition(null);
        toast.info("No records found for this period.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while fetching the report.");
    } finally {
      setLoading(false);
    }
  };

  const overallTotal = results.reduce((sum, subject) => sum + (subject.total || 0), 0);
  const subjectCount = results.length;
  const overallAverage = subjectCount > 0 ? (overallTotal / subjectCount).toFixed(2) : "0.00";

 const handlePrint = () => {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Student Result - ${student?.first_name} ${student?.surname}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page {
              size: A4 portrait;
              margin: 0.3in;
            }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body class="bg-white text-slate-900 p-2.5 text-[8px] font-sans">
          <!-- School Header with Logo -->
          <div class="flex items-center justify-center gap-5 mb-3 pb-2 border-b-2 border-slate-900">
            <div class="flex items-center justify-center">
              <img 
                src="/images/logo/PHS Logo.webp" 
                alt="School Logo" 
                class="w-auto h-auto max-w-[100px] max-h-[100px] object-contain block"
                onerror="this.onerror=null; this.src='/logo.png'; this.onerror=function(){this.style.display='none'; this.parentElement.innerHTML='<span class=\\'text-6xl text-slate-900\\'>🏫</span>';}"
              />
            </div>
            <div class="text-center">
              <h1 class="text-lg font-black text-slate-900 uppercase tracking-tight m-0 leading-tight">POSSIBLE HEIGHT SCHOOL</h1>
              <p class="text-[8px] text-slate-600 my-0.5 italic">Excellence in Education · Terminal Report</p>
              <p class="text-[6px] text-slate-500">12 School Road, Utako, Abuja · 0800 000 000 · info@possibleheight.edu.ng</p>
            </div>
          </div>

          <!-- Student Card with Passport -->
          <div class="flex justify-between items-center border border-slate-900 p-1.5 mb-2.5 bg-slate-50">
            <div class="grid grid-cols-4 gap-1.5 flex-1">
              <div class="flex flex-col">
                <span class="text-[5px] font-extrabold uppercase text-slate-600 tracking-tight">Full Name</span>
                <span class="text-[8px] font-bold text-slate-900 leading-tight">${student?.first_name} ${student?.surname}</span>
              </div>
              <div class="flex flex-col">
                <span class="text-[5px] font-extrabold uppercase text-slate-600 tracking-tight">Admission No.</span>
                <span class="text-[8px] font-bold text-slate-900 leading-tight">${student?.admission_number}</span>
              </div>
              <div class="flex flex-col">
                <span class="text-[5px] font-extrabold uppercase text-slate-600 tracking-tight">Class</span>
                <span class="text-[8px] font-bold text-slate-900 leading-tight">${student?.current_class}</span>
              </div>
              <div class="flex flex-col">
                <span class="text-[5px] font-extrabold uppercase text-slate-600 tracking-tight">Term</span>
                <span class="text-[8px] font-bold text-slate-900 leading-tight">${filters.term} ${filters.session}</span>
              </div>
            </div>
            <div class="w-10 h-10 border border-slate-900 bg-slate-200 flex items-center justify-center ml-2">
              ${student?.passport_url 
                ? `<img src="${student.passport_url}" alt="Student" class="max-w-[38px] max-h-[38px] object-cover" 
                    onerror="this.style.display='none'; this.parentElement.innerHTML='<span class=\\'text-lg text-slate-400\\'>👤</span>';" />` 
                : `<span class="text-lg text-slate-400">👤</span>`
              }
            </div>
          </div>

          <!-- Results Table -->
          <table class="w-full border-collapse my-1.5 border border-slate-900 text-[7px]">
            <thead>
              <tr class="bg-slate-900 text-white">
                <th class="text-left p-1 pl-1.5 font-extrabold text-[6px] uppercase border border-slate-700">Subject</th>
                <th class="text-center p-1 font-extrabold text-[6px] uppercase border border-slate-700">CA 1</th>
                <th class="text-center p-1 font-extrabold text-[6px] uppercase border border-slate-700">CA 2</th>
                <th class="text-center p-1 font-extrabold text-[6px] uppercase border border-slate-700">Exam</th>
                <th class="text-center p-1 font-extrabold text-[6px] uppercase border border-slate-700">Total</th>
                <th class="text-center p-1 font-extrabold text-[6px] uppercase border border-slate-700">Grade</th>
              </tr>
            </thead>
            <tbody>
              ${results.map(row => `
                <tr>
                  <td class="p-1 pl-1.5 font-semibold text-slate-900 border border-slate-400">${row.subject}</td>
                  <td class="text-center p-1 border border-slate-400">${row.ca1}</td>
                  <td class="text-center p-1 border border-slate-400">${row.ca2}</td>
                  <td class="text-center p-1 border border-slate-400">${row.exam}</td>
                  <td class="text-center p-1 font-bold text-red-900 border border-slate-400">${row.total}</td>
                  <td class="text-center p-1 border border-slate-400">
                    <span class="inline-block w-3.5 h-3.5 leading-[14px] text-center font-extrabold text-[6px] rounded-sm
                      ${row.grade === 'A' ? 'bg-green-200 text-green-800' :
                        row.grade === 'B' ? 'bg-blue-200 text-blue-800' :
                        row.grade === 'C' ? 'bg-yellow-200 text-yellow-800' :
                        row.grade === 'D' ? 'bg-orange-200 text-orange-800' :
                        row.grade === 'E' ? 'bg-red-200 text-red-800' :
                        'bg-red-300 text-red-900'}">
                      ${row.grade}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <!-- Stats and Remarks -->
          <div class="grid grid-cols-2 gap-1.5 my-2">
            <!-- Stats Grid -->
            <div class="grid grid-cols-2 gap-1">
              <div class="border border-slate-900 p-1 bg-slate-50">
                <p class="text-[5px] font-extrabold uppercase text-slate-600 mb-0.5">Total Score</p>
                <p class="text-[11px] font-black text-slate-900 leading-tight">${overallTotal}</p>
                <p class="text-[5px] text-slate-500">${subjectCount} subjects</p>
              </div>
              <div class="border border-slate-900 p-1 bg-slate-50">
                <p class="text-[5px] font-extrabold uppercase text-slate-600 mb-0.5">Average</p>
                <p class="text-[11px] font-black text-slate-900 leading-tight">${overallAverage}%</p>
              </div>
              <div class="border border-slate-900 p-1 bg-slate-50">
                <p class="text-[5px] font-extrabold uppercase text-slate-600 mb-0.5">Class Avg</p>
                <p class="text-[11px] font-black text-slate-900 leading-tight">${classStats?.classAverage || '0.00'}%</p>
              </div>
              <div class="border border-slate-900 p-1 bg-slate-50">
                <p class="text-[5px] font-extrabold uppercase text-slate-600 mb-0.5">Position</p>
                <p class="text-[11px] font-black text-slate-900 leading-tight">${studentPosition ? `${studentPosition.position}${getOrdinal(studentPosition.position)}` : 'N/A'}</p>
                <p class="text-[5px] text-slate-500">of ${classStats?.totalStudents || 0}</p>
              </div>
            </div>

            <!-- Remarks -->
            <div class="grid grid-cols-1 gap-1">
              <div class="border border-slate-900 p-1">
                <p class="text-[5px] font-extrabold uppercase text-blue-700 mb-0.5">Teacher's Remark</p>
                <p class="text-[6px] italic text-slate-800 leading-tight">"${summary?.teacher_remark || 'No remark'}"</p>
              </div>
              <div class="border border-slate-900 p-1">
                <p class="text-[5px] font-extrabold uppercase text-green-700 mb-0.5">Principal's Comment</p>
                <p class="text-[6px] italic text-slate-800 leading-tight">"${summary?.principal_comment || 'No comment'}"</p>
              </div>
            </div>
          </div>

          <!-- Overall Performance -->
          <div class="bg-slate-900 text-white p-1.5 my-2 flex items-center gap-2 border border-black">
            <div class="bg-yellow-400 w-5 h-5 rounded-full flex items-center justify-center">
              <span class="text-slate-900 text-xs">🏆</span>
            </div>
            <div>
              <p class="text-[5px] font-extrabold uppercase text-slate-400 tracking-wider">Overall Performance</p>
              <p class="text-xs font-black">${getOverallRemark(overallAverage)}</p>
            </div>
          </div>

          <!-- Footer -->
          <div class="mt-2 text-center text-[5px] text-slate-500 border-t border-slate-300 pt-1">
            Generated on ${new Date().toLocaleDateString()} · Official Document of Possible Height School
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
};

  return (
    <div className="max-w-7xl mx-auto space-y-6 pt-6 pb-20 px-4 sm:px-6">
      <Link 
        href="/portal/student/dashboard" 
        className="inline-flex items-center gap-2 text-slate-400 hover:text-red-900 font-black text-[10px] uppercase transition-all mb-4 no-print"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
      </Link>
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 no-print mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter uppercase">Academic Report</h1>
          <p className="text-slate-500 font-medium text-sm">Official terminal performance record.</p>
        </div>
        {results.length > 0 && (
          <Button 
            onClick={handlePrint} 
            className="bg-slate-900 text-white hover:bg-slate-800 rounded-2xl h-12 px-6 font-black shadow-xl w-full sm:w-auto"
          >
            <Printer className="w-4 h-4 mr-2" /> Print Result
          </Button>
        )}
      </div>

      <Card className="p-6 sm:p-8 rounded-[2rem] border-none shadow-sm bg-white no-print mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Session</label>
            <Select value={filters.session} onValueChange={(val) => setFilters({...filters, session: val})}>
              <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold">
                <SelectValue placeholder="Select Session" />
              </SelectTrigger>
              <SelectContent>
                {["2024/2025", "2025/2026", "2026/2027"].map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Term</label>
            <Select value={filters.term} onValueChange={(val) => setFilters({...filters, term: val})}>
              <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold">
                <SelectValue placeholder="Select Term" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1st Term">First Term</SelectItem>
                <SelectItem value="2nd Term">Second Term</SelectItem>
                <SelectItem value="3rd Term">Third Term</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={fetchResults} 
            disabled={loading} 
            className="h-12 rounded-xl bg-red-900 text-white font-black hover:bg-red-800 shadow-lg w-full"
          >
            {loading ? <Loader2 className="animate-spin mx-auto w-4 h-4" /> : <><Search className="w-4 h-4 mr-2" /> View Result</>}
          </Button>
        </div>
      </Card>

      {student && (
        <Card className="p-8 rounded-2xl bg-white border border-slate-300 shadow-md mb-6 no-print">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Full Name</p>
                  <p className="text-xl font-black text-slate-900">{student.first_name} {student.surname}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Admission No.</p>
                  <p className="text-lg font-bold text-slate-800">{student.admission_number}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Class</p>
                  <p className="text-lg font-bold text-slate-800">{student.current_class}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Term</p>
                  <p className="text-lg font-bold text-slate-800">{filters.term} {filters.session}</p>
                </div>
              </div>
            </div>
            <div className="w-24 h-24 bg-slate-100 rounded-lg border-2 border-slate-300 flex items-center justify-center">
              {student.passport_url ? (
                <img 
                  src={student.passport_url} 
                  alt="Student" 
                  className="w-full h-full object-cover rounded-lg" 
                />
              ) : (
                <User className="w-10 h-10 text-slate-400" />
              )}
            </div>
          </div>
        </Card>
      )}

      {student && (
        <div ref={printRef} className="space-y-6">
          {results.length > 0 ? (
            <>
              <div className="w-full overflow-x-auto border border-slate-400 bg-white rounded-xl">
                <table className="w-full min-w-[800px] text-sm">
                  <thead>
                    <tr className="bg-slate-900">
                      <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase border-r border-slate-700">Subject</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase border-r border-slate-700">CA 1</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase border-r border-slate-700">CA 2</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase border-r border-slate-700">Exam</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase border-r border-slate-700">Total</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((row, i) => (
                      <tr key={i} className="border-b border-slate-300 hover:bg-slate-50">
                        <td className="px-4 py-3 font-bold text-slate-900 border-r border-slate-300">{row.subject}</td>
                        <td className="px-4 py-3 text-center border-r border-slate-300">{row.ca1}</td>
                        <td className="px-4 py-3 text-center border-r border-slate-300">{row.ca2}</td>
                        <td className="px-4 py-3 text-center border-r border-slate-300">{row.exam}</td>
                        <td className="px-4 py-3 text-center font-bold text-red-900 border-r border-slate-300">{row.total}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center justify-center w-8 h-8 font-bold text-sm rounded-lg ${
                            row.grade === 'A' ? 'bg-green-200 text-green-900' :
                            row.grade === 'B' ? 'bg-blue-200 text-blue-900' :
                            row.grade === 'C' ? 'bg-yellow-200 text-yellow-900' :
                            'bg-red-200 text-red-900'
                          }`}>
                            {row.grade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Card className="p-4 rounded-xl bg-slate-100 border border-slate-400">
                    <p className="text-[10px] font-bold text-slate-600 uppercase mb-1">Total</p>
                    <p className="text-2xl font-black text-slate-900">{overallTotal}</p>
                  </Card>
                  <Card className="p-4 rounded-xl bg-slate-100 border border-slate-400">
                    <p className="text-[10px] font-bold text-slate-600 uppercase mb-1">Average</p>
                    <p className="text-2xl font-black text-slate-900">{overallAverage}%</p>
                  </Card>
                  <Card className="p-4 rounded-xl bg-slate-100 border border-slate-400">
                    <p className="text-[10px] font-bold text-slate-600 uppercase mb-1">Class Avg</p>
                    <p className="text-2xl font-black text-slate-900">{classStats?.classAverage || '0.00'}%</p>
                  </Card>
                  <Card className="p-4 rounded-xl bg-slate-100 border border-slate-400">
                    <p className="text-[10px] font-bold text-slate-600 uppercase mb-1">Position</p>
                    <p className="text-2xl font-black text-slate-900">
                      {studentPosition ? `${studentPosition.position}${getOrdinal(studentPosition.position)}` : 'N/A'}
                    </p>
                    <p className="text-xs text-slate-600">out of {classStats?.totalStudents || 0}</p>
                  </Card>
                </div>

                <div className="space-y-3">
                  <Card className="p-4 rounded-xl bg-slate-100 border border-slate-400">
                    <p className="text-xs font-bold text-blue-800 uppercase mb-2">Form Teacher's Remark</p>
                    <p className="text-sm text-slate-900 italic">"{summary?.teacher_remark || 'No remark provided'}"</p>
                  </Card>
                  <Card className="p-4 rounded-xl bg-slate-100 border border-slate-400">
                    <p className="text-xs font-bold text-green-800 uppercase mb-2">Principal's Comment</p>
                    <p className="text-sm text-slate-900 italic">"{summary?.principal_comment || 'No comment provided'}"</p>
                  </Card>
                </div>
              </div>

              <Card className="bg-slate-900 text-white p-5 flex items-center gap-4 rounded-xl border-none">
                <Award className="w-7 h-7 text-yellow-400" />
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Performance</p>
                  <p className="text-2xl font-black">{getOverallRemark(overallAverage)}</p>
                </div>
              </Card>
            </>
          ) : hasSearched ? (
            <Card className="p-12 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300 text-center no-print">
              <FileQuestion className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-black text-slate-900 uppercase">No Records Found</h3>
              <p className="text-sm text-slate-600">Results for this period are not available yet.</p>
            </Card>
          ) : (
            <div className="text-center p-8 no-print">
              <p className="text-xs font-black uppercase text-slate-400">Select session and term to view results</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export { StudentResults };