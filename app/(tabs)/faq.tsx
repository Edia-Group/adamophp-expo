import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface Faq {
  id: string;
  question: string;
  answer: string;
}

export default function FaqScreen() {
  const colorScheme = useColorScheme() ?? 'light';

  const faqs: Faq[] = [
    {
      id: '1',
      question: 'Come posso accedere al mio account?',
      answer: 'Puoi accedere al tuo account dalla schermata di login inserendo la tua email e password. Se hai dimenticato le tue credenziali, contatta il supporto tecnico.',
    },
    {
      id: '2',
      question: 'Come posso scaricare i documenti?',
      answer: 'Per scaricare i documenti, accedi al tuo profilo e seleziona uno dei tre pulsanti disponibili per il download dei PDF. È necessario essere autenticati per accedere a questa funzionalità.',
    },
    {
      id: '3',
      question: 'L\'app è disponibile per iOS e Android?',
      answer: 'Sì, l\'app è disponibile sia per dispositivi iOS che Android. Puoi scaricarla dall\'App Store o dal Google Play Store.',
    },
    {
      id: '4',
      question: 'Come posso contattare l\'assistenza?',
      answer: 'Puoi contattare l\'assistenza tramite la sezione "Assistenza" nell\'app. La funzione di chat è disponibile anche senza effettuare il login.',
    },
    {
      id: '5',
      question: 'Posso utilizzare l\'app senza registrarmi?',
      answer: 'Puoi accedere alle sezioni FAQ e Assistenza senza registrarti. Tuttavia, per scaricare i documenti e accedere al tuo profilo, è necessario effettuare il login con un account esistente.',
    },
  ];

  return (
    <ScrollView style={styles.scrollView}>
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          Domande Frequenti
        </ThemedText>

        <ThemedView style={styles.faqContainer}>
          {faqs.map((faq) => (
            <Collapsible key={faq.id} title={faq.question}>
              <ThemedText style={styles.faqAnswer}>{faq.answer}</ThemedText>
            </Collapsible>
          ))}
        </ThemedView>
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
  faqContainer: {
    gap: 16,
  },
  faqAnswer: {
    marginTop: 8,
    lineHeight: 22,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
});