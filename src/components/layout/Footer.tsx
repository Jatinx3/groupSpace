export default function Footer() {
  return (
    <footer className="mt-16 pt-10 border-t border-slate-200 text-sm text-slate-500">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        
        <p>
          © {new Date().getFullYear()} GroupSpace. Built for students.
        </p>

        <div className="flex items-center gap-6">
          <span className="hover:text-slate-700 transition cursor-pointer">
            Privacy
          </span>
          <span className="hover:text-slate-700 transition cursor-pointer">
            Support
          </span>
          <span className="hover:text-slate-700 transition cursor-pointer">
            Version 1.0
          </span>
        </div>
      </div>
    </footer>
  );
}
