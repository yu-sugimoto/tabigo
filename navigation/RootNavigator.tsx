// navigation/RootNavigator.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { auth } from '../services/firebase';

import ChatScreen from '../screens/ChatScreen';
import LoginScreen from '../screens/LoginScreen';
import MapScreen from '../screens/MapScreen';
import MatchDetailScreen from '../screens/MatchDetailScreen';
import MatchingListScreen from '../screens/MatchingListScreen';
import SignUpScreen from '../screens/SignUpScreen';

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Map: undefined;
  MatchingList: undefined;
  MatchDetail: undefined;
  Chat: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

// 未認証用スタック
const AuthStack: React.FC = () => (
  <Stack.Navigator>
    <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
    <Stack.Screen name="SignUp" component={SignUpScreen} options={{ title: '新規登録' }} />
  </Stack.Navigator>
);

// 認証済み用スタック
const AppStack: React.FC = () => (
  <Stack.Navigator>
    <Stack.Screen name="Map" component={MapScreen} options={{ title: 'マップ' }} />
    <Stack.Screen name="MatchingList" component={MatchingListScreen} options={{ title: 'マッチ一覧' }} />
    <Stack.Screen name="MatchDetail" component={MatchDetailScreen} options={{ title: 'マッチ詳細' }} />
    <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'チャット' }} />
  </Stack.Navigator>
);

const RootNavigator: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (initializing) setInitializing(false);
    });
    return unsubscribe;
  }, [initializing]);

  // 初期化中はスプラッシュ画面などを表示する
  if (initializing) return null;

  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default RootNavigator;
