import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBadge } from "@/components/StatusBadge"
import { DownloadButton } from "@/components/DownloadButton"
import type { Job } from "@/types/job"
import { formatDistanceToNow, format } from "date-fns"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface JobsTableProps {
    jobs: Job[]
    isLoading: boolean
}

export function JobsTable({ jobs, isLoading }: JobsTableProps) {
    if (isLoading) {
        return (
            <div className="rounded-md border">
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
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-[100px] ml-auto" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
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

    return (
        <div className="rounded-md border">
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
                    {jobs.map((job) => (
                        <TableRow key={job.id}>
                            <TableCell className="font-medium">{job.title}</TableCell>
                            <TableCell>
                                <StatusBadge status={job.status} />
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span className="cursor-help">
                                            {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {format(new Date(job.created_at), "PPpp")}
                                    </TooltipContent>
                                </Tooltip>
                            </TableCell>
                            <TableCell className="text-right">
                                <DownloadButton
                                    status={job.status}
                                    downloadUrl={job.file_download_url}
                                    fileName={`${job.title}.csv`}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
