import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getToken } from '@/contexts/auth';

const API_URL = 'http://' + process.env.EXPO_PUBLIC_BACKEND_URL;

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

export const downloadPdfByType = async (type: PdfType, memberId: string): Promise<boolean> => {
  try {
    const token = await getToken();

    if (!token) {
      throw new Error('Autenticazione richiesta');
    }

    const pdfMap = {
      [PdfType.LLOYDS]: { path: `/api/pdf/print-lloyds-2024/${memberId}`, filename: 'Lloyds_2024.pdf' },
      [PdfType.CERTIFICATE]: { path: `/api/pdf/print-certificate/${memberId}`, filename: 'Certificato.pdf' },
      [PdfType.CARD]: { path: `/api/pdf/print-card/${memberId}`, filename: 'Card.pdf' },
    };

    const pdfInfo = pdfMap[type];

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

    return true;
  } catch (error) {
    console.error('Error downloading PDF:', error);
    return false;
  }
};