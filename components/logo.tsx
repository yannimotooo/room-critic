export default function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 185 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Ilona Socolov — Interior | Architektur"
    >
      {/* Top-left corner bracket */}
      <rect x="0" y="0" width="3" height="28" fill="currentColor" />
      <rect x="0" y="0" width="22" height="3" fill="currentColor" />

      {/* Bottom-right corner bracket */}
      <rect x="178" y="52" width="3" height="28" fill="currentColor" />
      <rect x="159" y="77" width="22" height="3" fill="currentColor" />

      {/* ILONA SOCOLOV text */}
      <text
        x="16"
        y="38"
        fontFamily="'Space Grotesk', system-ui, sans-serif"
        fontSize="26"
        letterSpacing="1.5"
        fill="currentColor"
      >
        <tspan fontWeight="700">ILONA</tspan>
        <tspan fontWeight="300"> SOCOLOV</tspan>
      </text>

      {/* Interior | Architektur subtitle */}
      <text
        x="17"
        y="58"
        fontFamily="'Space Grotesk', system-ui, sans-serif"
        fontSize="12"
        letterSpacing="2.5"
        fill="currentColor"
        opacity="0.5"
      >
        <tspan>Interior</tspan>
        <tspan dx="6" opacity="0.6">|</tspan>
        <tspan dx="6">Architektur</tspan>
      </text>
    </svg>
  );
}
