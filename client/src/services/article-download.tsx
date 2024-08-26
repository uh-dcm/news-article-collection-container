import { toast } from 'sonner';
import authClient from '@/services/authclient';
 
type ToastOptions = {
  loading: string;
  description: string | null;
  success: (msg: string) => string;
  error: (error: string) => string;
};

  export const handleArticleDownload = async function articleDownload({
      // format,
      // isQuery,
      setIsDisabled
    }: {
      format: 'json' | 'csv' | 'parquet',
      isQuery?: boolean,
      setIsDisabled: () => void
    }){ () => 
        toast.dismiss();
        setIsDisabled(true);
    }
        const toastOptions: ToastOptions = {
          loading: 'Downloading...',
          description: 'Please note that the process might take some time.',
          success: (msg: string) => msg,
          error: (error: string) => {
            console.error('Error downloading:', error);
            return 'Failed to download the file. Have you fetched articles yet?';
          }
        }
    
  toast.promise(async () => {
    try {
      const endpoint = isQuery ? '/api/articles/export_query' : '/api/articles/export';
      const response = await authClient.get(`${endpoint}?format=${format}`, { responseType: 'blob' });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `articles${isQuery ? '_query' : ''}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode!.removeChild(link);
      window.URL.revokeObjectURL(url);

      return 'Download successful!';
    } catch (error) {
      console.error('Download failed', error);
      throw new Error('Failed to download the file.');
    } finally {
      setIsDisabled(false);
    }
  },toastOptions);