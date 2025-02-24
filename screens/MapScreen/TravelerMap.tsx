// screens/MapScreen/TravelerMap.tsx
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { User } from '@tamagui/lucide-icons';
import { onValue, ref } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import MapView, { Marker, Polygon } from 'react-native-maps';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { database } from '../../services/firebase';

type Coordinate = {
  latitude: number;
  longitude: number;
};

type ExtendedGuideProfile = {
  id: string,
  name: string;
  role: string;
  guideMode: boolean;
  location?: Coordinate;
  polygon?: Coordinate[];
  profileImageUrl?: string;
};

const computeCentroid = (coords: Coordinate[]): Coordinate => {
  if (coords.length === 0) {
    return { latitude: 0, longitude: 0 };
  }
  const total = coords.reduce(
    (acc, cur) => ({
      latitude: acc.latitude + Number(cur.latitude),
      longitude: acc.longitude + Number(cur.longitude),
    }),
    { latitude: 0, longitude: 0 }
  );
  const count = coords.length;
  return { latitude: total.latitude / count, longitude: total.longitude / count };
};

type NavigationProp = StackNavigationProp<RootStackParamList, 'Map'>;

const TravelerMap: React.FC = () => {
  const [guides, setGuides] = useState<ExtendedGuideProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    const usersRef = ref(database, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      const guideList: ExtendedGuideProfile[] = [];
      if (data) {
        Object.keys(data).forEach((uid) => {
          const user = data[uid];
          if (user.role === 'guide' && user.guideMode === true) {
            if (
              user.location &&
              typeof user.location.latitude === 'number' &&
              typeof user.location.longitude === 'number'
            ) {
              guideList.push({
                id: uid,
                name: user.name,
                role: user.role,
                guideMode: user.guideMode,
                location: {
                  latitude: user.location.latitude,
                  longitude: user.location.longitude,
                },
                polygon: user.polygon,
                profileImageUrl: user.profileImageUrl || '',
              });
            } else if (
              user.polygon &&
              Array.isArray(user.polygon) &&
              user.polygon.length >= 3
            ) {
              const centroid = computeCentroid(user.polygon);
              guideList.push({
                id: uid,
                name: user.name,
                role: user.role,
                guideMode: user.guideMode,
                location: centroid,
                polygon: user.polygon,
                profileImageUrl: user.profileImageUrl || '',
              });
            }
          }
        });
      }
      setGuides(guideList);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: 35.0036069,
        longitude: 135.75871630683565,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
    >
      {guides.map((guide, index) => (
        <React.Fragment key={index}>
          {guide.polygon && guide.polygon.length >= 3 && (
            <Polygon
              coordinates={guide.polygon}
              fillColor="rgba(0,0,255,0.2)"
              strokeColor="rgba(0,0,255,0.8)"
              strokeWidth={2}
            />
          )}
          {guide.location && (
            <Marker
              coordinate={{
                latitude: guide.location.latitude,
                longitude: guide.location.longitude,
              }}
              // タップでリクエスト画面に遷移
              onPress={() => navigation.navigate('CreateMatchingRequest', { guideId: guide.id })}
              title={guide.name}
            >
              {guide.profileImageUrl ? (
                <Image source={{ uri: guide.profileImageUrl }} style={styles.profileMarker} />
              ) : (
                // アイコン未設定の場合、スタイリングしたプレースホルダーを表示
                <View style={styles.placeholderContainer}>
                  <User size={48} color="#ccc" />
                </View>
              )}
            </Marker>
          )}
        </React.Fragment>
      ))}
    </MapView>
  );
};

export default TravelerMap;

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileMarker: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  placeholderContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
