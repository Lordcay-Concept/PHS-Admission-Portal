import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import WelcomeStats from "@/components/WelcomeStats";
import TeacherGallery from "@/components/TeacherGallery";
import Facilities from "@/components/Facilities";
import ContactUs from "@/components/ContactUs";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <WelcomeStats />
      <TeacherGallery />
      <Facilities />
      <ContactUs />
      <Footer/>
      
      <footer className="py-10 bg-gray-900 text-gray-400 text-center">
        <p>© 2026 Possible Height Schools. All Rights Reserved.</p>
      </footer>
    </main>
  );
}