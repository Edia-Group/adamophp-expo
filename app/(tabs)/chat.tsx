import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/auth';
import { useColorScheme } from '@/hooks/useColorScheme';
import { sendChatMessage } from '@/utils/api';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ChatScreen() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Ciao mi chiamo Adamo Bonazzi. Tempo fa sono stato espulso dal sindacato, ma ti chiedo di non credere a tutto ciò che leggi su internet.',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const colorScheme = useColorScheme() ?? 'light';
  const { isAuthenticated, user } = useAuth();

  // Funzione per inviare un messaggio
  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      // fake loading
      await new Promise((resolve) => setTimeout(resolve, 500));

      const response = await sendChatMessage(message);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.message || 'Grazie per il tuo messaggio. Ti risponderemo al più presto.',
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Si è verificato un errore nell\'invio del messaggio. Riprova più tardi.',
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ThemedView style={styles.container}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
        >
          <ThemedText style={styles.welcomeMessage}>
            {isAuthenticated
              ? `Benvenuto, ${user?.name || user?.email}! Come possiamo aiutarti?`
              : 'Benvenuto nella chat di assistenza. Come possiamo aiutarti?'}
          </ThemedText>

          {messages.map((msg) => (
            <ThemedView
              key={msg.id}
              style={[
                styles.messageBubble,
                msg.isUser
                  ? [styles.userMessage, { backgroundColor: Colors[colorScheme].tint }]
                  : [styles.assistantMessage, {
                      backgroundColor: colorScheme === 'dark' ? '#333' : '#f0f0f0',
                    }],
              ]}
            >
              <ThemedText
                style={[
                  styles.messageText,
                  msg.isUser ? styles.userMessageText : {},
                ]}
              >
                {msg.text}
              </ThemedText>
              <ThemedText
                style={[
                  styles.messageTime,
                  msg.isUser ? styles.userMessageTime : {},
                ]}
              >
                {formatTime(msg.timestamp)}
              </ThemedText>
            </ThemedView>
          ))}

          {isLoading && (
            <ThemedView
              style={[
                styles.messageBubble,
                styles.assistantMessage,
                {
                  backgroundColor: colorScheme === 'dark' ? '#333' : '#f0f0f0',
                  flexDirection: 'row',
                  padding: 12,
                },
              ]}
            >
              <ActivityIndicator
                size="small"
                color={Colors[colorScheme].tint}
                style={{ marginRight: 8 }}
              />
              <ThemedText style={styles.loadingText}>Digitando...</ThemedText>
            </ThemedView>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colorScheme === 'dark' ? '#333' : '#f5f5f5',
                color: colorScheme === 'dark' ? '#fff' : '#000',
                borderColor: colorScheme === 'dark' ? '#555' : '#ddd',
              },
            ]}
            placeholder="Scrivi un messaggio..."
            placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#888'}
            value={message}
            onChangeText={setMessage}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: Colors[colorScheme].tint },
              !message.trim() ? styles.disabledButton : {},
            ]}
            onPress={handleSendMessage}
            disabled={!message.trim() || isLoading}
          >
            <IconSymbol
              name="paperplane.fill"
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  welcomeMessage: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
    fontSize: 14,
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    maxWidth: '80%',
    minWidth: 100,
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
    alignSelf: 'flex-end',
    opacity: 0.7,
  },
  userMessageTime: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 8,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  loadingText: {
    fontSize: 14,
  },
});