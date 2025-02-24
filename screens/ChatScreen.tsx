// screens/ChatScreen.tsx
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { onChildAdded, onValue, push, ref } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { RootStackParamList } from '../navigation/RootNavigator';
import { auth, database } from '../services/firebase';

type ChatScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Chat'>;
type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;

type Props = {
  navigation: ChatScreenNavigationProp;
  route: ChatScreenRouteProp;
};

export type Message = {
  id: string;
  text: string;
  sender: string;
  createdAt: number;
};

const ChatScreen: React.FC<Props> = ({ navigation, route }) => {
  const { chatId } = route.params; // chatId is required
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const messagesRef = ref(database, `chats/${chatId}/messages`);

    // Listener for overall value changes (fires once)
    const valueListener = onValue(messagesRef, (snapshot) => {
      if (!snapshot.exists()) {
        setLoading(false);
      }
    });

    // Listener for child added events
    const childListener = onChildAdded(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setMessages((prev) => [
          ...prev,
          { id: snapshot.key || String(Date.now()), ...data },
        ]);
      }
      setLoading(false);
    });

    return () => {
      // Optionally, remove listeners using off() if needed
    };
  }, [chatId]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert('Error', 'ユーザーが認証されていません');
      return;
    }
    const newMessage: Omit<Message, 'id'> = {
      text: inputText,
      sender: uid,
      createdAt: Date.now(),
    };
    try {
      const messagesRef = ref(database, `chats/${chatId}/messages`);
      await push(messagesRef, newMessage);
      setInputText('');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isMe = item.sender === auth.currentUser?.uid;
    return (
      <View
        style={[
          styles.messageContainer,
          isMe ? styles.myMessage : styles.otherMessage,
        ]}
      >
        <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.otherMessageText]}>
          {item.text}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 70}
      >
        <FlatList
          style={styles.chatArea}
          contentContainerStyle={styles.chatContentContainer}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
        <View style={styles.inputArea}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="メッセージを入力"
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendButtonText}>送信</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoid: {
    flex: 1,
  },
  chatArea: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  chatContentContainer: {
    paddingBottom: 50, // Reduced padding to bring input area up a bit
  },
  messageContainer: {
    marginVertical: 6,
    padding: 10,
    borderRadius: 30, // Fully rounded (pill-shaped)
    maxWidth: '75%',
  },
  myMessage: {
    backgroundColor: '#007bff', // Blue background for my messages
    alignSelf: 'flex-end',
  },
  otherMessage: {
    backgroundColor: '#f2f2f2', // Very light grey for others' messages
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 20,
  },
  myMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#000', // Black text for others' messages
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
    backgroundColor: '#f9f9f9',
  },
  textInput: {
    flex: 1,
    height: 50, // Slightly smaller height for input
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
    borderRadius: 25, // Fully rounded input field
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#000',
  },
  sendButton: {
    backgroundColor: '#000', // Black send button
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    marginLeft: 8,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
