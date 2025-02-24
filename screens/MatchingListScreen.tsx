// screens/MatchingListScreen.tsx
import { StackNavigationProp } from '@react-navigation/stack';
import { onValue, ref } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../navigation/RootNavigator';
import { auth, database } from '../services/firebase';

type MatchingListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MatchingList'>;

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

type UserProfile = {
  role: 'guide' | 'traveler';
};

type Props = {
  navigation: MatchingListScreenNavigationProp;
};

const MatchingListScreen: React.FC<Props> = ({ navigation }) => {
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // ユーザープロフィールの購読（1度だけ実行）
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const userRef = ref(database, `users/${uid}`);
    const unsubscribeUser = onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.role) {
        setUserProfile({ role: data.role });
      }
    });
    return () => unsubscribeUser();
  }, []);

  // リクエストの購読（userProfile が更新されたときのみ実行）
  useEffect(() => {
    if (!auth.currentUser || !userProfile) return;
    const uid = auth.currentUser.uid;
    const requestsRef = ref(database, 'requests');
    const unsubscribeRequests = onValue(requestsRef, (snapshot) => {
      const data = snapshot.val();
      const reqList: RequestData[] = [];
      if (data) {
        Object.keys(data).forEach((key) => {
          const req: RequestData = { ...data[key] };
          reqList.push(req);
        });
      }
      if (userProfile.role === 'guide') {
        setRequests(reqList.filter((r) => r.guideId === uid));
      } else {
        setRequests(reqList.filter((r) => r.touristId === uid));
      }
      setLoading(false);
    });
    return () => unsubscribeRequests();
  }, [userProfile]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (requests.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>マッチ一覧</Text>
        <Text>該当するリクエストはありません。</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>マッチ一覧</Text>
      <ScrollView style={styles.list}>
        {requests.map((req, index) => (
          <TouchableOpacity
            key={index}
            style={styles.item}
            onPress={() => navigation.navigate('MatchDetail', { requestId: String(index) })}
          >
            <Text style={styles.name}>
              {userProfile?.role === 'guide' ? `旅行者からのリクエスト` : `リクエスト`}
            </Text>
            <Text style={styles.status}>ステータス: {req.status}</Text>
            <Text style={styles.timeSlot}>希望時間帯: {req.timeSlot}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default MatchingListScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, marginBottom: 16, textAlign: 'center' },
  list: { flex: 1 },
  item: {
    flexDirection: 'column',
    padding: 12,
    backgroundColor: '#eee',
    borderRadius: 4,
    marginBottom: 12,
  },
  name: { fontSize: 16, fontWeight: 'bold' },
  status: { fontSize: 14, color: '#555', marginTop: 4 },
  timeSlot: { fontSize: 14, color: '#555', marginTop: 4 },
});
