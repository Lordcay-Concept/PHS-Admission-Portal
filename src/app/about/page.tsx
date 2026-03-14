"use client";

import { useState } from "react";
import Image from "next/image";
import { CheckCircle2, Target, History, BookOpenCheck, GraduationCap, Award } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";

const modalData = {
  mission: {
    title: "Our Mission",
    content: "To provide a nurturing environment where academic excellence meets character development, empowering students to reach their Possible Height through innovative teaching and godly principles."
  },
  vision: {
    title: "Our Vision",
    content: "To become a premier educational institution in Nigeria, recognized for producing globally competitive leaders equipped with 21st-century skills and indigenous values."
  },
  history: {
    title: "Our History",
    content: "Founded with a vision to bridge the gap in quality education, Possible Height Schools began its journey with a commitment to excellence. Today, we stand as a beacon of hope with 100% success rates in WAEC and NECO, serving the community for years."
  }
};

export default function AboutPage() {
  const [activeModal, setActiveModal] = useState<keyof typeof modalData | null>(null);

  return (
    <main className="pt-24 bg-white overflow-hidden">
      <section id="about" className="py-20 scroll-mt-20 border-b border-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-5xl font-black text-slate-900 mb-6 uppercase tracking-tight">
              Our <span className="text-red-900">Identity</span>
            </h1>
            <p className="text-slate-600 text-lg leading-relaxed">
              Possible Height Schools is more than an institution; it is a community dedicated to the 
              holistic development of the Nigerian child.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div onClick={() => setActiveModal("mission")} className="cursor-pointer bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 hover:shadow-xl transition-all group">
              <div className="w-16 h-16 bg-red-900 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:rotate-6 transition-transform">
                <Target size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4">Our Mission</h3>
              <p className="text-slate-600 leading-relaxed italic opacity-70">Click to expand details...</p>
            </div>

            <div onClick={() => setActiveModal("vision")} className="cursor-pointer bg-red-900 p-10 rounded-[2.5rem] text-white shadow-2xl shadow-red-100 hover:scale-[1.02] transition-all">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-red-900 mb-6">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-2xl font-black mb-4">Our Vision</h3>
              <p className="text-red-50 leading-relaxed opacity-70">Click to expand details...</p>
            </div>

            <div onClick={() => setActiveModal("history")} className="cursor-pointer bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 hover:shadow-xl transition-all group">
              <div className="w-16 h-16 bg-red-900 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:rotate-6 transition-transform">
                <History size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4">Our History</h3>
              <p className="text-slate-600 leading-relaxed opacity-70">Click to expand details...</p>
            </div>
          </div>
        </div>
      </section>

      <Dialog open={activeModal !== null} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="bg-white rounded-[2.5rem] border-none shadow-2xl p-8 max-w-lg">
          {activeModal && (
            <DialogHeader>
              <DialogTitle className="text-3xl font-black text-red-900 uppercase">
                {modalData[activeModal].title}
              </DialogTitle>
              <DialogDescription className="text-slate-600 text-lg leading-loose pt-4">
                {modalData[activeModal].content}
              </DialogDescription>
            </DialogHeader>
          )}
        </DialogContent>
      </Dialog>

      <section id="proprietress" className="py-24 bg-slate-900 text-white relative">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center"> 
            <div className="flex justify-center lg:justify-start">
              <div className="relative w-full max-w-sm aspect-[4/5] rounded-[3rem] overflow-hidden border-4 border-white/10 shadow-2xl">
                <Image 
                  src="/images/proprietress/Proprietress.jpg" 
                  alt="Proprietress"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
              </div>
            </div>
            <div className="space-y-6"> 
              <div>
                <h2 className="text-3xl font-black">Message From The Proprietress</h2>
                <p className="text-red-500 font-bold uppercase tracking-widest text-sm">Possible Height Schools</p>
              </div>
              <div className="space-y-6 text-slate-300 leading-loose text-lg font-light">
                <p className="text-white font-bold text-2xl italic">"Education must start with the heart."</p>
                <p>Welcome to Possible Height Schools. Our commitment is to ensure that every child who passes through our gates discovers their unique potential. We blend academic rigor with strong moral values to produce well-rounded individuals ready for the world.</p>
                <p>We believe that education is a partnership between the school and the home. Together, we can help your child reach their Possible Height.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="curriculum" className="py-24 bg-white scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <span className="text-red-900 font-black uppercase tracking-widest text-sm">Academic Excellence</span>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mt-2">Our Curriculum</h2>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-[2.5rem] border border-slate-100 bg-slate-50">
               <h4 className="text-xl font-black text-red-900 mb-6 flex items-center gap-2"><BookOpenCheck size={20} /> Nursery</h4>
               <ul className="space-y-4 text-slate-600 font-medium"><li>• Literacy & Phonics</li><li>• Numeracy Skills</li><li>• Creative Arts</li><li>• Social Norms</li></ul>
            </div>
            <div className="p-8 rounded-[2.5rem] border border-slate-100 bg-slate-50 shadow-lg shadow-slate-100">
               <h4 className="text-xl font-black text-red-900 mb-6 flex items-center gap-2"><GraduationCap size={20} /> Primary</h4>
               <ul className="space-y-4 text-slate-600 font-medium"><li>• Basic Science</li><li>• Mathematics</li><li>• ICT Literacy</li><li>• Quantitative Reasoning</li></ul>
            </div>
            <div className="p-8 rounded-[2.5rem] border border-slate-100 bg-slate-50">
               <h4 className="text-xl font-black text-red-900 mb-6 flex items-center gap-2"><Award size={20} /> Secondary</h4>
               <ul className="space-y-4 text-slate-600 font-medium"><li>• STEM Subjects</li><li>• Humanities</li><li>• Vocational Studies</li><li>• Exam Prep (WAEC/NECO)</li></ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}