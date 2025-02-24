// screens/SettingsScreen.tsx
import { StackNavigationProp } from '@react-navigation/stack';
import { signOut } from 'firebase/auth';
import React from 'react';
import { Alert, StyleSheet } from 'react-native';
import { Button, Paragraph, YStack } from 'tamagui';
import { RootStackParamList } from '../navigation/RootNavigator';
import { auth } from '../services/firebase';

type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>; // 必要に応じてルート名を変更

type Props = {
  navigation: SettingsScreenNavigationProp;
};

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // ログアウト後はログイン画面へ遷移
      navigation.navigate('Login');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <YStack f={1} p="$6" space>
      <Paragraph size="$6" ta="center" mb="$4">
        設定
      </Paragraph>

      {/* 必要に応じて他の設定項目を追加 */}

      <Button onPress={handleLogout} theme="red" size="$4">
        ログアウト
      </Button>
    </YStack>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
