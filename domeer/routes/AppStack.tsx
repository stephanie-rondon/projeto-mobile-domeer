import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { StyleSheet } from 'react-native';

import HomeScreen from "../app/(tabs)/dashboard/index";
import MesScreen from "../app/(tabs)/dashboard/mes/index";
import UserScreen from "../app/(tabs)/dashboard/usuario/index";
import LoginScreen from "../app/(tabs)/login/LoginScreen";

const Stack = createStackNavigator();

const AppStack = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="User" component={UserScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Mes" component={MesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppStack;

const styles = StyleSheet.create({});
