export default function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Ilona Socolov — Interior | Architektur"
    >
      {/* Top-left corner bracket */}
      <path
        d="M2 0 L2 2 L0 2 L0 0 Z"
        fill="currentColor"
        transform="translate(0, 0)"
      />
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

      {/* Small green accent square */}
      <rect
        x="195"
        y="22"
        width="18"
        height="18"
        rx="0"
        fill="#b8cc3c"
        opacity="0.85"
      />
      <rect
        x="200"
        y="27"
        width="8"
        height="8"
        rx="0"
        fill="white"
      />
    </svg>
  );
}
