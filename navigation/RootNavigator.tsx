// navigation/RootNavigator.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { auth } from '../services/firebase';

import ChatScreen from '../screens/ChatScreen';
import CreateMatchingRequest from '../screens/CreateMatchingRequest';
import LoginScreen from '../screens/LoginScreen';
import MapScreen from '../screens/MapScreen';
import MatchDetailScreen from '../screens/MatchDetailScreen';
import MatchingListScreen from '../screens/MatchingListScreen';
import ProfileSettingsScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SignUpScreen from '../screens/SignUpScreen';

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Map: undefined;
  MatchingList: undefined;
  MatchDetail: { requestId: string };
  Chat: { chatId: string };
  Profile: undefined;
  Settings: undefined;
  CreateMatchingRequest: { guideId: string };
};

const Stack = createStackNavigator<RootStackParamList>();

const AuthStack: React.FC = () => (
  <Stack.Navigator>
    <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
    <Stack.Screen name="SignUp" component={SignUpScreen} options={{ title: '新規登録' }} />
  </Stack.Navigator>
);

const AppStack: React.FC = () => (
  <Stack.Navigator>
    <Stack.Screen name="Map" component={MapScreen} options={{ headerShown: false }} />
    <Stack.Screen name="MatchingList" component={MatchingListScreen} options={{ title: 'マッチ一覧' }} />
    <Stack.Screen name="MatchDetail" component={MatchDetailScreen} options={{ title: 'マッチ詳細' }} />
    <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'チャット' }} />
    <Stack.Screen name="Profile" component={ProfileSettingsScreen} options={{ title: 'プロフィール設定' }} />
    <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: '設定' }} />
    <Stack.Screen name="CreateMatchingRequest" component={CreateMatchingRequest} options={{ title: 'リクエスト作成' }} />
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

  if (initializing) return null;

  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default RootNavigator;
