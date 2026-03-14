"use client";
import { motion } from "framer-motion";
import { useRef, useEffect, useState } from "react";

const staffData = [
  { name: "Mrs. Stella Peters", subject: "Principal", img: "/images/teachers/Principal.jpg" },
  { name: "Mr. George Benjamin", subject: "Vice Principal", img: "/images/teachers/Vice Principal.jpg" },
  { name: "Mrs. Charity Uzor", subject: "Headmistress", img: "/images/teachers/Headmistress.jpg" },
  { name: "Mrs. Favour Simeon", subject: "English", img: "/images/teachers/Teacher 2.jpg" },
  { name: "Mr. Solomon Eze", subject: "Mathematics", img: "/images/teachers/Teacher 1.jpg" },
  { name: "Mrs. Grace Ekeh", subject: "Biology", img: "/images/teachers/Teacher 3.jpg" },
  { name: "Mrs. Chioma Ifeanyi", subject: "Agriculture", img: "/images/teachers/Teacher 5.jpg" },
  { name: "Mr. Kings Ben", subject: "Physics", img: "/images/teachers/Teacher 6.jpg" },
  { name: "Mrs. Peace Henry", subject: "Government", img: "/images/teachers/Teacher 7.jpg" },
  { name: "Mrs. Zina Agu", subject: "Chemistry", img: "/images/teachers/Teacher 8.jpg" },
  { name: "Mr. Caleb Ama", subject: "Civic Education", img: "/images/teachers/Teacher 9.jpg" },
  { name: "Mrs. Ifeoma Chika", subject: "CRS", img: "/images/teachers/Teacher 10.jpg" },
  { name: "Miss. Bella Ijeh", subject: "Basic Science", img: "/images/teachers/Teacher 11.jpg" },
  { name: "Mr. Kelvin Jude", subject: "Further Mathematics", img: "/images/teachers/Teacher 12.jpg" },
  { name: "Mr. Igwe Jude", subject: "Accouting", img: "/images/teachers/Teacher 14.jpg" },
  { name: "Mrs. Chika Ike", subject: "Social Studies", img: "/images/teachers/Teacher 15.jpg" },
  { name: "Mrs. Chidinma Ibeh", subject: "Marketing", img: "/images/teachers/Teacher 16.jpg" },
  { name: "Miss. Divine John", subject: "Home Economics", img: "/images/teachers/Teacher 17.jpg" },
  { name: "Mrs. Ijeoma Igwe", subject: "History", img: "/images/teachers/Teacher 19.jpg" },
  { name: "Miss. Christiana Kennedy", subject: "Food & Nutrition", img: "/images/teachers/Teacher 18.jpg" },
  { name: "Mrs. Suzzy Kalu", subject: "Food & Nutrition", img: "/images/teachers/Teacher 20.jpg" },
  { name: "Mrs. Jane Mena", subject: "CCA", img: "/images/teachers/Teacher 21.jpg" },
  { name: "Mrs. Precious Dim", subject: "Grade 6", img: "/images/teachers/Teacher 22.jpg" },
  { name: "Miss. Success Agu", subject: "Grade 5", img: "/images/teachers/Teacher 23.jpg" },
  { name: "Mrs. Obioma John", subject: "Grade 4", img: "/images/teachers/Teacher 24.jpg" },
  { name: "Mr. Ndubuisi Kalu", subject: "Grade 3", img: "/images/teachers/Teacher 25.jpg" },
  { name: "Mr. Nurudeen Poopola", subject: "Grade 2", img: "/images/teachers/Teacher 26.jpg" },
  { name: "Mr. Idongesit James", subject: "Grade 1", img: "/images/teachers/Teacher 27.jpg" },
  { name: "Mr. Kenneth Ibe", subject: "Accountant", img: "/images/teachers/Teacher 28.jpg" },
  { name: "Mr. Nenard Ekeh", subject: "Secretary", img: "/images/teachers/Teacher 29.jpg" },
];

export default function TeacherGallery() {
  const [width, setWidth] = useState(0);
  const carousel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (carousel.current) {
      setWidth(carousel.current.scrollWidth - carousel.current.offsetWidth);
    }
  }, [staffData]);

  return (
    <section id="gallery" className="py-24 bg-white overflow-hidden scroll-mt-20">
      <div className="container mx-auto px-4 mb-12 text-center">
        <h2 className="text-4xl md:text-5xl font-black text-gray-900">
          Meet Our <span className="text-red-900">Learned Educators</span>
        </h2>
      </div>

      <motion.div ref={carousel} className="cursor-grab active:cursor-grabbing px-4">
        <motion.div drag="x" dragConstraints={{ right: 0, left: -width }} className="flex gap-6 w-max">
          {staffData.map((staff, i) => (
            <div key={i} className="min-w-[280px] bg-slate-50 rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex-shrink-0">
              <img src={staff.img} alt={staff.name} className="w-full h-72 object-cover pointer-events-none" />
              <div className="p-6 text-center">
                <h3 className="font-bold text-xl text-gray-900">{staff.name}</h3>
                <p className="text-red-900 font-bold text-sm uppercase tracking-wider">{staff.subject}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}