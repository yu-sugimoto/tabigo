// screens/MatchingListScreen.tsx
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../navigation/RootNavigator';

type MatchingListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MatchingList'>;

type Props = {
  navigation: MatchingListScreenNavigationProp;
};

const MatchingListScreen: React.FC<Props> = ({ navigation }) => {
  // 仮のマッチデータ
  const matches = [
    { id: '1', name: 'ガイドA', status: 'pending' },
    { id: '2', name: 'ガイドB', status: 'accepted' },
    { id: '3', name: 'ガイドC', status: 'rejected' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>マッチ一覧</Text>
      <ScrollView style={styles.list}>
        {matches.map((match) => (
          <TouchableOpacity
            key={match.id}
            style={styles.item}
            onPress={() => navigation.navigate('MatchDetail')}
          >
            <Text style={styles.name}>{match.name}</Text>
            <Text style={styles.status}>{match.status}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default MatchingListScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, marginBottom: 16 },
  list: { flex: 1 },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#eee',
    borderRadius: 4,
  },
  name: { fontSize: 16, fontWeight: 'bold' },
  status: { fontSize: 14, color: '#555' },
});
