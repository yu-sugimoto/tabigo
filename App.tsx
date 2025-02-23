// App.tsx
import React from 'react';
import { TamaguiProvider } from 'tamagui';
import RootNavigator from './navigation/RootNavigator';
import appConfig from './tamagui.config';

const App: React.FC = () => {
  return <TamaguiProvider config={appConfig}>
    <RootNavigator />
  </TamaguiProvider>
};

export default App;
