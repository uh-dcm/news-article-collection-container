import { toast } from 'sonner';
import authClient from '@/services/authclient';

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export const handleArticleDownload = async (
  format: 'json' | 'csv' | 'parquet',
  isQuery: boolean = false,
  setIsDisabled: (value: boolean) => void
) => {
  toast.dismiss();
  setIsDisabled(true);

  const toastId = toast.loading('Preparing download...', {
    description: 'Please note that the process might take some time.',
  });

  try {
    const endpoint = isQuery ? '/api/articles/export_query' : '/api/articles/export';
    const response = await authClient.get(`${endpoint}?format=${format}`, {
      responseType: 'blob',
      onDownloadProgress: (progressEvent) => {
        if (progressEvent.loaded < 100) {
          // this was a check for status updates, possibly not necessary anymore
          toast.loading('Processing...', { id: toastId });
        } else if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          const loadedSize = formatFileSize(progressEvent.loaded);
          const totalSize = formatFileSize(progressEvent.total);
          toast.loading(`Downloading... ${percentCompleted}%(${loadedSize}/${totalSize})`, { id: toastId });
        } else {
          const loadedSize = formatFileSize(progressEvent.loaded);
          toast.loading(`Downloading... ${loadedSize}`, { id: toastId });
        }
      },
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `articles${isQuery ? '_query' : ''}.${format}`);
    document.body.appendChild(link);
    link.click();
    link.parentNode!.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success('Download successful!', { id: toastId });
  } catch (error) {
    console.error('Download failed', error);
    toast.error('Failed to download the file. Have you fetched articles yet?', { id: toastId });
  } finally {
    setIsDisabled(false);
  }
};
