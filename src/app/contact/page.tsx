import { BackgroundPattern } from "@/components/landing/BackgroundPattern";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Mail, MapPin, Clock } from "lucide-react";

const contactInfo = [
  {
    icon: Mail,
    label: "Email",
    value: "hello@groupspace.app",
    description: "We aim to respond within one business day.",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "University Campus",
    description: "Built for and by university students.",
  },
  {
    icon: Clock,
    label: "Support Hours",
    value: "Mon – Fri, 9am – 6pm",
    description: "Outside hours? Email us and we'll get back to you.",
  },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#F3F3F3] text-black font-sans selection:bg-black selection:text-white">
      <Navbar />

      <section className="relative pt-40 pb-24 px-6 border-b border-black/5 overflow-hidden">
        <BackgroundPattern variant="architectural" opacity={0.05} />
        <div className="relative z-10 max-w-[1600px] mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-6">Company</p>
          <h1 className="text-[10vw] leading-[0.8] font-black tracking-tighter uppercase text-black">
            Contact
          </h1>
          <p className="mt-10 max-w-lg text-lg font-medium leading-snug tracking-tight text-neutral-600">
            Got a question, a bug report, or just want to say hello? We're a small team and we read every message.
          </p>
        </div>
      </section>

      <section className="relative py-24 px-6 border-b border-black/5 overflow-hidden">
        <BackgroundPattern variant="dots" opacity={0.03} />
        <div className="relative z-10 max-w-[1600px] mx-auto">
          <div className="grid md:grid-cols-3 border-t border-l border-black/10 mb-24">
            {contactInfo.map((item) => (
              <div key={item.label} className="group p-10 border-r border-b border-black/10 hover:bg-white transition-colors duration-500">
                <item.icon className="w-6 h-6 stroke-[1] mb-12" />
                <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">{item.label}</p>
                <p className="text-2xl font-bold uppercase tracking-tight mb-4 group-hover:translate-x-2 transition-transform duration-300">
                  {item.value}
                </p>
                <p className="text-neutral-600 text-sm font-medium">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-20">
            <div>
              <h2 className="text-5xl font-black tracking-tighter uppercase leading-[0.85] mb-6">
                Send us a
                <br />
                <span className="text-neutral-400">message</span>
              </h2>
              <p className="text-neutral-600 text-sm font-medium max-w-sm">
                Whether you're a student, professor, or administrator evaluating GroupSpace for your institution, we'd love to hear from you.
              </p>
            </div>

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    className="w-full border border-black/10 bg-transparent px-4 py-3 text-sm font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    className="w-full border border-black/10 bg-transparent px-4 py-3 text-sm font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                  Subject
                </label>
                <input
                  id="subject"
                  type="text"
                  placeholder="What's this about?"
                  className="w-full border border-black/10 bg-transparent px-4 py-3 text-sm font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={6}
                  placeholder="Tell us more..."
                  className="w-full border border-black/10 bg-transparent px-4 py-3 text-sm font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                className="px-8 py-4 bg-black text-white text-sm font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
