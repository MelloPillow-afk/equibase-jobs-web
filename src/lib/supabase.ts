import { createClient } from '@supabase/supabase-js'
import config from '@/config/app.config'

export const supabase = createClient(config.supabase.url, config.supabase.anonKey)

const storageBucket = 'horse-racing-files'

/**
 * Upload a PDF file to Supabase Storage
 */
export async function uploadPDF(file: File): Promise<{ path: string | null; error: Error | null }> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error } = await supabase.storage
        .from(storageBucket)
        .upload(filePath, file);

    if (error) {
        console.error('Error uploading PDF:', error);
        return { path: null, error: error as Error };
    }

    return { path: filePath, error: null };
}

/**
 * Get the public URL for a PDF file
 */
export async function getPDFUrl(path: string): Promise<string | null> {
    const { data } = await supabase.storage
        .from(storageBucket)
        .createSignedUrl(path, 3600);

    if (!data) {
        console.error('Failed to generate signed URL');
        throw new Error('Failed to generate signed URL');
    }

    return data.signedUrl;
}
