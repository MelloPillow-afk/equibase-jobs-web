import { useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow } from "date-fns"
import { Trash } from "lucide-react"
import type { Job } from "@/features/jobs"
import { useDeleteJob } from "@/features/jobs"
import { StatusBadge } from "./StatusBadge"
import { DownloadButton } from "./DownloadButton"

interface JobsTableProps {
    jobs: Job[]
    isLoading: boolean
}

export function JobsTable({ jobs, isLoading }: JobsTableProps) {
    const [jobToDelete, setJobToDelete] = useState<Job | null>(null)
    const { mutate: deleteJob } = useDeleteJob()

    const handleDelete = () => {
        if (jobToDelete) {
            deleteJob(jobToDelete.id)
            setJobToDelete(null)
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="md:hidden space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="rounded-xl border p-6 space-y-4">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ))}
                </div>
                <div className="hidden md:block rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i} className="h-16">
                                    <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-[100px] ml-auto" /></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        )
    }

    if (jobs.length === 0) {
        return (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
                <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                    <h3 className="mt-4 text-lg font-semibold">No jobs found</h3>
                    <p className="mb-4 mt-2 text-sm text-muted-foreground">
                        You haven't uploaded any PDFs yet. Upload a PDF to start processing.
                    </p>
                </div>
            </div>
        )
    }

    const sortedJobs = [...jobs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return (
        <>
            {/* Mobile/Tablet Card View */}
            <div className="md:hidden space-y-4">
                {sortedJobs.map((job) => (
                    <div key={job.id} className="rounded-xl border bg-card text-card-foreground shadow-sm p-5 space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h3 className="font-semibold text-lg leading-none tracking-tight">{job.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                                </p>
                            </div>
                            <StatusBadge status={job.status} />
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <DownloadButton
                                status={job.status}
                                downloadUrl={job.file_download_url}
                                fileName={`${job.title}.csv`}
                                className="flex-1 h-12 text-base"
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-12 w-12 text-destructive border-input hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                                onClick={() => setJobToDelete(job)}
                            >
                                <Trash className="h-5 w-5" />
                                <span className="sr-only">Delete</span>
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow className="h-12">
                            <TableHead className="w-[40%] text-base">Title</TableHead>
                            <TableHead className="text-base">Status</TableHead>
                            <TableHead className="text-base">Created</TableHead>
                            <TableHead className="text-right text-base">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedJobs.map((job) => (
                            <TableRow key={job.id} className="h-20 hover:bg-muted/50">
                                <TableCell className="font-medium text-base">{job.title}</TableCell>
                                <TableCell>
                                    <StatusBadge status={job.status} />
                                </TableCell>
                                <TableCell className="text-muted-foreground text-base">
                                    {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-3">
                                        <DownloadButton
                                            status={job.status}
                                            downloadUrl={job.file_download_url}
                                            fileName={`${job.title}.csv`}
                                            className="h-10 w-10"
                                        />
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-10 w-10 text-destructive hover:bg-destructive/10 hover:text-destructive border-transparent hover:border-destructive/30"
                                            onClick={() => setJobToDelete(job)}
                                        >
                                            <Trash className="h-5 w-5" />
                                            <span className="sr-only">Delete</span>
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={!!jobToDelete} onOpenChange={(open) => !open && setJobToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Job</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <span className="font-medium text-foreground">"{jobToDelete?.title}"</span>?
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="h-11">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 h-11"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
