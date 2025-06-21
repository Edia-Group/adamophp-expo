import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/auth';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function LoginScreen() {
  const [codiceFiscale, setCodiceFiscale] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginAnon } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';

  const handleLogin = async () => {
    if (!codiceFiscale || !password) {
      Alert.alert('Errore', 'Inserisci Codice Fiscale e password');
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(codiceFiscale, password);
      if (success) {
        router.replace('/');
      } else {
        Alert.alert('Errore', 'Codice Fiscale o password non validi');
      }
    } catch (error) {
      Alert.alert('Errore', 'Si è verificato un errore durante il login');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToPublicAreas = async () => {
    setIsLoading(true);
    const success = await loginAnon();
    if (success) {
      router.replace('/');
    } else {
      Alert.alert('Errore', 'Impossibile continuare senza autenticazione.');
    }
    setIsLoading(false);
  };

  return (
      <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ThemedView style={styles.container}>
          <ThemedView style={styles.logoContainer}>
            <ThemedText type="title">Benvenuto</ThemedText>
            <ThemedText style={styles.subtitle}>Accedi al tuo account</ThemedText>
          </ThemedView>

          <ThemedView style={styles.formContainer}>
            <TextInput
                style={[ styles.input, { /* styles */ } ]}
                placeholder="Codice Fiscale"
                placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#888'}
                value={codiceFiscale}
                onChangeText={setCodiceFiscale}
                autoCapitalize="characters"
                keyboardType="default"
            />
            <TextInput
                style={[ styles.input, { /* styles */ } ]}
                placeholder="Password"
                placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#888'}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <TouchableOpacity
                style={[ styles.loginButton, { backgroundColor: Colors[colorScheme].tint } ]}
                onPress={handleLogin}
                disabled={isLoading}
            >
              <ThemedText style={styles.buttonText}>
                {isLoading ? 'Accesso in corso...' : 'Accedi'}
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.skipButton}
                onPress={navigateToPublicAreas}
            >
              <ThemedText style={styles.skipButtonText}>
                Continua senza login
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </KeyboardAvoidingView>
  );
}

// Styles remain the same
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    height: 50,
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  loginButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  skipButton: {
    marginTop: 20,
    alignItems: 'center',
    padding: 10,
  },
  skipButtonText: {
    fontSize: 14,
  },
});