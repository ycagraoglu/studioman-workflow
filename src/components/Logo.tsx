import React from "react";
import { AuroraText } from "@/components/ui/aurora-text";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <h1 className={cn("text-xl font-bold tracking-tighter md:text-2xl", className)}>
      Studio<AuroraText>Man</AuroraText>
    </h1>
  );
}
