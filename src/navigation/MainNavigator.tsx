/**
 * @file MainNavigator.tsx
 * @desc Navigator chính dạng Bottom Tab — quản lý chuyển đổi giữa các màn hình
 *       Home, Menu, Orders và Account với icon animated và style coffee.
 * @layer navigation
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Coffee, ClipboardList, User, Home } from 'lucide-react-native';
import { COLORS, FONTS } from '@/styles/theme';
import { useTranslation } from 'react-i18next';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

import HomeScreen    from '@/pages/home/HomeScreen';
import MenuScreen    from '@/pages/menu/MenuScreen';
import OrderScreen   from '@/pages/orders/OrderScreen';
import AccountScreen from '@/pages/account/AccountScreen';

const Tab = createBottomTabNavigator();

const TabIcon = ({
  icon: Icon,
  color,
}: {
  icon: any;
  color: string;
}) => {
  return <Icon size={24} color={color} />;
};

const MainNavigator = () => {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor:   COLORS.accent,
        tabBarInactiveTintColor: COLORS.gray[400],
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth:  1,
          borderTopColor:  '#F0E0D0',
          height:          85,
          paddingBottom:   25,
          paddingTop:      12,
          elevation:       20,
          shadowColor:     COLORS.primary,
          shadowOffset:    { width: 0, height: -4 },
          shadowOpacity:   0.08,
          shadowRadius:    12,
        },
        tabBarLabelStyle: {
          fontFamily: FONTS.semiBold,
          fontSize:   10,
          marginTop:  4,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Trang chủ',
          tabBarIcon: ({ color }) => (
            <TabIcon icon={Home} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MenuTab"
        component={MenuScreen}
        options={{
          tabBarLabel: t('menu.title'),
          tabBarIcon: ({ color }) => (
            <TabIcon icon={Coffee} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrderScreen}
        options={{
          tabBarLabel: t('orders.title'),
          tabBarIcon: ({ color }) => (
            <TabIcon icon={ClipboardList} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="AccountTab"
        component={AccountScreen}
        options={{
          tabBarLabel: t('account.title'),
          tabBarIcon: ({ color }) => (
            <TabIcon icon={User} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
