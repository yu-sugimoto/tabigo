// screens/ChatScreen.tsx
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { onChildAdded, onValue, push, ref } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
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
  const { chatId } = route.params; // chatId is now required per the RootStackParamList
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const messagesRef = ref(database, `chats/${chatId}/messages`);

    // Listen for overall value changes. This fires once even if the node is empty.
    const valueListener = onValue(messagesRef, (snapshot) => {
      if (!snapshot.exists()) {
        setLoading(false);
      }
    });

    // Listen for child added events.
    const childListener = onChildAdded(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setMessages((prev) => [
          ...prev,
          { id: snapshot.key || String(Date.now()), ...data },
        ]);
      }
      // Even if a child is added, ensure loading is false.
      setLoading(false);
    });

    return () => {
      // Cleanup both listeners:
      // You can call off() on messagesRef for each event type.
      // For example:
      // off(messagesRef, 'value', valueListener);
      // off(messagesRef, 'child_added', childListener);
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
      <View style={[styles.messageContainer, isMe ? styles.myMessage : styles.otherMessage]}>
        <Text style={styles.messageText}>{item.text}</Text>
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
    <View style={styles.container}>
      <FlatList
        style={styles.chatArea}
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
        />
        <Button title="送信" onPress={sendMessage} />
      </View>
    </View>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  chatArea: { flex: 1, padding: 8 },
  messageContainer: {
    marginVertical: 4,
    padding: 8,
    borderRadius: 6,
    maxWidth: '70%',
  },
  myMessage: {
    backgroundColor: '#007bff',
    alignSelf: 'flex-end',
  },
  otherMessage: {
    backgroundColor: '#ccc',
    alignSelf: 'flex-start',
  },
  messageText: { color: '#fff' },
  inputArea: {
    flexDirection: 'row',
    padding: 8,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 8,
    borderRadius: 4,
    paddingHorizontal: 8,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
