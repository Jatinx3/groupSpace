export default function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-100 py-5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">
          © {new Date().getFullYear()} Collably
        </p>
        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">
          Built by Jatin with{" "}
          <span className="text-gray-900">♥</span>
        </p>
      </div>
    </footer>
  );
}
