import { useState, useRef } from "react"
import { useCreateJob } from "@/hooks/useCreateJob"
import { uploadPDF, getPDFUrl } from "@/lib/supabase"
import { formatFileSize } from "@/lib/utils"
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Upload, AlertCircle, FileText, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface CreateJobModalProps {
    children?: React.ReactNode
}

export function CreateJobModal({ children }: CreateJobModalProps) {
    const [open, setOpen] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [uploadError, setUploadError] = useState<string | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const { mutate: createJob, isPending: isCreating, error: createError } = useCreateJob()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        handleFileSelection(selectedFile)
    }

    const handleFileSelection = (selectedFile: File | undefined) => {
        setUploadError(null)

        if (selectedFile) {
            if (selectedFile.type !== "application/pdf") {
                setUploadError("Please select a PDF file.")
                setFile(null)
                return
            }
            if (selectedFile.size > 10 * 1024 * 1024) { // 10MB
                setUploadError("File size must be less than 10MB.")
                setFile(null)
                return
            }
            setFile(selectedFile)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (uploading || isCreating) return

        const droppedFile = e.dataTransfer.files?.[0]
        if (droppedFile) {
            handleFileSelection(droppedFile)
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
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
            const pdfUrl = await getPDFUrl(path)

            if (!pdfUrl) {
                throw new Error("Failed to generate signed URL")
            }

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

    const clearFile = (e: React.MouseEvent) => {
        e.stopPropagation()
        setFile(null)
        setUploadError(null)
        if (inputRef.current) {
            inputRef.current.value = ""
        }
    }

    const isLoading = uploading || isCreating
    const error = uploadError || (createError as Error)?.message

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!isLoading) {
                setOpen(val)
                if (!val) {
                    setUploadError(null)
                    setFile(null)
                }
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
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Upload PDF</DialogTitle>
                    <DialogDescription>
                        Select a PDF file to process.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-2">
                    {/* Error Alert */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Hidden Input */}
                    <Input
                        ref={inputRef}
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={isLoading}
                    />

                    {/* Upload Zone */}
                    {!file ? (
                        <div
                            onClick={() => inputRef.current?.click()}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            className={cn(
                                "border-2 border-dashed rounded-xl p-10 cursor-pointer transition-colors",
                                "hover:bg-muted/50 hover:border-muted-foreground/50",
                                "flex flex-col items-center justify-center text-center gap-4",
                                isLoading ? "opacity-50 pointer-events-none" : ""
                            )}
                        >
                            <div className="p-4 rounded-full bg-primary/10 text-primary">
                                <Upload className="h-8 w-8" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-semibold text-lg tracking-tight">Tap to select PDF</h3>
                                <p className="text-sm text-muted-foreground">
                                    or drag and drop here
                                </p>
                            </div>
                            <p className="text-xs text-muted-foreground/75">
                                PDF up to 10MB
                            </p>
                        </div>
                    ) : (
                        <div className="relative border rounded-xl p-4 flex items-start gap-4 bg-muted/30">
                            <div className="p-3 rounded-lg bg-background border shadow-sm">
                                <FileText className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0 grid gap-1">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium truncate pr-2">
                                        {file.name}
                                    </p>
                                    {!isLoading && (
                                        <button
                                            type="button"
                                            onClick={clearFile}
                                            className="text-muted-foreground hover:text-foreground transition-colors p-1"
                                        >
                                            <X className="h-4 w-4" />
                                            <span className="sr-only">Remove file</span>
                                        </button>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>{formatFileSize(file.size)}</span>
                                    <span>•</span>
                                    <span>{estimateProcessingTime(file.size)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            type="submit"
                            className="w-full sm:w-auto"
                            disabled={!file || isLoading}
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isLoading ? "Processing..." : "Upload & Process"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
