"use client";

import React from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image"; 

interface LetterProps {
  studentName: string;
  className: string;
  admissionDate: string;
  passportUrl?: string;
}

export default function AdmissionLetter({ studentName, className, admissionDate, passportUrl }: LetterProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center p-4 pb-32 min-h-screen bg-slate-100 print:bg-white print:p-0">
      
      <div id="printable-area" className="w-[210mm] min-h-[297mm] bg-white shadow-2xl p-[20mm] relative overflow-hidden print:shadow-none print:w-full print:m-0">
        
        <div className="flex justify-between items-start border-b-4 border-red-900 pb-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20">
              <Image 
                src="/images/logo/PHS Logo.webp" 
                alt="Possible Height Schools Logo" 
                fill
                className="object-contain"
                priority 
              />
            </div>
            <div>
              <h1 className="text-3xl font-black text-red-900 uppercase leading-none">
                Possible Height<br/>Schools
              </h1>
              <p className="text-[10px] tracking-[0.3em] font-bold text-slate-500 uppercase mt-1">
                Excellence in Learning & Character
              </p>
            </div>
          </div>
        
          <div className="text-right text-xs text-slate-500 font-medium pt-2">
            <p>123 School Avenue, Abuja</p>
            <p>admissions@possibleheight.com</p>
            <p>www.possibleheight.com</p>
            <p className="mt-2 font-bold text-slate-900">{admissionDate}</p>
          </div>
        </div>

        
        <div className="space-y-6 text-slate-800 leading-relaxed text-sm">
          <div className="relative flex items-center justify-center mb-16 pt-4">
    <h2 className="text-xl font-bold uppercase underline decoration-red-900 underline-offset-8">
      Offer of Provisional Admission
    </h2>

    {passportUrl && (
      <div className="absolute right-0 top-1/2 -translate-y-1/3 w-32 h-32 border-2 border-slate-200 rounded-lg overflow-hidden shadow-sm bg-slate-50">
        <img 
          src={passportUrl} 
          alt="Student Passport" 
          className="w-full h-full object-cover" 
        />
      </div>
    )}
  </div>

  <p className="font-bold">Dear {studentName},</p>

          <p>
            Following your successful performance in our recent entrance assessment and a thorough review of your application, 
            the Management of <strong>Possible Height Schools</strong> is pleased to offer you provisional admission into 
            <strong> {className}</strong> for the 2026/2027 Academic Session.
          </p>

          <p>
            This offer is a testament to your academic potential. At Possible Height, we are committed to providing a 
            world-class education that balances academic rigor with character development. We are confident that 
            you will be a valuable addition to our student body.
          </p>

          <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 space-y-3">
            <p className="font-bold text-red-900 uppercase text-sm tracking-wider">Conditions of Admission:</p>
            <ul className="list-disc pl-5 space-y-2 text-xs">
              <li><strong>Acceptance Fee:</strong> A non-refundable acceptance fee must be paid within 14 days to secure your slot.</li>
              <li><strong>Documentation:</strong> You are required to present original copies of your birth certificate and previous school reports for sighting upon resumption.</li>
              <li><strong>Medical Report:</strong> A certified medical fitness report from a recognized hospital is mandatory.</li>
            </ul>
          </div>

          <p>
            Please log in to your student portal to complete your registration and download the school prospectus. 
            We look forward to welcoming you on resumption day.
          </p>

          <p className="pt-4 text-sm italic">Congratulations on your success!</p>

          <div className="pt-10 flex flex-col">
              <div className="relative w-48 h-20">
                <Image 
                  src="/images/signature/Mgt Signature.png" 
                  alt="Proprietress Signature" 
                  fill
                  className="object-contain object-left-bottom"
                />
              </div>
             <div className="mt-1 border-t border-slate-200 pt-2 w-48">
                <p className="font-bold text-slate-900">Proprietress</p>
                <p className="text-xs text-slate-500 uppercase tracking-tighter">Possible Height Schools</p>
             </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-0 w-full text-center opacity-5 pointer-events-none">
           <h3 className="text-7xl font-black uppercase rotate-[-25deg] text-slate-200">Possible Height</h3>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full p-6 bg-white border-t shadow-lg flex justify-center z-50 print:hidden">
        <Button onClick={handlePrint} size="lg" className="bg-red-900 hover:bg-red-800 gap-2 rounded-full px-12 h-14 text-base font-bold shadow-red-900/20 shadow-xl">
          <Printer size={20} /> Print Admission Letter
        </Button>
      </div>
    </div>
  );
}