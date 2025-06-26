import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { getToken } from '@/contexts/auth';

const API_URL = 'https://' + process.env.EXPO_PUBLIC_BACKEND_URL;

export const fetchWithAuth = async (
    endpoint: string,
    options: RequestInit = {}
) => {
  const token = await getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Error: ${response.status}`);
  }

  return response;
};

export const sendChatMessage = async (message: string) => {
  const response = await fetchWithAuth('/chat/messages', {
    method: 'POST',
    body: JSON.stringify({ message }),
  });

  return await response.json();
};

export const getFaqs = async () => {
  const response = await fetch(`${API_URL}/faqs`);

  if (!response.ok) {
    throw new Error(`Error fetching FAQs: ${response.status}`);
  }

  return await response.json();
};

export enum PdfType {
  LLOYDS = 'lloyds',
  CERTIFICATE = 'certificate',
  CARD = 'card',
}

export const downloadPdfByType = async (type: PdfType): Promise<boolean> => {
  try {
    const token = await getToken();

    if (!token) {
      throw new Error('Autenticazione richiesta');
    }

    const pdfMap = {
      [PdfType.LLOYDS]: { path: `/api/pdf/print-lloyds-2024`, filename: 'Lloyds_2024.pdf' },
      [PdfType.CERTIFICATE]: { path: `/api/pdf/print-cert`, filename: 'Certificato.pdf' },
      [PdfType.CARD]: { path: `/api/pdf/print-card`, filename: 'Card.pdf' },
    };

    const pdfInfo = pdfMap[type];

    if (Platform.OS === 'web') {
      const response = await fetchWithAuth(pdfInfo.path);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = pdfInfo.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } else {
      const downloadPath = `${FileSystem.cacheDirectory}${pdfInfo.filename}`;
      const downloadResumable = FileSystem.createDownloadResumable(
          `${API_URL}${pdfInfo.path}`,
          downloadPath,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
      );

      // @ts-ignore
      const { uri } = await downloadResumable.downloadAsync();

      if (!uri) {
        throw new Error('Download fallito');
      }

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
        });
      } else {
        alert("La condivisione non è disponibile su questo dispositivo.");
      }
    }

    return true;
  } catch (error) {
    console.error('Error downloading PDF:', error);
    return false;
  }
};