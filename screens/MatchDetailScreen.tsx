import { StackNavigationProp } from '@react-navigation/stack';
import { onValue, ref } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native';
import { RootStackParamList } from '../navigation/RootNavigator';
import { database } from '../services/firebase';

type MatchDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MatchDetail'>;

type Props = {
  navigation: MatchDetailScreenNavigationProp;
  route: { params: { requestId: string } };
};

type RequestData = {
  touristId: string;
  guideId: string;
  status: string;
  date: string;
  timeSlot: string;
  notes: string;
  createdAt: number;
  updatedAt: number;
};

const MatchDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { requestId } = route.params;
  const [requestData, setRequestData] = useState<RequestData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const reqRef = ref(database, `requests/${requestId}`);
    const unsubscribe = onValue(reqRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setRequestData(data);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [requestId]);

  if (loading || !requestData) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>マッチ詳細</Text>
      <Text style={styles.subtitle}>ガイド名: ガイドA</Text>
      <Text style={styles.subtitle}>ステータス: {requestData.status}</Text>
      <View style={{ marginVertical: 16 }}>
        <Text>エリア: 東京駅周辺</Text>
        <Text>日時: {requestData.date} {requestData.timeSlot}</Text>
      </View>
      {requestData.status === 'accepted' ? (
        <Button title="チャットへ" onPress={() => navigation.navigate('Chat', { chatId: requestId })} />
      ) : (
        <Text style={styles.infoText}>リクエストはまだ承認されていません</Text>
      )}
    </View>
  );
};

export default MatchDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, marginBottom: 16 },
  subtitle: { fontSize: 16, marginBottom: 8 },
  infoText: { fontSize: 14, color: '#555', marginTop: 8 },
});
