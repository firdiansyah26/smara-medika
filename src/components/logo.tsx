import { cn } from "@/lib/utils";

type LogoProps = {
  /** "full" = mark + wordmark, "mark" = ikon saja */
  variant?: "full" | "mark";
  className?: string;
};

/** Ikon merek SmaraMedika: hati (kepedulian) + garis detak/ECG (rekam medis). */
function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="SmaraMedika"
      className={className}
    >
      <defs>
        <linearGradient
          id="smaraLogoMark"
          x1="2"
          y1="3"
          x2="22"
          y2="21"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#14B8A6" />
          <stop offset="1" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"
        fill="url(#smaraLogoMark)"
      />
      <path
        d="M4 12.6h3.4l1.5-3.3 2.2 6.2 1.7-3.9.9 1h4.2"
        fill="none"
        stroke="#ffffff"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ variant = "full", className }: LogoProps) {
  if (variant === "mark") {
    return <Mark className={cn("h-8 w-8", className)} />;
  }

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Mark className="h-8 w-8 shrink-0" />
      <span className="text-xl font-bold tracking-tight">
        <span className="text-ink">Smara</span>
        <span className="text-brand">Medika</span>
      </span>
    </span>
  );
}
