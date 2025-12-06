import { useState } from "react"
import { useJobs } from "@/hooks/useJobs"
import { useJobSubscription } from "@/hooks/useJobSubscription"
import { JobsTable } from "@/components/JobsTable"
import { Pagination } from "@/components/Pagination"
import { ServerStatusBadge } from "@/components/ServerStatusBadge"
import { CreateJobModal } from "@/components/CreateJobModal"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function JobsPage() {
    const [page, setPage] = useState(1)
    const limit = 10

    const { data, isLoading, isError, error } = useJobs(page, limit)

    // Subscribe to updates for processing jobs
    useJobSubscription(data?.data || [])

    const handlePageChange = (newPage: number) => {
        setPage(newPage)
    }

    if (isError) {
        return (
            <div className="container mx-auto py-10">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error loading jobs</AlertTitle>
                    <AlertDescription className="flex flex-col gap-4">
                        <p>{(error as Error).message}</p>
                        <Button
                            variant="outline"
                            className="w-fit bg-background text-foreground hover:bg-accent"
                            onClick={() => window.location.reload()}
                        >
                            Retry
                        </Button>
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-10 space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <ServerStatusBadge className="mb-5" />
                    <h1 className="text-3xl font-bold tracking-tight">PDF Processing Jobs</h1>
                    <p className="text-muted-foreground mt-2">
                        Upload PDFs to extract data and convert them to CSV format.
                    </p>
                </div>
                <div className="self-end">
                    <CreateJobModal>
                        <Button size="lg">
                            <Plus className="h-4 w-4" />
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
