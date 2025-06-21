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

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const WS_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function ChatScreen() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const colorScheme = useColorScheme() ?? 'light';
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    // The websocket connects when the component mounts and disconnects when it unmounts.

    const userId = user?.id || `anon_${Date.now()}`;
    const userName = user?.name || 'Anonymous User';

    const wsUrl = `ws://${WS_BACKEND_URL}/ws/user/${encodeURIComponent(userId)}?user_name=${encodeURIComponent(userName)}`;

    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;
    setIsLoading(true);

    socket.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setIsLoading(false);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'connection') { // This arrives as a confirmation of succesful first connection
        setChatId(data.chat_id);
        const systemMessage: Message = {
          id: Date.now().toString(),
          text: 'Connected to chat. An admin will be with you shortly.',
          isUser: false,
          timestamp: new Date(data.timestamp),
        };
        setMessages((prevMessages) => [...prevMessages, systemMessage]);

      } else if (data.type === 'message') {
        if (data.sender_type === 'admin') {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: data.message,
            isUser: false,
            timestamp: new Date(data.timestamp),
          };
          setMessages((prevMessages) => [...prevMessages, assistantMessage]);
        }
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsLoading(false);
      setIsConnected(false);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Could not connect to the chat service. Please try again later.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    };

    socket.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      setIsLoading(false);
      socketRef.current = null;
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [user]);

  const handleSendMessage = () => {
    if (!message.trim() || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      isUser: true,
      timestamp: new Date(),
    };

    // Add user's message to the UI immediately for a responsive feel.
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    socketRef.current.send(JSON.stringify({ message: message }));
    console.log("Sent message: " + message.toString() + " to server: " + WS_BACKEND_URL)


    setMessage('');
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
            {messages.length === 0 && isLoading && (
                <ActivityIndicator size="large" color={Colors[colorScheme].tint} style={{ marginTop: 50 }} />
            )}

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
                editable={isConnected} // Disable input if not connected
            />
            <TouchableOpacity
                style={[
                  styles.sendButton,
                  { backgroundColor: Colors[colorScheme].tint },
                  (!message.trim() || !isConnected) ? styles.disabledButton : {},
                ]}
                onPress={handleSendMessage}
                disabled={!message.trim() || !isConnected}
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
  // ... your existing styles remain unchanged
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