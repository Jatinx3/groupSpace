"use client";

export default function Demo() {
  return (
    <section
      id="demo"
      className="relative py-24 px-6 border-b border-black/5 bg-[#F3F3F3] overflow-hidden"
    >
      <div className="relative z-10 max-w-[1200px] mx-auto">
        <div className="mb-10 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500 mb-4">
            Product Demo
          </p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">
            See GroupSpace in Action
          </h2>
          <p className="mt-4 text-sm md:text-base text-neutral-600 max-w-xl mx-auto">
            A quick walkthrough of how teams use GroupSpace to coordinate work,
            track progress, and keep every project on rails.
          </p>
        </div>

        <div className="relative aspect-video w-full max-w-4xl mx-auto overflow-hidden rounded-xl border border-black/10 bg-black">
          {/* Replace the src below with your real demo video URL */}
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/dQw4w9WgXcQ"
            title="GroupSpace demo"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}

