import React from 'react';
import { View, Text, LogBox } from 'react-native';
import { useFonts, PatrickHand_400Regular } from '@expo-google-fonts/patrick-hand';
import { HomeScreen } from './src/screens/HomeScreen';
import { globalStyles } from './src/theme/styles';

LogBox.ignoreLogs(['expo-notifications:']);

export default function App() {
  const [fontsLoaded] = useFonts({ PatrickHand_400Regular });

  if (!fontsLoaded) {
    return (
      <View style={[globalStyles.container, {justifyContent: 'center', alignItems: 'center'}]}>
        <Text>Yükleniyor...</Text>
      </View>
    );
  }

  return <HomeScreen />;
}