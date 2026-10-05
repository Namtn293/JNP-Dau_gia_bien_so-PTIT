import { SERVICE_ADMIN_PREFIX } from '@/shared/constants';
const BASE_PATH = `${SERVICE_ADMIN_PREFIX}`;
/**
 * Convert MinIO file path to full URL
 * @param path - Relative path from API (e.g., "cmc-dtqg/public/giaytothanhphanhoso/file.docx")
 * @returns Full URL (e.g., "https://cmcdtqgapi.zamiga.vn/api/UploadFile/download?objectName=...")
 */
export const convertFilePathToUrl = (path: string): string => {
  if (!path) return '';
  
  // Nếu đã là URL đầy đủ, return luôn
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Convert relative path sang download URL
  const baseUrl = `${import.meta.env.VITE_API_URL}${BASE_PATH}/UploadFile/download`;
  return `${baseUrl}?objectName=${encodeURIComponent(path)}`;
};

/**
 * Extract file name from path
 */
export const getFileNameFromPath = (path: string): string => {
  if (!path) return '';
  return path.split('/').pop() || path;
};