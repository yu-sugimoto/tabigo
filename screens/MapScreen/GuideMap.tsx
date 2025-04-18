// screens/MapScreen/GuideMap.tsx
import { onValue, ref, set } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Polygon } from 'react-native-maps';
import { auth, database } from '../../services/firebase';

type Coordinate = {
  lat: number;
  lng: number;
};

const GuideMap: React.FC = () => {
  const [polygonCoords, setPolygonCoords] = useState<Coordinate[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [guideMode, setGuideMode] = useState<boolean>(false);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      setLoading(false);
      return;
    }
    const userRef = ref(database, `users/${uid}`);
    const unsubscribe = onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.role === 'guide') {
        setPolygonCoords(data.polygon || null);
        setGuideMode(data.guideMode === true);
      } else {
        setPolygonCoords(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // ガイドモードをトグルする関数
  const toggleGuideMode = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const newMode = !guideMode;
    setGuideMode(newMode); // 楽観的更新
    try {
      await set(ref(database, `users/${uid}/guideMode`), newMode);
    } catch (error: any) {
      console.error(error);
      // エラー時は元に戻す
      setGuideMode(!newMode);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* マップを全画面に表示 */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 35.00486693972645,
          longitude: 135.75871630683565,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* ガイドが設定した polygon があれば描画 */}
        {polygonCoords && polygonCoords.length >= 3 && (
          <Polygon
            coordinates={polygonCoords.map((coord) => ({
              latitude: coord.lat,
              longitude: coord.lng,
            }))}
            fillColor="rgba(0,0,255,0.2)"
            strokeColor="rgba(0,0,255,0.8)"
            strokeWidth={2}
          />
        )}
      </MapView>

      {/* ガイドモード トグルボタン (左上) */}
      <TouchableOpacity style={styles.modeToggleButton} onPress={toggleGuideMode}>
        <Text style={styles.modeToggleText}>
          ガイドモード: {guideMode ? 'ON' : 'OFF'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default GuideMap;

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%',
    backgroundColor: 'blue',
  },
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: 'red',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeToggleButton: {
    position: 'absolute',
    top: 16,
    right: 64,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    zIndex: 10, // マップより前面に表示
  },
  modeToggleText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
