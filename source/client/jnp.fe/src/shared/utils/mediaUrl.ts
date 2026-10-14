export const normalizeMediaUrl = (url?: string): string => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }

    const MINIO_BASE_URL = `${import.meta.env.VITE_RESOURCE_URL}`;
    const cleanPath = url.startsWith('/') ? url.substring(1) : url;

    const result = `${MINIO_BASE_URL}${cleanPath}`;

    return result;
};
