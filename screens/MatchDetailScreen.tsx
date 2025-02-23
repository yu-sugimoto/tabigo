// screens/MatchDetailScreen.tsx
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { RootStackParamList } from '../navigation/RootNavigator';

type MatchDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MatchDetail'>;

type Props = {
  navigation: MatchDetailScreenNavigationProp;
};

const MatchDetailScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>マッチ詳細</Text>
      <Text style={styles.subtitle}>ガイド名: ガイドA</Text>
      <Text style={styles.subtitle}>ステータス: pending</Text>

      {/* 日時やエリア情報のモック */}
      <View style={{ marginVertical: 16 }}>
        <Text>エリア: 東京駅周辺</Text>
        <Text>日時: 2025/03/01 10:00-15:00</Text>
      </View>

      <Button title="チャットへ" onPress={() => navigation.navigate('Chat')} />
    </View>
  );
};

export default MatchDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, marginBottom: 16 },
  subtitle: { fontSize: 16, marginBottom: 8 },
});
