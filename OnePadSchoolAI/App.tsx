import React from 'react';
import { LogBox } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

LogBox.ignoreAllLogs(true);

export default function App() {
  return <AppNavigator />;
}
