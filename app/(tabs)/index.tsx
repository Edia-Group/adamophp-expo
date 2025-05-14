import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/auth';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const { isAuthenticated, user } = useAuth();

  return (
    <ScrollView style={styles.scrollView}>
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          Benvenuto da ADAMO
        </ThemedText>
        
        {isAuthenticated ? (
          <ThemedText style={styles.subtitle}>
            Ciao, {user?.name || user?.email}!
          </ThemedText>
        ) : (
          <ThemedText style={styles.subtitle}>
            Accedi per scoprire tutte le funzionalità
          </ThemedText>
        )}

        <ThemedView style={styles.cardsContainer}>
          <TouchableOpacity
            style={[styles.card, { backgroundColor: Colors[colorScheme].background }]}
            onPress={() => router.push('/faq')}
          >
            <ThemedText type="subtitle" style={styles.cardTitle}>
              FAQ
            </ThemedText>
            <ThemedText style={styles.cardDescription}>
              Consulta le domande frequenti per trovare risposte ai tuoi dubbi
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, { backgroundColor: Colors[colorScheme].background }]}
            onPress={() => router.push('/chat')}
          >
            <ThemedText type="subtitle" style={styles.cardTitle}>
              Assistenza
            </ThemedText>
            <ThemedText style={styles.cardDescription}>
              Hai bisogno di aiuto? Contatta la nostra assistenza
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.card, 
              { 
                backgroundColor: Colors[colorScheme].background,
                opacity: isAuthenticated ? 1 : 0.7 
              }
            ]}
            onPress={() => {
              if (isAuthenticated) {
                router.push('/profile');
              } else {
                router.push('/login');
              }
            }}
          >
            <ThemedText type="subtitle" style={styles.cardTitle}>
              Profilo
            </ThemedText>
            <ThemedText style={styles.cardDescription}>
              {isAuthenticated 
                ? 'Accedi al tuo profilo e scarica i documenti' 
                : 'Accedi per visualizzare il tuo profilo e scaricare documenti'}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {!isAuthenticated && (
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: Colors[colorScheme].tint }]}
            onPress={() => router.push('/login')}
          >
            <ThemedText style={styles.loginButtonText}>
              Accedi
            </ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 30,
    fontSize: 16,
  },
  cardsContainer: {
    width: '100%',
    gap: 16,
  },
  card: {
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    marginBottom: 8,
  },
  cardDescription: {
    opacity: 0.8,
  },
  loginButton: {
    marginTop: 30,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});