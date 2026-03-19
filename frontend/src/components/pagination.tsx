import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationNext,
  PaginationLink,
  PaginationItem,
  PaginationPrevious
} from "@/components/ui/pagination";
import { 
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  itemCount: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (limit: number) => void;
}

export function PaginationControls({
  currentPage,
  totalPages,
  itemsPerPage,
  itemCount,
  onPageChange,
  onItemsPerPageChange,
}: PaginationControlsProps) {
  const paginationLimits = [10, 20, 50, 100];

  const pagesToRender = (() => {
    if (totalPages <= 0) return [] as Array<number | "ellipsis">;
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = new Set<number>([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
    const normalizedPages = [...pages].filter((page) => page > 1 && page < totalPages).sort((a, b) => a - b);
    const result: Array<number | "ellipsis"> = [1];

    for (const page of normalizedPages) {
      const previous = result[result.length - 1];
      if (typeof previous === "number" && page - previous > 1) {
        result.push("ellipsis");
      }
      result.push(page);
    }

    const lastValue = result[result.length - 1];
    if (typeof lastValue === "number" && totalPages - lastValue > 1) {
      result.push("ellipsis");
    }
    result.push(totalPages);

    return result;
  })();

  const clampedCurrentPage = Math.min(Math.max(currentPage, 1), Math.max(totalPages, 1));
  const startItem = itemCount === 0 ? 0 : (clampedCurrentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(clampedCurrentPage * itemsPerPage, itemCount);

  const handlePageClick = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
  };

  return (
    <div className="flex flex-row gap-4 items-end justify-between w-full">
      {/* Pagination limits */}
      <div className="flex flex-col gap-1.5 items-start">
        <Label id="items-per-page-label" className="text-nowrap">Items Per Page</Label>
        <Select value={itemsPerPage.toString()} onValueChange={(value) => onItemsPerPageChange(Number(value))}>
          <SelectTrigger aria-labelledby="items-per-page-label" className="w-full sm:w-20">
            <SelectValue/>
          </SelectTrigger>
          <SelectContent>
            {paginationLimits.map((limit) => (
              <SelectItem key={limit} value={limit.toString()}>
                {limit}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Pagination controls */}
      <div className="flex flex-col gap-2 items-end w-full sm:w-auto mt-2 sm:mt-0">
        {/* Showing current items out of total items */}
        <Label className="text-center sm:text-right text-muted-foreground font-normal">Showing {startItem}-{endItem} of {itemCount} total items</Label>
        <Pagination className="mx-0 justify-end">
          <PaginationContent className="justify-center sm:justify-end flex-wrap gap-1">
            <PaginationItem>
              <PaginationPrevious
                href="#"
                hideText
                className={clampedCurrentPage === 1 ? "pointer-events-none opacity-50" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  handlePageClick(clampedCurrentPage - 1);
                }}
              />
            </PaginationItem>

            {pagesToRender.map((page, index) => {
              if (page === "ellipsis") {
                return (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }

              return (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    isActive={page === clampedCurrentPage}
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageClick(page);
                    }}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            <PaginationItem>
              <PaginationNext
                href="#"
                hideText
                className={clampedCurrentPage === totalPages ? "pointer-events-none opacity-50" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  handlePageClick(clampedCurrentPage + 1);
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}