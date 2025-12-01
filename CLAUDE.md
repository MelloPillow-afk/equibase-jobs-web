# Equibase Upload - Technical Specification

## Overview

React-based single-page application for uploading PDFs and managing CSV conversion jobs. Optimized for solo user.

---

## Tech Stack

### Core

- **Framework**: React (or Preact)
- **Hosting**: Vercel
- **Routing**: None needed (single page app)

### Styling & UI

- **CSS Framework**: Tailwind CSS
- **Component Library**: Shadcn/ui

**Components Needed:**
- `Table` - Job list
- `Dialog` - Create job modal
- `Button` - Actions
- `Badge` - Status indicators (processing/completed/failed)
- `Alert` - Error messages
- `Progress` - Upload progress (optional)
- `Input` - File input wrapper

### Data & State Management

- **API Client**: TanStack Query (React Query)
- **Storage Client**: Supabase JS Client
- **Date Formatting**: date-fns or dayjs
- **File Upload**: Native `<input type="file">` or react-dropzone (optional)
- **State**: React useState/useEffect (no Zustand needed for solo use)

---

## Component Architecture

```
App
├── JobsPage (main view)
│   ├── CreateJobButton → opens modal
│   ├── JobsTable
│   │   ├── JobRow (x20)
│   │   │   ├── Job title
│   │   │   ├── Created time (formatted with date-fns)
│   │   │   ├── StatusBadge (processing/completed/failed)
│   │   │   └── DownloadButton (if completed)
│   │   └── Pagination
│   │       ├── Previous button
│   │       └── Next button
│   └── CreateJobModal
│       ├── FileUpload
│       ├── UploadProgress/Status
│       ├── EstimatedTime display
│       └── CreateButton
```

---

## API Endpoints

### POST /jobs
```
Body: { title: string, pdf_url: string }
Returns: Job
```
Creates job, starts background processing

Response Example:

```json
{
    "id": 1,
    "title": "Process Q4 Financial Report",
    "status": "completed",
    "pdf_url": "https://supabase.co/storage/uploads/financial-report-q4.pdf",
    "download_url": "https://supabase.co/storage/outputs/financial-report-q4.csv",
    "created_at": "2025-01-15T10:30:00Z",
    "completed_at": "2025-01-15T10:40:00Z",
}
```

### GET /jobs
```
Query: ?page=1&limit=20
Returns: { data: Job[], page: int, has_next_page: bool }
```
Dashboard list

Response Example:

```json
{
    "data": [
        {
            "id": 1,
            "title": "Process Q4 Financial Report",
            "status": "completed",
            "pdf_url": "https://supabase.co/storage/uploads/report.pdf",
            "download_url": "https://supabase.co/storage/outputs/report.csv",
            "created_at": "2025-01-15T10:30:00Z",
            "completed_at": "2025-01-15T10:40:00Z",
        }
    ],
    "page": 1,
    "limit": 20,
    "next_page": false,
}
```

### GET /jobs/{job_id}
```
Returns: Job
```
Used for both: initial fetch AND polling

Response Example:

```json
{
    "id": 1,
    "title": "Process Q4 Financial Report",
    "status": "completed",
    "pdf_url": "https://supabase.co/storage/uploads/financial-report-q4.pdf",
    "download_url": "https://supabase.co/storage/outputs/financial-report-q4.csv",
    "created_at": "2025-01-15T10:30:00Z",
    "completed_at": "2025-01-15T10:40:00Z",
}
```

### DELETE /jobs/{job_id}
```
Deletes job record + files from storage
```

Return None

---

## Custom Hooks

### useJobs

Fetches paginated job list from API

```javascript
const { data, isLoading, error } = useJobs(page, limit);
// Returns: { data: Job[], page: number, has_next_page: boolean }
```

### useJobPolling

Polls jobs with status="processing" every 3 seconds

```javascript
useEffect(() => {
  const processingJobs = jobs.filter(j => j.status === 'processing');
  
  if (processingJobs.length > 0) {
    const interval = setInterval(() => {
      processingJobs.forEach(job => {
        queryClient.invalidateQueries(['job', job.id]);
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }
}, [jobs]);
```

### useCreateJob

Handles PDF upload and job creation

```javascript
const { mutate: createJob, isLoading } = useCreateJob();
```

---

## Features & User Flow

### Job List Page

**Display:**
- Table of jobs (20 per page)
- Each row shows:
  - Job title
  - Created time (formatted: "2 hours ago")
  - Status badge (processing/completed/failed with colors)
  - Download button (only if status="completed")
- Pagination controls (Previous/Next)

**Behavior:**
- Auto-polls jobs with status="processing" every 3 seconds
- Updates UI when job completes
- Shows error message if job fails

### Create Job Modal

**Steps:**
1. User clicks "Create Job" button
2. Modal opens with file upload area
3. User selects PDF file (max 4MB)
4. Display estimated processing time (based on file size algorithm)
5. Upload PDF to Supabase Storage
6. Show upload progress indicator
7. On upload success → Call POST /jobs API
8. Close modal
9. Refetch jobs list
10. Auto-start polling new job

**Error Handling:**
- Show error if upload to Supabase fails
- Provide retry button
- Validate file type (PDF only)
- Validate file size (max 4MB)

---

## API Integration

### GET /jobs?page={page}&limit={limit}

```javascript
// Fetch paginated job list
const response = await fetch(`${API_URL}/jobs?page=${page}&limit=20`);
const { data, page, has_next_page } = await response.json();
```

### POST /jobs

```javascript
// Create new job after PDF upload
const response = await fetch(`${API_URL}/jobs`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    pdf_path: uploadedPdfPath,
    title: fileName
  })
});
const { job_id } = await response.json();
```

### GET /jobs/{job_id}

```javascript
// Poll individual job status
const response = await fetch(`${API_URL}/jobs/${jobId}`);
const job = await response.json();
// Returns: { id, title, status, download_url, error_message, ... }
```

---

## Supabase Storage Integration

### Upload PDF

```javascript
const { data, error } = await supabase.storage
  .from('pdfs')
  .upload(`uploads/${uuid()}.pdf`, file);

// Returns: { path: "uploads/abc-123.pdf" }
```

### Download CSV

```javascript
// Get public URL for completed CSV
const { data } = supabase.storage
  .from('csvs')
  .getPublicUrl(job.csv_path);

// User clicks download button → window.location.href = data.publicUrl
```

---

## State Management Pattern

### Job List State

```javascript
const [currentPage, setCurrentPage] = useState(1);
const { data: jobsData } = useJobs(currentPage, 20);
```

### Polling State

```javascript
// Track which jobs are being polled
const processingJobs = useMemo(() => 
  jobs.filter(j => j.status === 'processing'),
  [jobs]
);

// Auto-poll processing jobs
useJobPolling(processingJobs);
```

### Modal State

```javascript
const [isModalOpen, setIsModalOpen] = useState(false);
const [uploadProgress, setUploadProgress] = useState(0);
const [estimatedTime, setEstimatedTime] = useState(null);
```

---

## TanStack Query Configuration

### Query Keys

```javascript
['jobs', page, limit]  // Job list
['job', jobId]         // Individual job
```

### Cache Strategy

```javascript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000,        // Consider fresh for 1s
      refetchInterval: false, // No auto-refetch (we poll manually)
      retry: 1,               // Retry failed queries once
    },
  },
});
```

### Invalidation Pattern

```javascript
// After creating job
queryClient.invalidateQueries(['jobs']);

// When polling
queryClient.invalidateQueries(['job', jobId]);
```

---

## Estimated Time Calculation

### Client-Side Algorithm

```javascript
function estimateProcessingTime(fileSizeInMB) {
  // Your algorithm here - example:
  const baseTime = 60; // 1 minute base
  const perMB = 120;   // 2 minutes per MB
  
  const estimated = baseTime + (fileSizeInMB * perMB);
  return Math.ceil(estimated); // Return in seconds
}

// Display formatted
function formatEstimatedTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  return `~${minutes} minute${minutes !== 1 ? 's' : ''}`;
}
```

---

## Error Handling

### Upload Errors

```javascript
try {
  const { data, error } = await supabase.storage
    .from('pdfs')
    .upload(path, file);
    
  if (error) throw error;
  
} catch (error) {
  // Show error alert in modal
  setError('Failed to upload PDF. Please try again.');
  // Provide retry button
}
```

### API Errors

```javascript
// TanStack Query handles this automatically
const { error } = useJobs(page);

if (error) {
  return <Alert variant="destructive">Failed to load jobs</Alert>;
}
```

### Polling Errors

```javascript
// If job fails, display error message from API
{job.status === 'failed' && (
  <Alert variant="destructive">
    <AlertTitle>Processing Failed</AlertTitle>
    <AlertDescription>{job.error_message}</AlertDescription>
  </Alert>
)}
```

---

## Environment Variables

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
VITE_API_URL=https://your-api.onrender.com
```

---

## UI/UX Patterns

### Status Badge Colors

- **Processing**: Blue/Cyan (`badge-primary`)
- **Completed**: Green (`badge-success`)
- **Failed**: Red (`badge-destructive`)

### Loading States

- **Job list loading**: Skeleton table rows
- **Upload in progress**: Progress bar in modal
- **Polling**: Animated spinner on status badge

### Empty States

- **No jobs yet**: "No jobs found. Create your first job to get started."
- **No results for page**: "End of results"

### Accessibility

- **Modal**: Trap focus, ESC to close, click outside to close
- **Buttons**: Proper ARIA labels
- **Status**: Screen reader announcements for status changes
- **File input**: Clear label and error messages

---

## Deployment (Vercel)

### Build Configuration

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```
