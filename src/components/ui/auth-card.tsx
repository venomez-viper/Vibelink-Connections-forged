import React from "react";
import { cn } from "@/lib/utils";

interface AuthCardProps {
  mode: "login" | "signup";
  children: React.ReactNode;
  className?: string;
}

// Shared glassmorphism card used on all auth pages.
// mode="login"  → max-w-md  (420px)
// mode="signup" → max-w-2xl (672px, matches the 10-step form width)
const AuthCard: React.FC<AuthCardProps> = ({ mode, children, className }) => {
  return (
    <div
      className={cn(
        "relative z-10 w-full mx-4 my-8 rounded-2xl overflow-hidden",
        "border border-white/[0.08]",
        "shadow-2xl",
        mode === "signup" ? "max-w-2xl" : "max-w-md",
        className
      )}
      style={{
        background: "rgba(43, 21, 28, 0.90)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
      }}
    >
      <div className="p-8 md:p-10">
        {children}
      </div>
    </div>
  );
};

export default AuthCard;
