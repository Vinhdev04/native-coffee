/**
 * @file RootNavigator.tsx
 * @desc Navigator gốc — bao AuthProvider + CartProvider + NavigationContainer,
 *       điều hướng Login ↔ Main theo trạng thái xác thực.
 * @layer navigation
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { View, ActivityIndicator, StatusBar } from 'react-native';

import LoginScreen       from '@/pages/auth/LoginScreen';
import RegisterScreen    from '@/pages/auth/RegisterScreen';
import ProductDetailScreen from '@/pages/menu/ProductDetailScreen';
import CartScreen          from '@/pages/cart/CartScreen';
import MainNavigator     from '@/navigation/MainNavigator';
import { useAuth, AuthProvider } from '@/context/AuthContext';
import { CartProvider }          from '@/context/CartContext';
import { Colors }                from '@/constants/Colors';
import Toast                     from 'react-native-toast-message';

const Stack = createStackNavigator();

const NavigationContent = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} translucent={false} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainNavigator} />
            <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
            <Stack.Screen name="Cart" component={CartScreen} />
          </>
        )}
      </Stack.Navigator>
      <Toast keyboardOffset={100} />
    </>
  );
};

const RootNavigator = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <NavigationContainer>
          <NavigationContent />
        </NavigationContainer>
      </CartProvider>
    </AuthProvider>
  );
};

export default RootNavigator;
