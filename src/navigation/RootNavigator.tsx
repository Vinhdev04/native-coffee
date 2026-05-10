/**
 * @file RootNavigator.tsx
 * @desc Navigator gốc — bao AuthProvider + CartProvider + NavigationContainer,
 *       điều hướng Login ↔ Main theo trạng thái xác thực.
 *       Thêm: OrderDetailScreen, PaymentScreen.
 * @layer navigation
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { View, ActivityIndicator, StatusBar } from 'react-native';

import LoginScreen          from '@/pages/auth/LoginScreen';
import ForgotPasswordScreen from '@/pages/auth/ForgotPasswordScreen';
import ProductDetailScreen  from '@/pages/menu/ProductDetailScreen';
import CartScreen           from '@/pages/cart/CartScreen';
import OrderDetailScreen    from '@/pages/orders/OrderDetailScreen';
import PaymentScreen        from '@/pages/orders/PaymentScreen';
import ScanQRScreen         from '@/pages/orders/ScanQRScreen';
import AccountInfoScreen    from '@/pages/account/UpdateProfile/UpdateProfileScreen';
import ChangePasswordScreen from '@/pages/account/ChangePassword/ChangePasswordScreen';
import MainNavigator        from '@/navigation/MainNavigator';
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
            <Stack.Screen name="Login"          component={LoginScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main"          component={MainNavigator} />
            <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
            <Stack.Screen name="Cart"          component={CartScreen} />
            <Stack.Screen name="OrderDetail"   component={OrderDetailScreen} />
            <Stack.Screen name="Payment"       component={PaymentScreen} />
            <Stack.Screen name="ScanQR"        component={ScanQRScreen} />
            <Stack.Screen name="UpdateProfile" component={AccountInfoScreen} />
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
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
