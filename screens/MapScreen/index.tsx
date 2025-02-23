// screens/MapScreen.tsx
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { View } from 'react-native';
import { Button, Separator, SizableText, Tabs, TabsContentProps } from 'tamagui';
import { RootStackParamList } from '../../navigation/RootNavigator';
import GuideMap from './GuideMap';
import ReviewSheet from './ReviewSheet';
import TravelerMap from './TravelerMap';

type MapScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Map'>;

type Props = {
  navigation: MapScreenNavigationProp;
};

const MapScreen: React.FC<Props> = ({ navigation }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <View>
      <Tabs
        defaultValue="tab1"
        orientation="horizontal"
        flexDirection="column"
        width={400}
        height={"100%"}
        borderWidth="$0.25"
        overflow="hidden"
        borderColor="$borderColor"
      >
        <Tabs.List
          separator={<Separator vertical />}
          disablePassBorderRadius="bottom"
          aria-label="Manage your account"
        >
          <Tabs.Tab
            focusStyle={{
              backgroundColor: '$color3',
            }}
            flex={1}
            value="tab1"
          >
            <SizableText fontFamily="$body">旅行者</SizableText>
          </Tabs.Tab>
          <Tabs.Tab
            focusStyle={{
              backgroundColor: '$color3',
            }}
            flex={1}
            value="tab2"
          >
            <SizableText fontFamily="$body">ガイド</SizableText>
          </Tabs.Tab>
        </Tabs.List>
        <Separator />
        <TabsContent value="tab1">
          <TravelerMap />
        </TabsContent>

        <TabsContent value="tab2">
          <GuideMap />
        </TabsContent>
      </Tabs>

      <Button
        position='absolute'
        bottom={32}
        right={32}
        themeInverse
        fontWeight={"bold"}
        onPress={() => navigation.navigate('MatchingList')}>マッチ一覧</Button>

      <Button
        position='absolute'
        bottom={100}
        right={32}
        themeInverse
        fontWeight={"bold"}
        onPress={() => setOpen(!open)}>open review</Button>

      <ReviewSheet open={open} setOpen={setOpen} />
    </View>
  );
};

export default MapScreen;

const TabsContent = (props: TabsContentProps) => {
  return (
    <Tabs.Content
      backgroundColor="$background"
      key="tab3"
      padding="$2"
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
  )
}