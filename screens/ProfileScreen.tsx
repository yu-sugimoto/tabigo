// screens/ProfileSettingsScreen.tsx
import { User } from '@tamagui/lucide-icons';
import * as ImagePicker from 'expo-image-picker';
import { onValue, ref, set } from 'firebase/database';
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, Image, ScrollView, StyleSheet, View } from 'react-native';
import MapView, { MapPressEvent, Marker, Polygon } from 'react-native-maps';
import { Button, Input, Paragraph, XStack, YStack } from 'tamagui';
import { auth, database, storage } from '../services/firebase';

const { height } = Dimensions.get('window');

type Coordinate = {
  latitude: number;
  longitude: number;
};

type Role = 'traveler' | 'guide';

const ProfileSettingsScreen: React.FC = () => {
  // 役割（初期は旅行者）
  const [role, setRole] = useState<Role>('traveler');

  // 共通のプロフィール画像 URL
  const [profileImageUrl, setProfileImageUrl] = useState('');

  // 旅行者用の入力項目
  const [travelerName, setTravelerName] = useState('');
  const [origin, setOrigin] = useState('');
  const [travelerComment, setTravelerComment] = useState('');

  // ガイド用の入力項目
  const [guideName, setGuideName] = useState('');
  const [guideComment, setGuideComment] = useState('');
  // ガイドの場合のポリゴン入力
  const [points, setPoints] = useState<Coordinate[]>([]);

  // Firebase から既存のプロフィールデータを読み込む
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const profileRef = ref(database, `users/${uid}`);
    const unsubscribe = onValue(profileRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        if (data.role === 'traveler') {
          setRole('traveler');
          setTravelerName(data.name || '');
          setOrigin(data.origin || '');
          setProfileImageUrl(data.profileImageUrl || '');
          setTravelerComment(data.comment || '');
        } else if (data.role === 'guide') {
          setRole('guide');
          setGuideName(data.name || '');
          setGuideComment(data.comment || '');
          setProfileImageUrl(data.profileImageUrl || '');
          if (data.polygon) {
            setPoints(data.polygon);
          }
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // ローカル URI を Blob に変換する関数（XMLHttpRequest 使用）
  async function uriToBlob(uri: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function () {
        reject(new Error('Network request failed'));
      };
      xhr.responseType = 'blob';
      xhr.open('GET', uri, true);
      xhr.send(null);
    });
  }

  // 画像アップロード処理（旅行者・ガイド共通）
  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'カメラロールへのアクセス許可が必要です。');
      return;
    }
    // Expo SDK 48以降の場合、assets 配列から URI を取得
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      try {
        const uri = result.assets[0].uri;
        const blob = await uriToBlob(uri);
        const uid = auth.currentUser?.uid;
        if (!uid) return;
        const imgRef = storageRef(storage, `profileImages/${uid}.jpg`);
        await uploadBytes(imgRef, blob);
        const downloadURL = await getDownloadURL(imgRef);
        setProfileImageUrl(downloadURL);
        Alert.alert('Success', 'プロフィール画像が更新されました。');
      } catch (error: any) {
        Alert.alert('Upload Error', error.message);
      }
    }
  };

  // ガイドの場合、マップタップで新しい頂点を追加
  const onMapPress = (e: MapPressEvent) => {
    if (role !== 'guide') return;
    const newCoordinate = e.nativeEvent.coordinate;
    setPoints([...points, newCoordinate]);
  };

  const handleUndo = () => {
    if (points.length > 0) {
      setPoints(points.slice(0, -1));
    }
  };

  const handleClear = () => {
    setPoints([]);
  };

  // 保存処理：Firebase へプロフィール情報を書き込み
  const handleSave = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }
    if (role === 'traveler') {
      if (!travelerName.trim()) {
        Alert.alert('Error', 'お名前を入力してください');
        return;
      }
      const travelerData = {
        name: travelerName,
        role: 'traveler',
        origin,
        profileImageUrl,
        comment: travelerComment,
        updatedAt: Date.now(),
      };
      try {
        await set(ref(database, `users/${uid}`), travelerData);
        Alert.alert('Success', '旅行者プロフィールを保存しました');
      } catch (error: any) {
        Alert.alert('Error', error.message);
      }
    } else {
      if (!guideName.trim()) {
        Alert.alert('Error', 'お名前を入力してください');
        return;
      }
      if (points.length < 3) {
        Alert.alert('Error', '対応可能エリアは3点以上必要です');
        return;
      }
      const guideData = {
        name: guideName,
        role: 'guide',
        profileImageUrl, // 共通のプロフィール画像
        comment: guideComment,
        polygon: points,
        updatedAt: Date.now(),
      };
      try {
        await set(ref(database, `users/${uid}`), guideData);
        Alert.alert('Success', 'ガイドプロフィールを保存しました');
      } catch (error: any) {
        Alert.alert('Error', error.message);
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <YStack f={1} p="$6" space>
        {/* 役割切替ボタン */}
        <XStack space="$3" jc="center">
          <Button onPress={() => setRole('traveler')} themeInverse={role === 'traveler'}>
            旅行者
          </Button>
          <Button onPress={() => setRole('guide')} themeInverse={role === 'guide'}>
            ガイド
          </Button>
        </XStack>

        {/* 画像選択ボタンを一番上に配置 */}
        <Button onPress={handlePickImage} size="$4">
          プロフィール画像を選択
        </Button>
        {profileImageUrl ? (
          <Image source={{ uri: profileImageUrl }} style={styles.profilePreview} />
        ) : (
          <View style={[styles.profilePreview, styles.placeholderContainer]}>
            <User size={48} color="#ccc" />
          </View>
        )}

        {role === 'traveler' ? (
          // 旅行者用フォーム
          <YStack space="$4">
            <Input
              placeholder="お名前"
              value={travelerName}
              onChangeText={setTravelerName}
              size="$4"
              borderWidth={1}
              borderColor="$borderColor"
              borderRadius="$3"
              padding="$3"
            />
            <Input
              placeholder="出身"
              value={origin}
              onChangeText={setOrigin}
              size="$4"
              borderWidth={1}
              borderColor="$borderColor"
              borderRadius="$3"
              padding="$3"
            />
            <Input
              placeholder="コメント"
              value={travelerComment}
              onChangeText={setTravelerComment}
              size="$4"
              borderWidth={1}
              borderColor="$borderColor"
              borderRadius="$3"
              padding="$3"
              multiline
            />
          </YStack>
        ) : (
          // ガイド用フォーム＋マップ
          <YStack space="$4" f={1}>
            <Input
              placeholder="お名前"
              value={guideName}
              onChangeText={setGuideName}
              size="$4"
              borderWidth={1}
              borderColor="$borderColor"
              borderRadius="$3"
              padding="$3"
            />
            <Input
              placeholder="自己紹介・コメント"
              value={guideComment}
              onChangeText={setGuideComment}
              size="$4"
              borderWidth={1}
              borderColor="$borderColor"
              borderRadius="$3"
              padding="$3"
              multiline
            />
            <YStack my="$4" flex={1}>
              <Paragraph size="$5" ta="center" mb="$2">
                対応可能エリアをタップして入力
              </Paragraph>
              <YStack borderRadius="$3" overflow="hidden" height={height * 0.35}>
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: 34.686316,
                    longitude: 135.520649,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                  }}
                  onPress={onMapPress}
                >
                  {points.length >= 3 && (
                    <Polygon
                      coordinates={points}
                      fillColor="rgba(0,0,255,0.2)"
                      strokeColor="rgba(0,0,255,0.8)"
                      strokeWidth={2}
                    />
                  )}
                  {points.map((point, index) => (
                    <Marker key={index} coordinate={point}>
                      <View style={styles.dot} />
                    </Marker>
                  ))}
                </MapView>
              </YStack>
              <XStack justifyContent="space-around" mt="$2">
                <Button onPress={handleUndo} size="$3">
                  戻る
                </Button>
                <Button onPress={handleClear} size="$3">
                  クリア
                </Button>
              </XStack>
            </YStack>
          </YStack>
        )}

        <Button onPress={handleSave} size="$4" style={styles.saveButton} themeInverse>
          保存する
        </Button>
      </YStack>
    </ScrollView>
  );
};

export default ProfileSettingsScreen;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  dot: {
    width: 8,
    height: 8,
    backgroundColor: '#007bff',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#fff',
  },
  profilePreview: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginTop: 8,
    alignSelf: 'center',
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
  },
  saveButton: {
  },
});
