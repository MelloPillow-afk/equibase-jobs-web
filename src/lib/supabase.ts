import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Upload a PDF file to Supabase Storage
 */
export async function uploadPDF(file: File): Promise<{ path: string | null; error: Error | null }> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error } = await supabase.storage
        .from('pdfs')
        .upload(filePath, file);

    if (error) {
        console.error('Error uploading PDF:', error);
        return { path: null, error: error as Error };
    }

    return { path: filePath, error: null };
}

/**
 * Get the public download URL for a CSV file
 */
export function getCSVDownloadUrl(path: string): string {
    const { data } = supabase.storage
        .from('csvs')
        .getPublicUrl(path);

    return data.publicUrl;
}

/**
 * Get the public URL for a PDF file
 */
export function getPDFUrl(path: string): string {
    const { data } = supabase.storage
        .from('pdfs')
        .getPublicUrl(path);

    return data.publicUrl;
}
