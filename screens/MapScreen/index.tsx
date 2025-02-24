// screens/MapScreen/index.tsx
import { StackNavigationProp } from '@react-navigation/stack';
import { Settings, User } from '@tamagui/lucide-icons';
import React from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Separator, SizableText, Tabs, TabsContentProps } from 'tamagui';
import { RootStackParamList } from '../../navigation/RootNavigator';
import GuideMap from './GuideMap';
import ReviewSheet from './ReviewSheet';
import TravelerMap from './TravelerMap';

type MapScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Map'>;

type Props = {
  navigation: MapScreenNavigationProp;
};

const { width } = Dimensions.get('window');

const MapScreen: React.FC<Props> = ({ navigation }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <Tabs
        defaultValue="tab1"
        orientation="horizontal"
        flexDirection="column"
        style={styles.tabs}
      >
        {/* タブの切り替え */}
        <Tabs.List
          separator={<Separator vertical />}
          disablePassBorderRadius="bottom"
          aria-label="Map tabs"
          style={styles.tabsList}
        >
          <Tabs.Tab
            focusStyle={{ backgroundColor: '$color3' }}
            flex={1}
            value="tab1"
          >
            <SizableText fontFamily="$body">旅行者</SizableText>
          </Tabs.Tab>
          <Tabs.Tab
            focusStyle={{ backgroundColor: '$color3' }}
            flex={1}
            value="tab2"
          >
            <SizableText fontFamily="$body">ガイド</SizableText>
          </Tabs.Tab>
        </Tabs.List>
        <Separator />

        {/* 旅行者タブ */}
        <TabsContent value="tab1">
          <TravelerMap />
        </TabsContent>

        {/* ガイドタブ */}
        <TabsContent value="tab2">
          <GuideMap />
        </TabsContent>
      </Tabs>

      {/* 下部中央の「マッチ一覧」ボタン */}
      <Button
        style={styles.matchListButton}
        themeInverse
        fontWeight="bold"
        onPress={() => navigation.navigate('MatchingList')}
      >
        マッチ一覧
      </Button>

      {/* 右上のプロフィールアイコンボタン */}
      <Button
        style={styles.profileButton}
        themeInverse
        onPress={() => navigation.navigate('Profile')}
      >
        <User size={20} color="#fff" />
      </Button>

      {/* 左上の設定アイコンボタン */}
      <Button
        style={styles.settingsButton}
        themeInverse
        onPress={() => navigation.navigate('Settings')}
      >
        <Settings size={20} color="#fff" />
      </Button>

      {/* 下部右側の「open review」ボタン */}
      <Button
        style={styles.reviewButton}
        themeInverse
        fontWeight="bold"
        onPress={() => setOpen(!open)}
      >
        open review
      </Button>

      <ReviewSheet open={open} setOpen={setOpen} />
    </SafeAreaView>
  );
};

export default MapScreen;

/** TabsContent コンポーネント */
const TabsContent = (props: TabsContentProps) => {
  return (
    <Tabs.Content
      backgroundColor="$background"
      alignItems="center"
      justifyContent="center"
      flex={1}
      borderColor="$background"
      borderRadius="$2"
      borderTopLeftRadius={0}
      borderTopRightRadius={0}
      borderWidth="$2"
      {...props}
    >
      {props.children}
    </Tabs.Content>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabs: {
    width: '100%',
    height: '100%',
  },
  tabsList: {
    width: '100%',
    backgroundColor: '#fff',
  },
  matchListButton: {
    position: 'absolute',
    bottom: 32,
    right: 16,
  },
  profileButton: {
    position: 'absolute',
    top: 120, // ステータスバーやノッチを避けるために少し下げる
    right: 16,
    width: 48, // ボタンの幅を固定（アイコンに合わせる）
    height: 48, // ボタンの高さを固定
    borderRadius: 24, // 丸いボタン風にする
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsButton: {
    position: 'absolute',
    top: 120, // 右上のプロフィールボタンと同じ高さにする場合、または適宜調整
    left: 16,
    width: 48,
    height: 48,
    backgroundColor: '#000',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  reviewButton: {
    position: 'absolute',
    bottom: 100,
    right: 16,
  },
});
