/**
 * Storage Utility for PPDB Portal
 * Supports Cloudflare R2 (S3-compatible) storage
 *
 * Setup:
 * 1. Create R2 bucket at dash.cloudflare.com
 * 2. Create R2 API Token
 * 3. Add credentials to .env.local
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { writeFile, mkdir, unlink, readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Configuration
const UPLOAD_DIR = 'uploads';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Helper to get R2 config at runtime (not at module load)
function getR2Config() {
  return {
    accountId: process.env.R2_ACCOUNT_ID,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucketName: process.env.R2_BUCKET_NAME || 'ppdb-documents',
    publicUrl: process.env.R2_PUBLIC_URL,
  };
}

// Check if R2 is configured
const isR2Configured = () => {
  const config = getR2Config();
  return !!(config.accountId && config.accessKeyId && config.secretAccessKey);
};

// Initialize S3 client for R2
const getS3Client = (): S3Client => {
  const config = getR2Config();
  if (!config.accountId || !config.accessKeyId || !config.secretAccessKey) {
    throw new Error('R2 credentials not configured. Please set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY in .env.local');
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
};

export interface UploadResult {
  success: boolean;
  filename?: string;
  filepath?: string;
  url?: string;
  error?: string;
  size?: number;
}

/**
 * Generate a unique filename
 */
export function generateFilename(
  registrationId: number,
  documentType: string,
  originalExt: string = 'pdf'
): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const sanitizedType = documentType.replace(/[^a-zA-Z0-9]/g, '');
  return `${registrationId}/${sanitizedType}-${timestamp}-${randomStr}.${originalExt}`;
}

/**
 * Get file extension from MIME type
 */
export function getExtensionFromMimeType(mimeType: string): string {
  const mimeMap: Record<string, string> = {
    'application/pdf': 'pdf',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/jpg': 'jpg',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  };
  return mimeMap[mimeType] || 'bin';
}

/**
 * Validate file size and type
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File terlalu besar. Maksimal ${MAX_FILE_SIZE / 1024 / 1024}MB`
    };
  }

  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg',
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Tipe file tidak didukung. Gunakan PDF, JPG, atau PNG'
    };
  }

  return { valid: true };
}

/**
 * Upload file to Cloudflare R2
 */
export async function uploadToR2(
  file: File,
  registrationId: number,
  documentType: string
): Promise<UploadResult> {
  try {
    const config = getR2Config();
    const client = getS3Client();
    const ext = getExtensionFromMimeType(file.type);
    const filename = generateFilename(registrationId, documentType, ext);
    const key = filename;

    const buffer = Buffer.from(await file.arrayBuffer());

    const command = new PutObjectCommand({
      Bucket: config.bucketName,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      Metadata: {
        'registration-id': registrationId.toString(),
        'document-type': documentType,
      },
    });

    await client.send(command);

    // Generate public URL
    let url: string;
    if (config.publicUrl) {
      url = `${config.publicUrl}/${key}`;
    } else {
      // Use R2.dev public URL format (no custom domain)
      url = `https://${config.bucketName}.${config.accountId}.r2.dev/${key}`;
    }

    return {
      success: true,
      filename: key,
      filepath: key,
      url,
      size: file.size,
    };

  } catch (error: any) {
    console.error('Error uploading to R2:', error);
    return {
      success: false,
      error: error.message || 'Gagal upload ke cloud storage',
    };
  }
}

/**
 * Delete file from Cloudflare R2
 */
export async function deleteFromR2(filepath: string): Promise<boolean> {
  try {
    const config = getR2Config();
    const client = getS3Client();
    const key = filepath.replace(/.*\//, ''); // Extract filename from URL

    const command = new DeleteObjectCommand({
      Bucket: config.bucketName,
      Key: key,
    });

    await client.send(command);
    return true;

  } catch (error) {
    console.error('Error deleting from R2:', error);
    return false;
  }
}

/**
 * Generate presigned URL for private files
 */
export async function getPresignedUrl(filepath: string, expiresIn = 3600): Promise<string | null> {
  try {
    const config = getR2Config();
    const client = getS3Client();
    const key = filepath.replace(/.*\//, '');

    const command = new GetObjectCommand({
      Bucket: config.bucketName,
      Key: key,
    });

    return await getSignedUrl(client, command, { expiresIn });

  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return null;
  }
}

// ============ LOCAL STORAGE FALLBACK ============

/**
 * Get the uploads directory path (local fallback)
 */
function getUploadsDir(): string {
  return join(process.cwd(), 'public', UPLOAD_DIR);
}

/**
 * Ensure uploads directory exists (local fallback)
 */
async function ensureUploadsDir(): Promise<void> {
  const dir = getUploadsDir();
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
}

/**
 * Save file to local storage (fallback when R2 not configured)
 */
export async function saveFileLocal(
  file: File,
  registrationId: number,
  documentType: string
): Promise<UploadResult> {
  try {
    const validation = validateFile(file);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    await ensureUploadsDir();

    const ext = getExtensionFromMimeType(file.type);
    const filename = generateFilename(registrationId, documentType, ext);
    const filepath = join(getUploadsDir(), filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);

    return {
      success: true,
      filename,
      filepath,
      url: `/${UPLOAD_DIR}/${filename}`,
      size: file.size,
    };

  } catch (error: any) {
    console.error('Error saving file locally:', error);
    return {
      success: false,
      error: error.message || 'Gagal menyimpan file',
    };
  }
}

/**
 * Delete file from local storage (fallback)
 */
export async function deleteFileLocal(filepath: string): Promise<boolean> {
  try {
    const fullPath = join(process.cwd(), 'public', filepath);
    await unlink(fullPath);
    return true;
  } catch (error) {
    console.error('Error deleting file locally:', error);
    return false;
  }
}

// ============ UNIFIED API ============

/**
 * Save file - auto-detect R2 or local
 */
export async function saveFile(
  file: File,
  registrationId: number,
  documentType: string
): Promise<UploadResult> {
  if (isR2Configured()) {
    return uploadToR2(file, registrationId, documentType);
  } else {
    console.warn('⚠️ R2 not configured, using local storage');
    return saveFileLocal(file, registrationId, documentType);
  }
}

/**
 * Delete file - auto-detect R2 or local
 */
export async function deleteFile(filepath: string): Promise<boolean> {
  if (isR2Configured()) {
    return deleteFromR2(filepath);
  } else {
    return deleteFileLocal(filepath);
  }
}

/**
 * Get file from local storage (returns base64)
 */
export async function getFile(filepath: string): Promise<Buffer | null> {
  try {
    const fullPath = join(process.cwd(), 'public', filepath);
    return await readFile(fullPath);
  } catch (error) {
    console.error('Error reading file:', error);
    return null;
  }
}

/**
 * Get storage info
 */
export function getStorageInfo() {
  const config = getR2Config();
  return {
    provider: isR2Configured() ? 'Cloudflare R2' : 'Local (fallback)',
    bucket: config.bucketName,
    configured: isR2Configured(),
    publicUrl: isR2Configured()
      ? (config.publicUrl || `https://${config.bucketName}.${config.accountId}.r2.dev`)
      : null,
  };
}
