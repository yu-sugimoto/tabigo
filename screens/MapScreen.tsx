// screens/MapScreen.tsx
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Polygon } from 'react-native-maps';
import { RootStackParamList } from '../navigation/RootNavigator';

type MapScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Map'>;

type Props = {
  navigation: MapScreenNavigationProp;
};

const MapScreen: React.FC<Props> = ({ navigation }) => {
  // 仮の座標データ
  const polygonCoords = [
    { latitude: 35.681236, longitude: 139.767125 },
    { latitude: 35.685236, longitude: 139.767125 },
    { latitude: 35.685236, longitude: 139.771125 },
    { latitude: 35.681236, longitude: 139.771125 },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* モックとしてのユーザーアイコン、日時など */}
        <Text style={{ fontWeight: 'bold' }}>ユーザー名</Text>
      </View>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 35.681236,
          longitude: 139.767125,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Polygon coordinates={polygonCoords} fillColor="rgba(0,0,255,0.2)" />
      </MapView>
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('MatchingList')}
        >
          <Text style={styles.buttonText}>マッチ一覧</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MapScreen;

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 60,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  map: {
    width: width,
    height: height - 320, // ヘッダー＆フッター分を差し引き
  },
  footer: {
    height: 60,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  button: {
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  buttonText: {
    color: '#fff',
  },
});
