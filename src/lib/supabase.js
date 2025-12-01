import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Upload a PDF file to Supabase Storage
 * @param {File} file - The file object to upload
 * @returns {Promise<{path: string, error: Error|null}>} - The uploaded file path or error
 */
export async function uploadPDF(file) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { data, error } = await supabase.storage
        .from('pdfs')
        .upload(filePath, file);

    if (error) {
        console.error('Error uploading PDF:', error);
        return { path: null, error };
    }

    return { path: filePath, error: null };
}

/**
 * Get the public download URL for a CSV file
 * @param {string} path - The storage path of the CSV file
 * @returns {string} - The public URL
 */
export function getCSVDownloadUrl(path) {
    const { data } = supabase.storage
        .from('csvs')
        .getPublicUrl(path);

    return data.publicUrl;
}
