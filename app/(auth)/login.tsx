import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/auth';
import { useColorScheme } from '@/hooks/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Errore', 'Inserisci email e password');
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        router.replace('/');
      } else {
        Alert.alert('Errore', 'Email o password non validi');
      }
    } catch (error) {
      Alert.alert('Errore', 'Si è verificato un errore durante il login');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // entra senza login
  const navigateToPublicAreas = async () => {
    
    const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
    
    try {
      const response = await fetch(backendUrl + `api/auth/login-anon`);

      if(response.ok) {
        const anonJWT = await response.json();
        console.log("anonJwt",anonJWT);
        
        if(Platform.OS === 'web') {
          localStorage.setItem("anonJWT", JSON.stringify(anonJWT));
        } else {
          try {
            await AsyncStorage.setItem("anonJWT", JSON.stringify(anonJWT))
          } catch(error) {
            console.error("Errore salvataggio locale", )
          }
        }

        router.replace('/');
      } else {
        console.error("Error response body", await response.text);
      }
    } catch(error) {
      console.error("Network error");
    }
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
            style={[
              styles.input,
              {
                backgroundColor: colorScheme === 'dark' ? '#333' : '#f5f5f5',
                color: colorScheme === 'dark' ? '#fff' : '#000',
                borderColor: colorScheme === 'dark' ? '#555' : '#ddd',
              },
            ]}
            placeholder="Email"
            placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#888'}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colorScheme === 'dark' ? '#333' : '#f5f5f5',
                color: colorScheme === 'dark' ? '#fff' : '#000',
                borderColor: colorScheme === 'dark' ? '#555' : '#ddd',
              },
            ]}
            placeholder="Password"
            placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#888'}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[
              styles.loginButton,
              {
                backgroundColor: Colors[colorScheme].tint,
                opacity: isLoading ? 0.7 : 1,
              },
            ]}
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
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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