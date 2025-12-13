import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
    page: number
    hasNextPage: boolean
    onPageChange: (page: number) => void
    isLoading?: boolean
}

export function Pagination({
    page,
    hasNextPage,
    onPageChange,
    isLoading
}: PaginationProps) {
    return (
        <div className="flex items-center justify-end space-x-2 py-4">
            <div className="text-sm font-medium pr-4">
                Page {page}
            </div>
            <Button
                variant="outline"
                size="lg"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1 || isLoading}
            >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Prev
            </Button>
            <Button
                variant="outline"
                size="lg"
                onClick={() => onPageChange(page + 1)}
                disabled={!hasNextPage || isLoading}
            >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
            </Button>

        </div>
    )
}
