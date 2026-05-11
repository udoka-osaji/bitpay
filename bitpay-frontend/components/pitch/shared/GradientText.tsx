"use client";

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  gradient?: "primary" | "secondary" | "accent";
}

export function GradientText({
  children,
  className = "",
  gradient = "primary"
}: GradientTextProps) {
  const gradients = {
    primary: "bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600",
    secondary: "bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600",
    accent: "bg-gradient-to-r from-orange-400 to-pink-600",
  };

  return (
    <span
      className={`${gradients[gradient]} bg-clip-text text-transparent ${className}`}
    >
      {children}
    </span>
  );
}
