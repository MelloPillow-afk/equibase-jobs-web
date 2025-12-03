import { useState } from "react"
import { useJobs } from "@/hooks/useJobs"
import { useJobPolling } from "@/hooks/useJobPolling"
import { JobsTable } from "@/components/JobsTable"
import { Pagination } from "@/components/Pagination"
import { CreateJobModal } from "@/components/CreateJobModal"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function JobsPage() {
    const [page, setPage] = useState(1)
    const limit = 10

    const { data, isLoading, isError, error } = useJobs(page, limit)

    // Poll for updates on any processing jobs
    useJobPolling(data?.data || [])

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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">PDF Processing Jobs</h1>
                    <p className="text-muted-foreground mt-2">
                        Upload PDFs to extract data and convert them to CSV format.
                    </p>
                </div>
                <CreateJobModal>
                    <Button size="lg">
                        <Plus className="mr-2 h-4 w-4" />
                        New Job
                    </Button>
                </CreateJobModal>
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
