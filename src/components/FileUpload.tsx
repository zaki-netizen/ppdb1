"use client";

import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  url?: string;
  error?: string;
}

interface FileUploadProps {
  registrationId: string;
  documentType: 'KK' | 'Akta' | 'Sertifikat' | 'Raport';
  onUploadComplete?: (file: UploadedFile) => void;
  onUploadError?: (error: string) => void;
  className?: string;
  maxSizeMB?: number;
  acceptedTypes?: string[];
}

const DEFAULT_MAX_SIZE_MB = 5;
const DEFAULT_ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

export function FileUpload({
  registrationId,
  documentType,
  onUploadComplete,
  onUploadError,
  className,
  maxSizeMB = DEFAULT_MAX_SIZE_MB,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File terlalu besar. Maksimal ${maxSizeMB}MB`;
    }
    if (!acceptedTypes.includes(file.type)) {
      return 'Tipe file tidak didukung. Gunakan PDF, JPG, atau PNG';
    }
    return null;
  };

  const uploadFile = async (file: File): Promise<UploadedFile> => {
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const fileObj: UploadedFile = {
      id: tempId,
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
      status: 'uploading',
    };

    setFiles((prev) => [...prev, fileObj]);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('registrationId', registrationId);
      formData.append('documentType', documentType);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === tempId && f.progress < 90
              ? { ...f, progress: f.progress + 10 }
              : f
          )
        );
      }, 200);

      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();

      setFiles((prev) =>
        prev.map((f) =>
          f.id === tempId
            ? {
                ...f,
                progress: 100,
                status: 'success',
                url: data.document.file_path,
              }
            : f
        )
      );

      onUploadComplete?.({
        ...fileObj,
        progress: 100,
        status: 'success',
        url: data.document.file_path,
      });

      return { ...fileObj, progress: 100, status: 'success', url: data.document.file_path };
    } catch (error: any) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === tempId
            ? {
                ...f,
                status: 'error',
                error: error.message || 'Upload gagal',
              }
            : f
        )
      );

      onUploadError?.(error.message || 'Upload gagal');
      throw error;
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    setIsUploading(true);

    for (const file of selectedFiles) {
      const error = validateFile(file);
      if (error) {
        onUploadError?.(error);
        continue;
      }
      await uploadFile(file);
    }

    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length === 0) return;

    setIsUploading(true);

    for (const file of droppedFiles) {
      const error = validateFile(file);
      if (error) {
        onUploadError?.(error);
        continue;
      }
      await uploadFile(file);
    }

    setIsUploading(false);
  };

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('image')) return '🖼️';
    return '📎';
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200',
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50',
          isUploading && 'pointer-events-none opacity-60'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept={acceptedTypes.join(',')}
          className="hidden"
          multiple
        />

        <div className="space-y-3">
          <div className="text-4xl">📤</div>
          <div>
            <p className="text-lg font-semibold text-gray-700">
              Drag & drop file di sini
            </p>
            <p className="text-sm text-gray-500">
              atau klik untuk pilih file
            </p>
          </div>
          <div className="text-xs text-gray-400">
            <p>Format: PDF, JPG, PNG • Maksimal {maxSizeMB}MB</p>
            <p className="mt-1">Dokumen: <span className="font-semibold">{documentType}</span></p>
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          {files.map((file) => (
            <div
              key={file.id}
              className="bg-white border rounded-lg p-4 shadow-sm"
            >
              <div className="flex items-center gap-4">
                {/* File Icon */}
                <div className="text-3xl">{getFileIcon(file.type)}</div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(file.size)}
                  </p>

                  {/* Progress Bar */}
                  {file.status === 'uploading' && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {file.progress}% diunggah...
                      </p>
                    </div>
                  )}

                  {/* Error Message */}
                  {file.status === 'error' && (
                    <p className="text-sm text-red-600 mt-1">{file.error}</p>
                  )}

                  {/* Success Message */}
                  {file.status === 'success' && (
                    <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                      ✓ Berhasil diunggah
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {file.status === 'success' && file.url && (
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                    >
                      Lihat
                    </a>
                  )}
                  {file.status !== 'uploading' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(file.id);
                      }}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                    >
                      Hapus
                    </button>
                  )}
                  {file.status === 'uploading' && (
                    <span className="inline-block animate-spin text-blue-600">⟳</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button (Alternative) */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex-1"
        >
          {isUploading ? (
            <>
              <span className="inline-block animate-spin mr-2">⟳</span>
              Mengunggah...
            </>
          ) : (
            '📎 Pilih File'
          )}
        </Button>
      </div>
    </div>
  );
}

export default FileUpload;