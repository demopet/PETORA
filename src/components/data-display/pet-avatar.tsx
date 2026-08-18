import * as React from "react";
import { cn } from "@/lib/utils";
import { PawPrint, Cat, Bird, Rabbit, Fish, HelpCircle } from "lucide-react";

interface PetAvatarProps {
  name: string;
  species?: string;
  photoUrl?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const speciesIcons: Record<string, React.ReactNode> = {
  dog: <PawPrint className="h-1/2 w-1/2" />,
  cat: <Cat className="h-1/2 w-1/2" />,
  bird: <Bird className="h-1/2 w-1/2" />,
  rabbit: <Rabbit className="h-1/2 w-1/2" />,
  fish: <Fish className="h-1/2 w-1/2" />,
};

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

function getSpeciesKey(species?: string): string {
  if (!species) return "";
  const s = species.toLowerCase();
  if (s.includes("dog") || s.includes("anjing")) return "dog";
  if (s.includes("cat") || s.includes("kucing")) return "cat";
  if (s.includes("bird") || s.includes("burung")) return "bird";
  if (s.includes("rabbit") || s.includes("kelinci")) return "rabbit";
  if (s.includes("fish") || s.includes("ikan")) return "fish";
  return "";
}

function PetAvatar({ name, species, photoUrl, size = "md", className }: PetAvatarProps) {
  const speciesKey = getSpeciesKey(species);
  const fallback = speciesIcons[speciesKey];

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden rounded-full bg-slate-100",
        sizeClasses[size],
        className
      )}
      title={name}
    >
      {photoUrl ? (
        <img src={photoUrl} alt={name} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <span className="text-slate-500">{fallback || <HelpCircle className="h-1/2 w-1/2" />}</span>
      )}
    </div>
  );
}

export { PetAvatar };
