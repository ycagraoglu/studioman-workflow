import React from "react";
import { cn } from "../utils/cn";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <h1 className={cn("text-xl font-bold tracking-tighter md:text-2xl", className)}>
      Studio<span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Man</span>
    </h1>
  );
}
