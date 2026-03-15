interface LogoProps {
  className?: string;
  variant?: "light" | "dark";
  compact?: boolean;
}

const Logo = ({ className = "h-10", variant = "dark", compact = false }: LogoProps) => {
  const textColor = variant === "dark" ? "#F8F8FF" : "#0A1628";
  const globeBlue = "#60A5FA";
  const globeGray = "#94A3B8";

  if (compact) {
    return (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="20" cy="20" r="14" stroke={globeBlue} strokeWidth="1.5" fill="none" />
        <ellipse cx="20" cy="20" rx="8" ry="14" stroke={globeGray} strokeWidth="1" fill="none" />
        <ellipse cx="20" cy="20" rx="3" ry="14" stroke={globeGray} strokeWidth="0.7" fill="none" />
        <line x1="6" y1="14" x2="34" y2="14" stroke={globeGray} strokeWidth="0.7" />
        <line x1="6" y1="20" x2="34" y2="20" stroke={globeBlue} strokeWidth="1" />
        <line x1="6" y1="26" x2="34" y2="26" stroke={globeGray} strokeWidth="0.7" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 380 70"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* "GL⊕BAL" centered — total width ~138px, centered in 380 → start at 121 */}
      <g transform="translate(121, 0)">
        {/* GL */}
        <text x="0" y="32" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="32" fill={textColor} letterSpacing="2">
          GL
        </text>

        {/* Globe icon — placed immediately after GL (~43px) */}
        <g transform="translate(43, 4)">
          <circle cx="14" cy="14" r="12.5" stroke={globeBlue} strokeWidth="1.5" fill="none" />
          <ellipse cx="14" cy="14" rx="7" ry="12.5" stroke={globeGray} strokeWidth="0.8" fill="none" />
          <ellipse cx="14" cy="14" rx="3" ry="12.5" stroke={globeGray} strokeWidth="0.5" fill="none" />
          <line x1="1.5" y1="9" x2="26.5" y2="9" stroke={globeGray} strokeWidth="0.6" />
          <line x1="1.5" y1="14" x2="26.5" y2="14" stroke={globeBlue} strokeWidth="0.8" />
          <line x1="1.5" y1="19" x2="26.5" y2="19" stroke={globeGray} strokeWidth="0.6" />
        </g>

        {/* BAL — placed immediately after globe (43 + 28 = 71) */}
        <text x="71" y="32" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="32" fill={textColor} letterSpacing="2">
          BAL
        </text>
      </g>

      {/* DISTRIBUTION AS — centered */}
      <text x="190" y="60" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="500" fontSize="18" fill={textColor} letterSpacing="4" opacity="0.7">
        DISTRIBUTION AS
      </text>
    </svg>
  );
};

export default Logo;
