import { StackNavigationProp } from '@react-navigation/stack';
import { onValue, ref, update } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from 'tamagui';
import { RootStackParamList } from '../navigation/RootNavigator';
import { auth, database } from '../services/firebase';

// リクエストの型
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

// ユーザーの簡易情報
type UserProfile = {
  name: string;
  role: 'guide' | 'traveler';
};

type MatchingListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MatchingList'>;

interface MatchingListScreenProps {
  navigation: MatchingListScreenNavigationProp;
}

const MatchingListScreen: React.FC<MatchingListScreenProps> = ({ navigation }) => {
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'guide' | 'traveler' | null>(null);

  // 全ユーザー情報をマップ形式で保持（ uid -> { name, role, ... } ）
  const [userMap, setUserMap] = useState<{ [uid: string]: UserProfile }>({});

  const uid = auth.currentUser?.uid;

  // ▼ ステータスを日本語に変換する補助関数
  const statusToJapanese = (status: string): string => {
    switch (status) {
      case 'pending':
        return '保留中';
      case 'accepted':
        return '承認済み';
      case 'rejected':
        return '却下';
      default:
        return status;
    }
  };

  // ▼ 全ユーザー情報を取得し、userMapに格納
  useEffect(() => {
    const usersRef = ref(database, 'users');
    const unsubscribeUsers = onValue(usersRef, (snapshot) => {
      const data = snapshot.val() || {};
      // dataは { uid1: { name, role, ... }, uid2: { ... }, ... } の形
      setUserMap(data);
    });
    return () => unsubscribeUsers();
  }, []);

  // ▼ 現在ユーザーの role を取得
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

  // ▼ requests ノードを購読し、自分に関連するリクエストだけを抽出
  useEffect(() => {
    if (!uid) return;
    const requestsRef = ref(database, 'requests');
    const unsubscribeRequests = onValue(requestsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const reqList: RequestData[] = Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
      }));

      // ガイド or 旅行者に関わらず、
      // 自分が touristId もしくは guideId のものを抽出
      const filtered = reqList.filter(
        (r) => r.guideId === uid || r.touristId === uid
      );
      setRequests(filtered);
      setLoading(false);
    });
    return () => unsubscribeRequests();
  }, [uid, userRole]);

  // ▼ ガイドがステータスを更新する処理
  const updateRequestStatus = async (requestId: string, newStatus: string) => {
    try {
      await update(ref(database, `requests/${requestId}`), {
        status: newStatus,
        updatedAt: Date.now(),
      });
      Alert.alert('Success', `リクエストを ${statusToJapanese(newStatus)} に更新しました`);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  // ▼ ローディング中の表示
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // ▼ リクエストが0件の場合
  if (requests.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>該当するリクエストはありません。</Text>
      </View>
    );
  }

  // ▼ カードリストの表示
  return (
    <View style={styles.container}>
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {requests.map((req) => {
          // ガイド視点の場合は旅行者の名前を表示
          // 旅行者視点の場合はガイドの名前を表示
          const counterpartId = userRole === 'guide' ? req.touristId : req.guideId;
          const counterpartName = userMap[counterpartId]?.name || 'ユーザー';

          return (
            <TouchableOpacity
              key={req.id}
              style={styles.card}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('MatchDetail', { requestId: req.id })}
            >
              <Text style={styles.userName}>{counterpartName} さん</Text>
              <Text style={styles.status}>
                ステータス: {statusToJapanese(req.status)}
              </Text>
              <Text style={styles.timeSlot}>
                希望時間帯: {req.timeSlot || '未設定'}
              </Text>

              {/* ガイドの場合 && ステータスが保留中（pending）のときは承認・却下ボタンを表示 */}
              {userRole === 'guide' && req.status === 'pending' && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.acceptButton]}
                    onPress={() => updateRequestStatus(req.id, 'accepted')}
                  >
                    <Text style={styles.actionButtonText}>承認</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => updateRequestStatus(req.id, 'rejected')}
                  >
                    <Text style={styles.actionButtonText}>却下</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* 旅行者の場合 && ステータスが承認済み（accepted）ならチャットボタンを表示 */}
              {userRole === 'traveler' && req.status === 'accepted' && (
                <Button
                  size="$4"
                  theme="blue"
                  style={styles.chatButton}
                  onPress={() => navigation.navigate('Chat', { chatId: req.id })}
                >
                  チャットへ
                </Button>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default MatchingListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9', // 薄いグレー
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 40,
    textAlign: 'center',
    fontSize: 16,
    color: '#555',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,

    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,

    // Android elevation
    elevation: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  status: {
    fontSize: 15,
    color: '#333',
    marginBottom: 4,
  },
  timeSlot: {
    fontSize: 15,
    color: '#333',
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#007bff',
  },
  rejectButton: {
    backgroundColor: '#ff3b30',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  chatButton: {
    marginTop: 8,
    borderRadius: 8,
  },
});
