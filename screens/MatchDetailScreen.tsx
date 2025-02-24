// screens/MatchDetailScreen.tsx
import { StackNavigationProp } from '@react-navigation/stack';
import { onValue, ref } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
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
  status: 'pending' | 'accepted' | 'rejected' | 'reviewWait';
  area?: string;         // エリア情報
  date: string;          // 例: "2025-02-24"
  timeSlot: string;      // 例: "12:34-13:45"
  notes: string;
  createdAt: number;
  updatedAt: number;
};

const MatchDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { requestId } = route.params;

  const [requestData, setRequestData] = useState<RequestData | null>(null);
  const [guideName, setGuideName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // ステータス日本語表示用マッピング
  const statusLabelMap: Record<RequestData['status'], string> = {
    pending: '保留中',
    accepted: '承認済',
    rejected: '却下',
    reviewWait: 'レビュー待ち'
  };

  useEffect(() => {
    const reqRef = ref(database, `requests/${requestId}`);
    const unsubscribe = onValue(reqRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setRequestData(data);

        // ガイド名の取得
        if (data.guideId) {
          const guideRef = ref(database, `users/${data.guideId}`);
          onValue(guideRef, (guideSnap) => {
            const guideData = guideSnap.val();
            if (guideData && guideData.name) {
              setGuideName(guideData.name);
            }
          });
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [requestId]);

  // チャットへ移動
  const handleChatNavigation = () => {
    if (!requestData) return;
    if (requestData.status !== 'accepted') {
      Alert.alert('Info', 'まだ承認されていないため、チャットできません。');
      return;
    }
    navigation.navigate('Chat', { chatId: requestId });
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!requestData) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>該当するリクエストが見つかりませんでした。</Text>
      </SafeAreaView>
    );
  }

  // ステータスを日本語へ変換
  const statusLabel = statusLabelMap[requestData.status] || '不明';

  // 日時表示用: date を「YYYY/MM/DD」にして timeSlot を付加
  const dateDisplay = requestData.date.replace(/-/g, '/'); // 例: "2025/02/24"

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>マッチ詳細</Text>

        {/* ガイド名 */}
        <View style={styles.infoRow}>
          <Text style={styles.label}>ガイド名</Text>
          <Text style={styles.value}>{guideName || '---'}</Text>
        </View>

        {/* ステータス */}
        <View style={styles.infoRow}>
          <Text style={styles.label}>ステータス</Text>
          <Text
            style={[
              styles.value,
              requestData.status === 'accepted'
                ? { color: '#0d6efd' }
                : requestData.status === 'rejected'
                  ? { color: '#ff3b30' }
                  : { color: '#555' },
            ]}
          >
            {statusLabel}
          </Text>
        </View>

        {/* エリア */}
        <View style={styles.infoRow}>
          <Text style={styles.label}>エリア</Text>
          <Text style={styles.value}>
            {requestData.area ?? 'エリア情報なし'}
          </Text>
        </View>

        {/* 日時 */}
        <View style={styles.infoRow}>
          <Text style={styles.label}>日時</Text>
          <Text style={styles.value}>
            {dateDisplay} {requestData.timeSlot}
          </Text>
        </View>

        {/* 備考 */}
        {requestData.notes ? (
          <View style={styles.infoRow}>
            <Text style={styles.label}>備考</Text>
            <Text style={styles.value}>{requestData.notes}</Text>
          </View>
        ) : null}

        {/* チャットボタン */}
        <TouchableOpacity
          style={[
            styles.chatButton,
            requestData.status !== 'accepted' && { backgroundColor: '#ccc' },
          ]}
          onPress={handleChatNavigation}
          disabled={requestData.status !== 'accepted'}
        >
          <Text style={styles.chatButtonText}>チャットへ</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default MatchDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    // 中央寄せ + パディング
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginTop: 32, // 上部に余白を追加
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,

    // 影 (iOS/Android)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'column',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  chatButton: {
    marginTop: 24,
    backgroundColor: '#0d6efd',
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: 'center',
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
