import { useState } from "react"
import { useCreateJob } from "@/hooks/useCreateJob"
import { uploadPDF, getPDFUrl } from "@/lib/supabase"
import { estimateProcessingTime } from "@/utils/estimateProcessingTime"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Upload, AlertCircle } from "lucide-react"

interface CreateJobModalProps {
    children?: React.ReactNode
}

export function CreateJobModal({ children }: CreateJobModalProps) {
    const [open, setOpen] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [uploadError, setUploadError] = useState<string | null>(null)

    const { mutate: createJob, isPending: isCreating, error: createError } = useCreateJob()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        setUploadError(null)

        if (selectedFile) {
            if (selectedFile.type !== "application/pdf") {
                setUploadError("Please select a PDF file.")
                setFile(null)
                return
            }
            if (selectedFile.size > 4 * 1024 * 1024) { // 4MB
                setUploadError("File size must be less than 4MB.")
                setFile(null)
                return
            }
            setFile(selectedFile)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file) return

        setUploading(true)
        setUploadError(null)

        try {
            // 1. Upload PDF to Supabase
            const { path, error } = await uploadPDF(file)

            if (error || !path) {
                throw new Error(error?.message || "Failed to upload file")
            }

            // 2. Get public URL
            const pdfUrl = getPDFUrl(path)

            // 3. Create Job
            createJob(
                {
                    title: file.name.replace(".pdf", ""),
                    pdf_url: pdfUrl,
                },
                {
                    onSuccess: () => {
                        setOpen(false)
                        setFile(null)
                        setUploading(false)
                    },
                    onError: () => {
                        setUploading(false)
                    }
                }
            )
        } catch (err) {
            console.error(err)
            setUploadError(err instanceof Error ? err.message : "An error occurred during upload")
            setUploading(false)
        }
    }

    const isLoading = uploading || isCreating
    const error = uploadError || (createError as Error)?.message

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val)
            if (!val) {
                setUploadError(null)
                setFile(null)
            }
        }}>
            <DialogTrigger asChild>
                {children || (
                    <Button>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload PDF
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Upload PDF</DialogTitle>
                    <DialogDescription>
                        Upload a PDF file to start processing. Max file size is 4MB.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="pdf-upload">PDF File</Label>
                        <Input
                            id="pdf-upload"
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            disabled={isLoading}
                        />
                    </div>

                    {file && !error && (
                        <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">
                                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Estimated time: {estimateProcessingTime(file.size)}
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="submit" disabled={!file || isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isLoading ? "Processing..." : "Upload & Process"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
