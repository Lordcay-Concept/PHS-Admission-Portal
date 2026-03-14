"use client";
import React from 'react';
import { jsPDF } from "jspdf";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  CheckCircle2, 
  Download, 
  CreditCard, 
  ArrowRight, 
  Info,
  School
} from "lucide-react";
import Link from "next/link";

export default function AdmissionInfoPage() {
  
  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      const schoolName = "POSSIBLE HEIGHT SCHOOLS";
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(127, 29, 29); 
      doc.text(schoolName, 105, 20, { align: "center" });
      
      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text("Official School Prospectus & Handbook", 105, 30, { align: "center" });
      doc.line(20, 35, 190, 35);

      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text("1. MISSION AND VISION", 20, 45);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      const missionText = "Our mission is to provide a nurturing environment where students are empowered to achieve academic excellence and character development. We envision a future where every child becomes a leader of integrity and high purpose.";
      doc.text(doc.splitTextToSize(missionText, 170), 20, 52);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("2. GENERAL SCHOOL RULES", 20, 75);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      const rules = [
        "• Resumption: All students must be in school premises by 7:30 AM.",
        "• Uniform: Students must appear in full, clean, and well-ironed school uniforms.",
        "• Conduct: Absolute respect for teachers, staff, and peers is mandatory.",
        "• Gadgets: Mobile phones and electronic games are strictly prohibited.",
        "• Attendance: A minimum of 90% attendance is required for termly promotion."
      ];
      doc.text(rules, 20, 82);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("3. THE ACADEMIC CURRICULUM", 20, 115);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      const curriculumText = "We run a robust blended curriculum integrating the Nigerian National Curriculum with British Montessori methods. We focus on Mathematics, English, Sciences, ICT, Diction, and Vocational Skills to ensure a balanced education.";
      doc.text(doc.splitTextToSize(curriculumText, 170), 20, 122);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("4. FEE PAYMENT POLICY", 20, 145);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      const feePolicy = "All fees must be settled on or before the first week of resumption. Payments should be made only via bank transfer or draft to the designated school accounts. Cash payments are not accepted at the front office.";
      doc.text(doc.splitTextToSize(feePolicy, 170), 20, 152);

      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text("Possible Height Schools © 2026 - Empowering Tomorrow's Leaders", 105, 280, { align: "center" });

      doc.save("Possible_Height_Schools_Prospectus.pdf");
      toast.success("Prospectus downloaded successfully!");
    } catch (err) {
      toast.error("Failed to generate PDF. Please try again.");
    }
  };

  const admissionLevels = [
    {
      level: "Early Years (Pre-School & Grade)",
      requirements: ["Birth Certificate", "Immunization Record", "2 Passport Photos", "Completed Medical Form"],
      items: ["Change of clothes", "Diapers/Wipes (Pre-School)", "Lunch box & Water bottle", "Resting mat"],
      fees: "₦85,000 - ₦120,000 per term"
    },
    {
      level: "Basic School (Basic 1 - 6)",
      requirements: ["Last Result from previous school", "Transfer Certificate", "Entrance Assessment", "4 Passport Photos"],
      items: ["School Uniform set", "Sportswear", "Stationery Kit", "Cardigan"],
      fees: "₦110,000 - ₦165,000 per term"
    },
    {
      level: "Secondary School (JSS & SSS)",
      requirements: ["Primary School Leaving Certificate", "Entrance Examination", "Transcript", "Birth Certificate"],
      items: ["Calculators (SSS)", "Lab Coat (Science)", "Technical Drawing Set", "Approved Textbooks"],
      fees: "₦180,000 - ₦250,000 per term"
    }
  ];

  const bankAccounts = [
    { level: "Pre-School, Grade & Basic", bank: "Zenith Bank", acc: "1012345678", name: "Possible Height Schools - NP" },
    { level: "Secondary School", bank: "GTBank", acc: "0123456789", name: "Possible Height Schools - SEC" },
    { level: "Development & Projects", bank: "Access Bank", acc: "0098765432", name: "Possible Height Schools - DEV" }
  ];

  return (
    <main className="min-h-screen bg-white">
      <section className="bg-red-900 pt-32 pb-20 text-white text-center px-4">
        <h1 className="text-4xl md:text-6xl font-black mb-4">Admissions & Entry</h1>
        <p className="text-xl opacity-90 max-w-2xl mx-auto">
          Everything you need to know about joining the Possible Height Schools family.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link href="/admission/apply">
             <Button className="bg-white text-red-900 hover:bg-slate-100 font-bold px-8 py-6 rounded-full text-lg shadow-xl transition-transform active:scale-95">
                Enroll Your Child Now <ArrowRight className="ml-2" />
             </Button>
          </Link>
        </div>
      </section>

      <section className="py-16 container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
           <div className="bg-slate-50 p-8 rounded-3xl border-2 border-dashed border-red-100 flex flex-col items-center text-center">
              <BookOpen className="w-12 h-12 text-red-900 mb-4" />
              <h3 className="font-bold text-xl mb-2">School Prospectus</h3>
              <p className="text-gray-600 mb-6 text-sm">Download our full handbook containing school rules, curriculum details, and culture.</p>
              <Button 
                onClick={generatePDF}
                variant="outline" 
                className="border-red-900 text-red-900 rounded-full hover:bg-red-900 hover:text-white transition-all"
              >
                 <Download className="mr-2 w-4 h-4" /> Download PDF Prospectus
              </Button>
           </div>
           <div className="md:col-span-2 bg-red-50 p-8 rounded-3xl relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="font-black text-2xl text-red-900 mb-4">Why Choose Us?</h3>
                <ul className="grid md:grid-cols-2 gap-4">
                   {['Qualified Educators', 'Standard Science Labs', 'British/Nigerian Curriculum', 'Conducive Environment', 'ICT Driven Learning', 'Character Development'].map((item) => (
                     <li key={item} className="flex items-center text-gray-700 font-medium">
                        <CheckCircle2 className="text-red-900 mr-2 w-5 h-5" /> {item}
                     </li>
                   ))}
                </ul>
              </div>
              <School className="absolute -bottom-10 -right-10 w-48 h-48 text-red-100 opacity-50" />
           </div>
        </div>
      </section>

      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-black text-center mb-12">Academic Levels & Requirements</h2>
          <div className="grid lg:grid-cols-3 gap-8">
            {admissionLevels.map((lvl) => (
              <div key={lvl.level} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-xl transition-shadow">
                <div className="bg-red-900 text-white w-fit px-4 py-1 rounded-full text-xs font-bold mb-4 uppercase">
                  {lvl.level}
                </div>
                <div className="mb-6">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                    <Info className="w-4 h-4 mr-2 text-red-900" /> Requirements:
                  </h4>
                  <ul className="space-y-2">
                    {lvl.requirements.map(r => <li key={r} className="text-sm text-gray-600 flex items-start">• {r}</li>)}
                  </ul>
                </div>
                <div className="mb-6">
                  <h4 className="font-bold text-gray-900 mb-3">Essentials (What to bring):</h4>
                  <ul className="space-y-1 text-sm text-gray-500">
                    {lvl.items.map(i => <li key={i}>{i}</li>)}
                  </ul>
                </div>
                <div className="pt-6 border-t border-slate-100">
                  <span className="text-xs text-gray-400 block uppercase font-bold">Estimated Fees</span>
                  <span className="text-xl font-black text-red-900">{lvl.fees}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white border-2 border-red-900/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
          <div className="text-center mb-10">
             <CreditCard className="w-12 h-12 text-red-900 mx-auto mb-4" />
             <h2 className="text-3xl font-black">School Account Details</h2>
             <p className="text-gray-500">Kindly use the appropriate account for fee payments and keep your receipts for validation.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {bankAccounts.map((acc) => (
              <div key={acc.level} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-red-200 transition-colors">
                 <span className="text-[10px] font-black uppercase text-red-900 block mb-2">{acc.level}</span>
                 <p className="text-sm font-bold text-gray-900">{acc.bank}</p>
                 <p className="text-xl font-black text-gray-900 my-1 tracking-tight">{acc.acc}</p>
                 <p className="text-[11px] text-gray-500 font-medium leading-tight">{acc.name}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-12 bg-yellow-50 p-5 rounded-2xl flex items-start gap-3 border border-yellow-100">
             <Info className="text-yellow-600 shrink-0 mt-1" />
             <p className="text-xs text-yellow-800 leading-relaxed">
               <strong>IMPORTANT NOTICE:</strong> All payments should be made via bank transfer or bank draft. We maintain a strict <strong>No-Cash Policy</strong> in the school office for security reasons. Please ensure the student's full name is used as the payment reference.
             </p>
          </div>
        </div>
      </section>

      <section className="py-20 text-center bg-red-900 text-white rounded-[3rem] mx-4 mb-10">
         <h2 className="text-4xl font-black mb-6">Ready to join our community?</h2>
         <p className="mb-10 opacity-80 max-w-xl mx-auto px-4">Start your child's journey toward excellence today by filling out our online application form.</p>
         <Link href="/admission/apply">
            <Button size="lg" className="bg-white text-red-900 hover:bg-slate-100 font-black px-12 py-8 rounded-2xl text-2xl shadow-2xl transition-all active:scale-95">
               Apply Now
            </Button>
         </Link>
      </section>
    </main>
  );
}