// screens/ChatScreen.tsx
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { Button, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { RootStackParamList } from '../navigation/RootNavigator';

type ChatScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Chat'>;

type Props = {
  navigation: ChatScreenNavigationProp;
};

type Message = {
  id: string;
  text: string;
  sender: 'me' | 'other';
};

const ChatScreen: React.FC<Props> = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'こんにちは！', sender: 'other' },
    { id: '2', text: 'はじめまして！よろしくお願いします。', sender: 'me' },
  ]);
  const [inputText, setInputText] = useState('');

  const sendMessage = () => {
    if (!inputText) return;
    const newMessage: Message = {
      id: String(Date.now()),
      text: inputText,
      sender: 'me',
    };
    setMessages((prev) => [...prev, newMessage]);
    setInputText('');
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isMe = item.sender === 'me';
    return (
      <View
        style={[
          styles.messageContainer,
          isMe ? styles.myMessage : styles.otherMessage,
        ]}
      >
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    );
  };

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
  messageText: {
    color: '#fff',
  },
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
});
