export default function FilterSidebar({ children }) {
  return (
    <div className="hidden lg:flex flex-col sticky top-24 bg-white border border-slate-200 rounded-2xl p-3 gap-3 h-[480px] overflow-y-auto">
      {children}
    </div>
  );
}
