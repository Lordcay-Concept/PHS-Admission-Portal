"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LogIn, FileText } from "lucide-react";

const slides = [
  {
    image: "/images/hero/Hero1.jpg", 
    title: "Empowering the Leaders of Tomorrow",
    sub: "Excellence in every lesson, character in every action."
  },
  {
    image: "/images/hero/Hero2.jpg",
    title: "A World-Class Nigerian Education",
    sub: "Blending tradition with modern academic standards."
  },
  {
    image: "/images/hero/Hero3.jpg",
    title: "Nurturing Potential, Building Dreams",
    sub: "Your child's future starts at Possible Height Schools."
  }
];

export default function Hero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((prev) => (prev + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full h-[85vh] md:h-[90vh] mt-16 overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <motion.div 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 5 }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slides[current].image})` }}
          />
          <div className="absolute inset-0 bg-black/50" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
        <motion.div
          key={`text-${current}`}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="max-w-4xl"
        >
          <h1 className="text-4xl md:text-7xl font-black text-white mb-6 uppercase tracking-tighter drop-shadow-2xl">
            {slides[current].title}
          </h1>
          <p className="text-lg md:text-2xl text-gray-200 mb-10 font-medium max-w-2xl mx-auto">
            {slides[current].sub}
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/admission">
              <Button className="bg-red-900 hover:bg-red-800 text-white px-8 py-7 text-lg font-bold rounded-full shadow-xl transition-transform hover:scale-105">
                Apply Now
              </Button>
            </Link>

            <Link href="/login">
              <Button variant="outline" className="bg-white/10 text-white border-white/20 backdrop-blur-md px-8 py-7 text-lg font-bold rounded-full hover:bg-white hover:text-red-900 transition-all gap-2">
                <LogIn size={20} /> Portal Login
              </Button>
            </Link>

            <Link href="/portal/student/check">
              <Button variant="outline" className="bg-white/10 text-white border-white/20 backdrop-blur-md px-8 py-7 text-lg font-bold rounded-full hover:bg-white hover:text-red-900 transition-all gap-2">
                <FileText size={20} /> Check Result
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}