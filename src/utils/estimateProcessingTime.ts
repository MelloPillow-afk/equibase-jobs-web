/**
 * Estimate processing time based on file size
 * Assumes roughly 2 seconds per MB plus 5 seconds base overhead
 * @param fileSizeInBytes - Size of the file in bytes
 * @returns Estimated time string (e.g., "5-10 seconds")
 */
export function estimateProcessingTime(fileSizeInBytes: number): string {
    const sizeInMB = fileSizeInBytes / (1024 * 1024)
    const baseTime = 5
    const timePerMB = 2

    const estimatedSeconds = Math.ceil(baseTime + (sizeInMB * timePerMB))

    // Create a range for better UX
    const minTime = Math.max(5, Math.floor(estimatedSeconds * 0.8))
    const maxTime = Math.ceil(estimatedSeconds * 1.2)

    if (maxTime < 60) {
        return `${minTime}-${maxTime} seconds`
    }

    const minMinutes = Math.floor(minTime / 60)
    const maxMinutes = Math.ceil(maxTime / 60)

    if (minMinutes === maxMinutes) {
        return `~${minMinutes} minute${minMinutes > 1 ? 's' : ''}`
    }

    return `${minMinutes}-${maxMinutes} minutes`
}
