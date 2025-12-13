import { useState, useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useJobs, useJobSubscription } from "@/features/jobs"
import { JobsTable } from "./JobsTable"
import { Pagination } from "./Pagination"
import { CreateJobModal } from "./CreateJobModal"
import { useServerStore } from "@/features/server-status"

export function JobsPage() {
    const [page, setPage] = useState(1)
    const limit = 10

    const { data, isLoading } = useJobs(page, limit)

    // Subscribe to updates for processing jobs
    useJobSubscription(data?.data || [])

    const { status } = useServerStore()
    const queryClient = useQueryClient()

    // Auto-refresh jobs when server comes online
    useEffect(() => {
        if (status === 'online') {
            queryClient.invalidateQueries({ queryKey: ['jobs'] })
        }
    }, [status, queryClient])

    const handlePageChange = (newPage: number) => {
        setPage(newPage)
    }

    // Non-blocking error handling is managed via Global Toasts and empty states

    return (
        <div className="container mx-auto py-10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Dashboard</h1>
                    <p className="text-muted-foreground mt-2 max-w-2xl text-lg">
                        Manage your PDF processing jobs.
                    </p>
                </div>
                <div className="flex-shrink-0">
                    <CreateJobModal>
                        <Button size="lg" className="text-md h-12 px-6 shadow-md dark:shadow-none">
                            <Plus className="mr-2 h-5 w-5" />
                            New Job
                        </Button>
                    </CreateJobModal>
                </div>
            </div>

            <JobsTable
                jobs={data?.data || []}
                isLoading={isLoading}
            />

            {!isLoading && data && (
                <Pagination
                    page={page}
                    hasNextPage={data.has_next_page}
                    onPageChange={handlePageChange}
                    isLoading={isLoading}
                />
            )}
        </div>
    )
}
