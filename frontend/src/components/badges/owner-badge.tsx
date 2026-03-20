import { Badge } from "@/components/ui/badge";

interface OwnerBadgeProps {
  isOwner: boolean;
  className?: string;
}

export function OwnerBadge({ isOwner, className }: OwnerBadgeProps) {
  if (isOwner) {
    return (
      <Badge className={`bg-emerald-200 text-emerald-800${className ? ` ${className}` : ""}`}>
        You
      </Badge>
    );
  }

  return (
    <Badge className={`bg-slate-200 text-slate-800${className ? ` ${className}` : ""}`}>
      Other
    </Badge>
  );
}
