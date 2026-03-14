"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Sparkles, Microscope, BookOpen, GraduationCap, Trophy, X, Maximize2 } from "lucide-react";

const facilitiesData = [
  {
    category: "Sports",
    icon: <Trophy size={16} />,
    imgs: ["/images/facilities/sports/Sport 2.jpeg", "/images/facilities/sports/Sport 1.jpeg", "/images/facilities/sports/Sport 3.jpg"]
  },
  {
    category: "Library",
    icon: <BookOpen size={16} />,
    imgs: ["/images/facilities/lib/Lib 2.jpeg", "/images/facilities/lib/Lib 3.jpg"]
  },
  {
    category: "Science",
    icon: <Microscope size={16} />,
    imgs: ["/images/facilities/lab/Lab 1.jpeg", "/images/facilities/lab/Lab 2.jpeg", "/images/facilities/lab/Lab 3.jpg"]
  },
  {
    category: "Classes",
    icon: <GraduationCap size={16} />,
    imgs: ["/images/facilities/classroom/Class 1.jpeg", "/images/facilities/classroom/Class 2.jpeg", "/images/facilities/classroom/Class 3.jpeg"]
  }
];

export default function Facilities() {
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  return (
    <section id="facilities" className="py-16 bg-white scroll-mt-20 overflow-hidden">
      <div className="container mx-auto px-6 max-w-6xl">
        
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="flex items-center gap-2 text-red-900 mb-1">
            <Sparkles size={14} className="fill-red-900" />
            <span className="uppercase tracking-[0.6em] text-[12px] font-black">Quick Tour</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Campus Facilities</h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {facilitiesData.map((section, idx) => (
            <div key={idx} className="group flex flex-col space-y-3">
              <div className="flex items-center gap-2 px-1">
                <span className="text-red-900 bg-red-50 p-1.5 rounded-md group-hover:bg-red-900 group-hover:text-white transition-all">
                  {section.icon}
                </span>
                <h3 className="font-black text-[14px] uppercase tracking-widest text-slate-600">{section.category}</h3>
              </div>

              <div className="relative h-[200px] w-full overflow-hidden rounded-2xl bg-slate-50 border border-slate-100 shadow-sm transition-all duration-500 hover:shadow-lg">
                <motion.div 
                  className="flex h-full cursor-pointer"
                  onMouseEnter={(e) => (e.currentTarget.parentElement!.style.overflow = "hidden")}
                  animate={{ x: ["0%", "-100%"] }}
                  whileHover={{ transition: { duration: 0 } }} 
                  transition={{ duration: 12, repeat: Infinity, ease: "linear", repeatType: "loop" }}
                  style={{ width: `${section.imgs.length * 100}%` }}
                >
                  {[...section.imgs, ...section.imgs].map((img, i) => (
                    <div 
                      key={i} 
                      className="relative h-full w-full flex-shrink-0"
                      onClick={() => setSelectedImg(img)}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Maximize2 size={16} className="text-white" />
                      </div>
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedImg && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedImg(null)}
          >
            <motion.img 
              initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              src={selectedImg} className="max-h-[80vh] rounded-lg shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}