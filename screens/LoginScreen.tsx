// screens/LoginScreen.tsx
import { StackNavigationProp } from '@react-navigation/stack';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import React, { useRef, useState } from 'react';
import { Alert } from 'react-native';
import { Button, Input, Paragraph, YStack } from 'tamagui';
import { RootStackParamList } from '../navigation/RootNavigator';
import { auth } from '../services/firebase';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

type Props = {
  navigation: LoginScreenNavigationProp;
};

const formatJapanesePhoneNumber = (number: string): string => {
  const digits = number.replace(/\D/g, '');
  if (digits.startsWith('0')) {
    return '+81' + digits.substring(1);
  }
  return number;
};

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const recaptchaVerifier = useRef<FirebaseRecaptchaVerifierModal>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [verificationId, setVerificationId] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');

  const sendVerificationCode = async () => {
    if (!phoneNumber) {
      Alert.alert('エラー', '電話番号を入力してください');
      return;
    }
    const formattedPhone = formatJapanesePhoneNumber(phoneNumber);
    try {
      const phoneProvider = new PhoneAuthProvider(auth);
      const id = await phoneProvider.verifyPhoneNumber(
        formattedPhone,
        recaptchaVerifier.current!
      );
      setVerificationId(id);
      Alert.alert('確認', 'SMS認証コードを送信しました');
    } catch (error: any) {
      console.error(error);
      Alert.alert('エラー', error.message);
    }
  };

  const confirmCode = async () => {
    if (!verificationId || !verificationCode) {
      Alert.alert('エラー', '認証コードを入力してください');
      return;
    }
    try {
      const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
      await signInWithCredential(auth, credential);
      Alert.alert('成功', 'ログインしました');
    } catch (error: any) {
      console.error(error);
      Alert.alert('エラー', error.message);
    }
  };

  return (
    <YStack f={1} jc="center" p="$4">
      {/* 以下の設定でモーダルを透明かつ最小サイズにして視覚的に隠す */}
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={auth.app.options}
        attemptInvisibleVerification
        style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
      />

      <Paragraph size="$6" ta="center" mb="$4">
        電話番号でログイン
      </Paragraph>

      <Input
        placeholder="例: 09012345678"
        keyboardType="phone-pad"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        marginBottom="$3"
      />

      <Button onPress={sendVerificationCode} marginBottom="$3">
        SMS認証コード送信
      </Button>

      <Input
        placeholder="認証コード"
        keyboardType="number-pad"
        value={verificationCode}
        onChangeText={setVerificationCode}
        marginBottom="$3"
      />

      <Button onPress={confirmCode}>認証コード確認</Button>
    </YStack>
  );
};

export default LoginScreen;
