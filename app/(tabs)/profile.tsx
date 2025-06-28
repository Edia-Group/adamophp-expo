import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/auth';
import { useColorScheme } from '@/hooks/useColorScheme';
import { downloadPdfByType, PdfType } from '@/utils/api';

export default function ProfileScreen() {
  const { user, isAuthenticated, logout, isLoading: authLoading, isAnonymous } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const [isDownloading, setIsDownloading] = useState<PdfType | null>(null);

  const handleDownloadPdf = async (type: PdfType) => {
    if (!isAuthenticated || !user) {
      Alert.alert('Accesso richiesto', 'Per favore, effettua il login per scaricare i documenti.');
      router.replace('/login');
      return;
    }

    setIsDownloading(type);

    try {
      const success = await downloadPdfByType(type);

      if (!success) {
        Alert.alert('Errore', 'Si è verificato un errore durante il download del documento.');
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      Alert.alert('Errore', 'Si è verificato un errore durante il download del documento.');
    } finally {
      setIsDownloading(null);
    }
  };

  const handleLogout = () => {
    const confirmationMessage = 'Sei sicuro di voler effettuare il logout?';

    if (Platform.OS === 'web') {
      if (window.confirm(confirmationMessage)) {
        logout();
      }
    } else {
      Alert.alert(
          'Conferma logout',
          confirmationMessage,
          [
            {
              text: 'Annulla',
              style: 'cancel',
            },
            {
              text: 'Logout',
              onPress: logout,
            },
          ],
          { cancelable: true }
      );
    }
  };

  if (authLoading) {
    return (
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
        </ThemedView>
    );
  }

  if (isAnonymous || !isAuthenticated) {
    return (
        <ThemedView style={styles.container}>
          <ThemedText type="title" style={{ textAlign: 'center', marginBottom: 20 }}>Profilo</ThemedText>
          <ThemedText style={{ textAlign: 'center', marginBottom: 20 }}>
            Accedi per visualizzare il tuo profilo e scaricare i documenti.
          </ThemedText>
          <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: Colors[colorScheme].tint }]}
              onPress={() => router.push('/login')}
          >
            <ThemedText style={styles.loginButtonText}>Accedi</ThemedText>
          </TouchableOpacity>
        </ThemedView>
    )
  }

  if (!user) {
    return null;
  }

  return (
      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.container}>
          <ThemedView style={styles.profileHeader}>
            <ThemedView style={[styles.avatar, { backgroundColor: Colors[colorScheme].tint }]}>
              <ThemedText style={styles.avatarText}>
                {user?.name?.charAt(0) || user?.cfisc?.charAt(0) || 'U'}
              </ThemedText>
            </ThemedView>

            <ThemedText type="title" style={styles.userName}>
              {user?.name || 'Utente'}
            </ThemedText>

            <ThemedText style={styles.userEmail}>
              {user?.cfisc}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.documentsSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              I Tuoi Documenti
            </ThemedText>
            <ThemedText style={styles.sectionDescription}>
              Scarica i documenti disponibili per il tuo account
            </ThemedText>

            <ThemedView style={styles.documentsContainer}>
              <TouchableOpacity
                  style={[
                    styles.documentCard,
                    { backgroundColor: Colors[colorScheme].card }
                  ]}
                  onPress={() => handleDownloadPdf(PdfType.LLOYDS)}
                  disabled={isDownloading !== null}
              >
                <ThemedView style={styles.documentIconContainer}>
                  <IconSymbol
                      name="doc.fill"
                      size={32}
                      color={Colors[colorScheme].tint}
                  />
                </ThemedView>
                <ThemedView style={styles.documentInfo}>
                  <ThemedText type="defaultSemiBold" style={styles.documentTitle}>
                    Lloyd's 2024
                  </ThemedText>
                  <ThemedText style={styles.documentDescription}>
                    Clicca per scaricare il PDF
                  </ThemedText>
                </ThemedView>
                {isDownloading === PdfType.LLOYDS ? (
                    <ActivityIndicator color={Colors[colorScheme].tint} />
                ) : (
                    <IconSymbol
                        name="arrow.down.circle.fill"
                        size={24}
                        color={Colors[colorScheme].tint}
                    />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                  style={[
                    styles.documentCard,
                    { backgroundColor: Colors[colorScheme].card }
                  ]}
                  onPress={() => handleDownloadPdf(PdfType.CERTIFICATE)}
                  disabled={isDownloading !== null}
              >
                <ThemedView style={styles.documentIconContainer}>
                  <IconSymbol
                      name="doc.fill"
                      size={32}
                      color={Colors[colorScheme].tint}
                  />
                </ThemedView>
                <ThemedView style={styles.documentInfo}>
                  <ThemedText type="defaultSemiBold" style={styles.documentTitle}>
                    Certificato
                  </ThemedText>
                  <ThemedText style={styles.documentDescription}>
                    Clicca per scaricare il PDF
                  </ThemedText>
                </ThemedView>
                {isDownloading === PdfType.CERTIFICATE ? (
                    <ActivityIndicator color={Colors[colorScheme].tint} />
                ) : (
                    <IconSymbol
                        name="arrow.down.circle.fill"
                        size={24}
                        color={Colors[colorScheme].tint}
                    />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                  style={[
                    styles.documentCard,
                    { backgroundColor: Colors[colorScheme].card }
                  ]}
                  onPress={() => handleDownloadPdf(PdfType.CARD)}
                  disabled={isDownloading !== null}
              >
                <ThemedView style={styles.documentIconContainer}>
                  <IconSymbol
                      name="doc.fill"
                      size={32}
                      color={Colors[colorScheme].tint}
                  />
                </ThemedView>
                <ThemedView style={styles.documentInfo}>
                  <ThemedText type="defaultSemiBold" style={styles.documentTitle}>
                    Card
                  </ThemedText>
                  <ThemedText style={styles.documentDescription}>
                    Clicca per scaricare il PDF
                  </ThemedText>
                </ThemedView>
                {isDownloading === PdfType.CARD ? (
                    <ActivityIndicator color={Colors[colorScheme].tint} />
                ) : (
                    <IconSymbol
                        name="arrow.down.circle.fill"
                        size={24}
                        color={Colors[colorScheme].tint}
                    />
                )}
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>

          <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
          >
            <ThemedText style={styles.logoutButtonText}>
              Logout
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  avatarText: {
    fontSize: 32,
    color: Colors.dark.text,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    marginBottom: 4,
  },
  userEmail: {
    opacity: 0.7,
  },
  documentsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  sectionDescription: {
    marginBottom: 16,
    opacity: 0.7,
  },
  documentsContainer: {
    gap: 12,
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  documentIconContainer: {
    marginRight: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    marginBottom: 4,
  },
  documentDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  logoutButton: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#ff6b6b',
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  loginButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  loginButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});