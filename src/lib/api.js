/**
 * Base API URL from environment variables
 */
const API_URL = import.meta.env.VITE_API_URL;

/**
 * Generic fetch wrapper with error handling
 * @param {string} endpoint - API endpoint (e.g., '/jobs')
 * @param {Object} [options={}] - Fetch options
 * @returns {Promise<any>} - JSON response
 * @throws {Error} - If response is not ok
 */
async function fetchClient(endpoint, options = {}) {
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `API Error: ${response.statusText}`);
        }

        // Handle 204 No Content
        if (response.status === 204) {
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('API Request Failed:', error);
        throw error;
    }
}

/**
 * @typedef {Object} Job
 * @property {string} id - Job ID
 * @property {string} title - Job title
 * @property {string} status - Job status (processing, completed, failed)
 * @property {string} pdf_url - URL of the uploaded PDF
 * @property {string} [download_url] - URL of the converted CSV (if completed)
 * @property {string} created_at - Creation timestamp
 * @property {string} [completed_at] - Completion timestamp
 * @property {string} [error_message] - Error message if failed
 */

/**
 * Fetch paginated jobs
 * @param {number} page - Page number (1-indexed)
 * @param {number} limit - Items per page
 * @returns {Promise<{data: Job[], page: number, has_next_page: boolean}>}
 */
export async function fetchJobs(page = 1, limit = 20) {
    return fetchClient(`/jobs?page=${page}&limit=${limit}`);
}

/**
 * Fetch a single job by ID
 * @param {string} jobId - Job ID
 * @returns {Promise<Job>}
 */
export async function fetchJobById(jobId) {
    return fetchClient(`/jobs/${jobId}`);
}

/**
 * Create a new job
 * @param {Object} payload - Job creation payload
 * @param {string} payload.title - Job title
 * @param {string} payload.pdf_url - URL of the uploaded PDF
 * @returns {Promise<Job>}
 */
export async function createJob(payload) {
    return fetchClient('/jobs', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

/**
 * Delete a job
 * @param {string} jobId - Job ID
 * @returns {Promise<void>}
 */
export async function deleteJob(jobId) {
    return fetchClient(`/jobs/${jobId}`, {
        method: 'DELETE',
    });
}
