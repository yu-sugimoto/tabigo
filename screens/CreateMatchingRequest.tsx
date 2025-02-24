// screens/CreateMatchingRequest.tsx
import { RouteProp, useRoute } from '@react-navigation/native';
import { push, ref } from 'firebase/database';
import React, { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { Button, Input, Paragraph, YStack } from 'tamagui';
import { RootStackParamList } from '../navigation/RootNavigator';
import { auth, database } from '../services/firebase';

type CreateMatchingRequestRouteProp = RouteProp<RootStackParamList, 'CreateMatchingRequest'>;

const CreateMatchingRequest: React.FC = () => {
  // Here we assume guideId is always passed in the route parameters.
  const { guideId } = useRoute<CreateMatchingRequestRouteProp>().params;

  const [timeSlot, setTimeSlot] = useState('');
  const [notes, setNotes] = useState('');

  const handleSaveRequest = async () => {
    // If guideId is missing, throw an error (this should not happen because guideId is required)
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
    // Create the request data using the current user's uid as touristId and the passed guideId.
    const requestData = {
      touristId: uid,
      guideId,
      status: "pending",
      date: new Date().toISOString().split("T")[0],
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
    backgroundColor: '#000', // Black button
  },
});
