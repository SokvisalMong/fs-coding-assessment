import { Badge } from "@/components/ui/badge";
import { PRIORITY } from "@/enums/priority.enum";

const priorityClassMap: Record<PRIORITY, string> = {
  [PRIORITY.LOW]: "bg-zinc-200 text-zinc-800",
  [PRIORITY.MEDIUM]: "bg-amber-200 text-amber-800",
  [PRIORITY.HIGH]: "bg-rose-200 text-rose-800",
};

const formatLabel = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

interface PriorityBadgeProps {
  priority: PRIORITY;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <Badge className={`${priorityClassMap[priority]}${className ? ` ${className}` : ""}`}>
      {formatLabel(priority)}
    </Badge>
  );
}
