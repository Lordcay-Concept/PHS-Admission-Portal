"use client";
import { useEffect, useRef, useState } from "react";
import { motion, animate, useInView } from "framer-motion";
import Image from "next/image";

function StatCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState("0");
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) {
      const controls = animate(0, value, {
        duration: 2,
        ease: "easeOut",
        onUpdate: (latest) => {
          setDisplayValue(Math.round(latest).toLocaleString());
        },
      });
      return () => controls.stop();
    }
  }, [inView, value]);

  return (
    <span ref={ref}>
      {displayValue}{suffix}
    </span>
  );
}

export default function WelcomeStats() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="w-full lg:w-1/2"
          >
            <h4 className="text-red-900 font-bold tracking-widest pl-9 mb-4 uppercase text-m">Welcome to our School</h4>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-8 leading-tight">
              Nurturing Every Child to Reach Their <span className="text-red-900">Possible Height</span>
            </h2>
            <div className="space-y-6 text-gray-700 leading-relaxed text-lg font-medium">
              <p>At Possible Height Schools, we believe that education is the bedrock of a successful future. Our environment is designed to foster creativity and critical thinking.</p>
              <p>With a blend of the Nigerian curriculum and international best practices, we ensure our students are globally competitive.</p>
            </div>
            <div className="mt-10">
               <p className="font-serif italic text-2xl text-gray-900 font-bold">— Mrs. Chioma Prosper Simeon</p>
               <p className="text-red-900 font-bold uppercase text-sm tracking-widest">The Proprietress</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="w-full lg:w-1/2 flex justify-center lg:justify-end"
          >
            <div className="rounded-3xl overflow-hidden shadow-2xl border-[8px] md:border-[12px] border-slate-50 relative h-[580px] md:h-[520px] w-full max-w-md bg-slate-100"> 
                <Image 
                  src="/images/proprietress/Proprietress.jpg" 
                  alt="Proprietress"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" 
                  className="object-cover object-top"
                />
              </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12 bg-white p-8 rounded-[2rem] shadow-sm border">
          {[
            { label: "Students", count: 1200, suffix: "+" },
            { label: "Staff", count: 85, suffix: "+" },
            { label: "Campuses", count: 3, suffix: "" },
            { label: "Success Rate", count: 100, suffix: "%" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <h4 className="text-3xl font-black text-red-900">
                <StatCounter value={stat.count} suffix={stat.suffix} />
              </h4>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}