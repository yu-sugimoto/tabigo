// screens/CreateMatchingRequest.tsx
import { RouteProp } from '@react-navigation/native';
import { push, ref } from 'firebase/database';
import React, { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { Button, Input, Paragraph, YStack } from 'tamagui';
import { RootStackParamList } from '../navigation/RootNavigator';
import { auth, database } from '../services/firebase';

type CreateMatchingRequestRouteProp = RouteProp<RootStackParamList, 'CreateMatchingRequest'>;

type Props = {
  route: CreateMatchingRequestRouteProp;
};

const CreateMatchingRequest: React.FC<Props> = ({ route }) => {
  // guideId をルートパラメータから取得（必須）
  const { guideId } = route.params;

  // 入力項目の状態
  const [timeSlot, setTimeSlot] = useState('');
  const [notes, setNotes] = useState('');

  const handleSaveRequest = async () => {
    // guideId が空の場合はエラー表示
    if (!guideId.trim()) {
      Alert.alert('Error', 'ガイドが選択されていません');
      return;
    }
    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert('Error', 'ユーザーが認証されていません');
      return;
    }
    if (!timeSlot.trim()) {
      Alert.alert('Error', '希望時間帯を入力してください');
      return;
    }
    // リクエストデータの作成
    const requestData = {
      touristId: uid,
      guideId, // ルートパラメータで渡された guideId を使用
      status: "pending",
      date: new Date().toISOString().split("T")[0], // yyyy-mm-dd形式
      timeSlot,
      notes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    try {
      await push(ref(database, 'requests'), requestData);
      Alert.alert('Success', 'リクエストを送信しました');
      setTimeSlot('');
      setNotes('');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <YStack f={1} p="$6" space>
      <Paragraph size="$6" ta="center" mb="$4">
        マッチングリクエスト作成
      </Paragraph>
      <Input
        placeholder="希望時間帯（例: 10:00-15:00）"
        value={timeSlot}
        onChangeText={setTimeSlot}
        size="$4"
        borderWidth={1}
        borderColor="$borderColor"
        borderRadius="$3"
        padding="$3"
      />
      <Input
        placeholder="備考（例: 子連れ、ペット連れなど）"
        value={notes}
        onChangeText={setNotes}
        size="$4"
        borderWidth={1}
        borderColor="$borderColor"
        borderRadius="$3"
        padding="$3"
        multiline
      />
      <Button
        onPress={handleSaveRequest}
        theme="active"
        size="$4"
        style={styles.saveButton}
        themeInverse
      >
        リクエスト送信
      </Button>
    </YStack>
  );
};

export default CreateMatchingRequest;

const styles = StyleSheet.create({
  saveButton: {
    backgroundColor: '#000', // 黒いボタン
  },
});
