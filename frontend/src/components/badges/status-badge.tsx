import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { STATUS } from "@/enums/status.enum";

const statusClassMap: Record<STATUS, string> = {
  [STATUS.NOT_STARTED]: "bg-slate-200 text-slate-800",
  [STATUS.IN_PROGRESS]: "bg-blue-200 text-blue-800",
  [STATUS.COMPLETED]: "bg-emerald-200 text-emerald-800",
};

const checkboxClassMap: Record<STATUS, string> = {
  [STATUS.NOT_STARTED]: "border-slate-400 data-[state=checked]:bg-slate-400 data-[state=checked]:border-slate-400 data-checked:bg-slate-400 data-checked:border-slate-400 text-slate-800 data-checked:text-slate-100",
  [STATUS.IN_PROGRESS]: "border-blue-400 data-[state=checked]:bg-blue-400 data-[state=checked]:border-blue-400 data-checked:bg-blue-400 data-checked:border-blue-400 text-blue-800 data-checked:text-blue-100",
  [STATUS.COMPLETED]: "border-emerald-500 data-[state=checked]:bg-transparent data-[state=checked]:border-emerald-500 data-checked:bg-transparent data-checked:border-emerald-500 text-emerald-800 data-checked:text-emerald-800 [&_svg]:text-emerald-800 data-[state=checked]:text-emerald-800",
};

const formatLabel = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

interface StatusBadgeProps {
  status: STATUS;
  className?: string;
  isInteractive?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export function StatusBadge({ status, className, isInteractive, onClick }: StatusBadgeProps) {
  return (
    <Badge
      className={`${statusClassMap[status]} flex items-center justify-between gap-1 px-1 py-0.5 rounded-none transition-all uppercase tracking-wider font-semibold ${className || ""}`}
      onClick={onClick}
    >
      {isInteractive !== undefined && (
        <div className={`shrink-0 flex items-center justify-center ${isInteractive ? "" : "invisible pointer-events-none"}`}>
          <Checkbox
            checked={status === STATUS.COMPLETED}
            className={`${checkboxClassMap[status]} h-3.5 w-3.5 rounded-none shadow-none cursor-pointer`}
            tabIndex={-1}
            disabled={!isInteractive}
          />
        </div>
      )}
      <span className="truncate text-left flex-1">{formatLabel(status)}</span>
    </Badge>
  );
}
