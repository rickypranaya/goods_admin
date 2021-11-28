import React from 'react';
import {View} from 'react-native'
// import Navigator from './src/components/Navigator';
import ScreenNavigator from './src/screens/ScreenNavigator'
// import library
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <View style={{flex:1}}>
      <ScreenNavigator/>
      <StatusBar style={'dark'} />
    </View>
  );
}

