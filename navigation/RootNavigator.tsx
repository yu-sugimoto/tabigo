import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
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

const RootNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SignUp"
          component={SignUpScreen}
          options={{ title: '新規登録' }}
        />
        <Stack.Screen
          name="Map"
          component={MapScreen}
          options={{ title: 'マップ' }}
        />
        <Stack.Screen
          name="MatchingList"
          component={MatchingListScreen}
          options={{ title: 'マッチ一覧' }}
        />
        <Stack.Screen
          name="MatchDetail"
          component={MatchDetailScreen}
          options={{ title: 'マッチ詳細' }}
        />
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={{ title: 'チャット' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
