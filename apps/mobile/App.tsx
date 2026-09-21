import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { HomeScreen } from './src/screens/HomeScreen';
import { HorseDetailScreen } from './src/screens/HorseDetailScreen';
import type { RootStackParamList } from './src/navigation';
import { theme } from './src/lib/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: theme.green },
          headerTintColor: '#f4f1e6',
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'اسبان' }} />
        <Stack.Screen
          name="HorseDetail"
          component={HorseDetailScreen}
          options={({ route }) => ({ title: route.params.horseName })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
