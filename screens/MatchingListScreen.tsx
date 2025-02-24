import { StackNavigationProp } from '@react-navigation/stack';
import { onValue, ref, update } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from 'tamagui';
import { RootStackParamList } from '../navigation/RootNavigator';
import { auth, database } from '../services/firebase';

type MatchingListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MatchingList'>;

type RequestData = {
  id: string;
  touristId: string;
  guideId: string;
  status: string;
  date: string;
  timeSlot: string;
  notes: string;
  createdAt: number;
  updatedAt: number;
};

const MatchingListScreen: React.FC<{ navigation: MatchingListScreenNavigationProp }> = ({ navigation }) => {
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'guide' | 'traveler' | null>(null);
  const uid = auth.currentUser?.uid;

  useEffect(() => {
    if (!uid) return;
    const userRef = ref(database, `users/${uid}`);
    const unsubscribeUser = onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.role) {
        setUserRole(data.role);
      }
    });
    return () => unsubscribeUser();
  }, [uid]);

  useEffect(() => {
    if (!uid) return;
    const requestsRef = ref(database, 'requests');
    const unsubscribeRequests = onValue(requestsRef, (snapshot) => {
      const data = snapshot.val();
      const reqList: RequestData[] = [];
      if (data) {
        Object.keys(data).forEach((key) => {
          reqList.push({ id: key, ...data[key] });
        });
      }
      // When userRole is set, filter by UID accordingly.
      if (userRole === 'guide') {
        setRequests(reqList.filter((r) => r.guideId === uid));
      } else if (userRole === 'traveler') {
        setRequests(reqList.filter((r) => r.touristId === uid));
      } else {
        setRequests([]);
      }
      setLoading(false);
    });
    return () => unsubscribeRequests();
  }, [uid, userRole]);

  // For guide: allow status updates
  const updateRequestStatus = async (requestId: string, newStatus: string) => {
    try {
      await update(ref(database, `requests/${requestId}`), { status: newStatus, updatedAt: Date.now() });
      Alert.alert('Success', `リクエストを ${newStatus} に更新しました`);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

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
        {requests.map((req) => (
          <View key={req.id} style={styles.item}>
            <Text style={styles.name}>
              {userRole === 'guide' ? '旅行者からのリクエスト' : 'リクエスト'}
            </Text>
            <Text style={styles.status}>ステータス: {req.status}</Text>
            <Text style={styles.timeSlot}>希望時間帯: {req.timeSlot}</Text>
            {userRole === 'guide' && req.status === 'pending' && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => updateRequestStatus(req.id, 'accepted')}
                >
                  <Text style={styles.actionButtonText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => updateRequestStatus(req.id, 'rejected')}
                >
                  <Text style={styles.actionButtonText}>Reject</Text>
                </TouchableOpacity>
              </View>
            )}
            {userRole === 'traveler' && req.status === 'accepted' && (
              <Button
                onPress={() => navigation.navigate('Chat', { chatId: req.id })}
              >
                Chat
              </Button>
            )}
            <TouchableOpacity onPress={() => navigation.navigate('MatchDetail', { requestId: req.id })}>
              <Text style={styles.detailLink}>詳細を見る</Text>
            </TouchableOpacity>
          </View>
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
  item: { padding: 12, backgroundColor: '#eee', borderRadius: 4, marginBottom: 12 },
  name: { fontSize: 16, fontWeight: 'bold' },
  status: { fontSize: 14, color: '#555', marginTop: 4 },
  timeSlot: { fontSize: 14, color: '#555', marginTop: 4 },
  actionButtons: { flexDirection: 'row', marginTop: 8, justifyContent: 'space-around' },
  actionButton: { backgroundColor: '#007bff', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 4 },
  rejectButton: { backgroundColor: '#ff3b30' },
  actionButtonText: { color: '#fff', fontWeight: 'bold' },
  detailLink: { marginTop: 8, color: '#007bff', textDecorationLine: 'underline' },
});
