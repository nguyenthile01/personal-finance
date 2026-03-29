import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { useState } from "react";


export function PaginationInteractive(
    {
        page,
        pageSize,
        total,
        onPageChange,
        onPageSizeChange
    }: {
        page?: number;
        pageSize?: number;
        total?: number;
        onPageChange?: (page: number) => void;
        onPageSizeChange?: (size: number) => void;
    }) {
    const current = page ?? 1;
    const size = pageSize ?? 10;
    const tot = total ?? 0;
    const totalPages = Math.max(1, Math.ceil(tot / (size || 1)));
    const [expanded, setExpanded] = useState(false);

    const goto = (p: number) => {
        if (!onPageChange) return;
        if (p < 1) p = 1;
        if (p > totalPages) p = totalPages;
        onPageChange(p);
    };

    // build the list of page items depending on collapsed/expanded state
    const renderPages = () => {
        if (expanded || totalPages <= 5) {
            return [...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i}>
                    <PaginationLink
                        isActive={current === i + 1}
                        onClick={() => goto(i + 1)}
                    >
                        {i + 1}
                    </PaginationLink>
                </PaginationItem>
            ));
        }

        // collapsed view when totalPages > 5
        const pages: any[] = [];

        // always show first
        pages.push(
            <PaginationItem key={1}>
                <PaginationLink isActive={current === 1} onClick={() => goto(1)}>
                    1
                </PaginationLink>
            </PaginationItem>
        );

        // if current is near the start, show 2,3 then ...
        if (current <= 3) {
            for (let p = 2; p <= Math.min(3, totalPages - 1); p++) {
                pages.push(
                    <PaginationItem key={p}>
                        <PaginationLink isActive={current === p} onClick={() => goto(p)}>
                            {p}
                        </PaginationLink>
                    </PaginationItem>
                );
            }

            if (totalPages > 4) {
                pages.push(
                    <PaginationItem key="left-ellipsis">
                        <PaginationLink aria-label="show more pages" onClick={() => setExpanded(true)}>
                            ...
                        </PaginationLink>
                    </PaginationItem>
                );
            }
        } else if (current >= totalPages - 2) {
            // near the end: show ... then last-2,last-1
            if (totalPages > 4) {
                pages.push(
                    <PaginationItem key="right-ellipsis">
                        <PaginationLink aria-label="show more pages" onClick={() => setExpanded(true)}>
                            ...
                        </PaginationLink>
                    </PaginationItem>
                );
            }

            for (let p = Math.max(2, totalPages - 2); p <= totalPages - 1; p++) {
                pages.push(
                    <PaginationItem key={p}>
                        <PaginationLink isActive={current === p} onClick={() => goto(p)}>
                            {p}
                        </PaginationLink>
                    </PaginationItem>
                );
            }
        } else {
            // middle: show ... (left) p-1, p, p+1, ... (right)
            pages.push(
                <PaginationItem key="left-ellipsis">
                    <PaginationLink aria-label="show more pages" onClick={() => setExpanded(true)}>
                        ...
                    </PaginationLink>
                </PaginationItem>
            );

            for (let p = current - 1; p <= current + 1; p++) {
                pages.push(
                    <PaginationItem key={p}>
                        <PaginationLink isActive={current === p} onClick={() => goto(p)}>
                            {p}
                        </PaginationLink>
                    </PaginationItem>
                );
            }

            pages.push(
                <PaginationItem key="right-ellipsis">
                    <PaginationLink aria-label="show more pages" onClick={() => setExpanded(true)}>
                        ...
                    </PaginationLink>
                </PaginationItem>
            );
        }

        // always show last if more than 1
        if (totalPages > 1) {
            pages.push(
                <PaginationItem key={totalPages}>
                    <PaginationLink isActive={current === totalPages} onClick={() => goto(totalPages)}>
                        {totalPages}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        return pages;
    };

    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious onClick={() => current > 1 && goto(current - 1)} />
                </PaginationItem>

                {renderPages()}

                <PaginationItem>
                    <PaginationNext onClick={() => current < totalPages && goto(current + 1)} />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}