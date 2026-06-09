import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import HowItWorks from "../components/landing/HowItWorks";
import Benefits from "../components/landing/Benefits";
import CTA from "../components/landing/CTA";
import Footer from "../components/landing/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F3F3F3] text-black font-sans selection:bg-black selection:text-white">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Benefits />
      {/* Testimonials section is temporarily hidden but kept in the codebase */}
      {/* <Testimonials /> */}
      <CTA />
      <Footer />
    </main>
  );
}
