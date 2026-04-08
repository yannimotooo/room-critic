export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <p className="text-lg tracking-[3px] leading-none">
        <span className="font-bold">ILONA</span>
        <span className="font-light"> SOCOLOV</span>
      </p>
      <p className="text-[10px] tracking-[3px] text-muted mt-1.5">
        Interior
        <span className="mx-2 opacity-50">|</span>
        Architektur
      </p>
    </div>
  );
}
