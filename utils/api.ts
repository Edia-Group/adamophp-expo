import * as FileSystem from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';
import * as Sharing from 'expo-sharing';

const API_URL = 'https://api.carl.com';

export const getToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync('auth_token');
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

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

export const downloadPdf = async (pdfId: string, filename: string): Promise<boolean> => {
  try {
    const token = await getToken();
    
    if (!token) {
      throw new Error('Autenticazione richiesta');
    }
    
    // Crea una richiesta per scaricare il file
    const downloadPath = `${FileSystem.cacheDirectory}${filename}`;
    
    const downloadResumable = FileSystem.createDownloadResumable(
      `${API_URL}/documents/${pdfId}`,
      downloadPath,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    const { uri } = await downloadResumable.downloadAsync();
    
    if (!uri) {
      throw new Error('Download fallito');
    }
    
    // Condividi il file
    await Sharing.shareAsync(uri, {
      UTI: '.pdf',
      mimeType: 'application/pdf',
    });
    
    return true;
  } catch (error) {
    console.error('Error downloading PDF:', error);
    return false;
  }
};

// Tipi di PDF disponibili
export enum PdfType {
  DOCUMENTO_1 = 'documento_1',
  DOCUMENTO_2 = 'documento_2',
  DOCUMENTO_3 = 'documento_3',
}

// Funzione di utilità per scaricare i vari tipi di PDF
export const downloadPdfByType = async (type: PdfType): Promise<boolean> => {
  const pdfMap = {
    [PdfType.DOCUMENTO_1]: { id: 'doc1', filename: 'Documento_1.pdf' },
    [PdfType.DOCUMENTO_2]: { id: 'doc2', filename: 'Documento_2.pdf' },
    [PdfType.DOCUMENTO_3]: { id: 'doc3', filename: 'Documento_3.pdf' },
  };
  
  const pdfInfo = pdfMap[type];
  return await downloadPdf(pdfInfo.id, pdfInfo.filename);
};