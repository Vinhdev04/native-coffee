/**
 * @file MainNavigator.tsx
 * @desc Navigator chính dạng Bottom Tab — responsive height.
 */

import React from 'react';
import { View, Text, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Package, User, Home, ShoppingBag } from 'lucide-react-native';
import { COLORS, FONTS } from '@/styles/theme';
import { useTranslation } from 'react-i18next';
import { useCart } from '@/context/CartContext';

import HomeScreen    from '@/pages/home/screens/HomeScreen';
import MenuScreen    from '@/pages/menu/screens/MenuScreen';
import OrderScreen   from '@/pages/orders/screens/OrderScreen';
import AccountScreen from '@/pages/account/screens/AccountScreen';

const Tab = createBottomTabNavigator();

const TabIcon = ({
  focused, icon: Icon, label, badgeCount,
}: {
  focused: boolean;
  icon: any;
  label: string;
  badgeCount?: number;
}) => {
  const color = focused ? COLORS.primary : '#9CA3AF';
  return (
    <View style={[s.tabItem, focused && s.tabItemActive]}>
      {focused && <View style={s.topIndicator} />}
      <View style={[s.iconWrap, focused && s.iconWrapActive]}>
        <Icon size={20} color={color} strokeWidth={focused ? 2.5 : 1.5} />
        {badgeCount !== undefined && badgeCount > 0 && (
          <View style={s.badge}>
            <Text style={s.badgeText}>{badgeCount > 9 ? '9+' : badgeCount}</Text>
          </View>
        )}
      </View>
      <Text style={[s.tabLabel, focused && s.tabLabelActive]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
};

const MainNavigator = () => {
  const { totalItems } = useCart();
  const { t } = useTranslation();
  const { height } = useWindowDimensions();

  const isSmallScreen = height < 700;
  const TAB_HEIGHT = Platform.OS === 'ios'
    ? (isSmallScreen ? 72 : 88)
    : (isSmallScreen ? 60 : 72);
  const TAB_PADDING_BOTTOM = Platform.OS === 'ios'
    ? (isSmallScreen ? 16 : 28)
    : (isSmallScreen ? 8 : 14);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          height: TAB_HEIGHT,
          borderTopWidth: 1,
          borderTopColor: '#F3F4F6',
          elevation: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          paddingBottom: TAB_PADDING_BOTTOM,
          paddingTop: 0,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) =>
            <TabIcon focused={focused} icon={Home} label={t('home')} />,
        }}
      />
      <Tab.Screen
        name="MenuTab"
        component={MenuScreen}
        options={{
          tabBarIcon: ({ focused }) =>
            <TabIcon focused={focused} icon={ShoppingBag} label={t('menu.title')} />,
        }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrderScreen}
        options={{
          tabBarIcon: ({ focused }) =>
            <TabIcon focused={focused} icon={Package} label={t('orders.title')} />,
        }}
      />
      <Tab.Screen
        name="AccountTab"
        component={AccountScreen}
        options={{
          tabBarIcon: ({ focused }) =>
            <TabIcon focused={focused} icon={User} label={t('profile')} />,
        }}
      />
    </Tab.Navigator>
  );
};

const s = StyleSheet.create({
  tabItem: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    height: '100%', paddingHorizontal: 2,
  },
  tabItemActive: {},
  topIndicator: {
    position: 'absolute', top: -1, width: 32, height: 3,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 3, borderBottomRightRadius: 3,
  },
  iconWrap: {
    width: 38, height: 38, borderRadius: 19,
    justifyContent: 'center', alignItems: 'center', marginBottom: 1,
  },
  iconWrapActive: { backgroundColor: '#FFF7ED' },
  tabLabel: {
    fontSize: 10, fontFamily: FONTS.medium,
    color: '#9CA3AF', textAlign: 'center', width: '100%',
  },
  tabLabelActive: { color: COLORS.primary, fontFamily: FONTS.bold },
  badge: {
    position: 'absolute', top: 0, right: 0,
    backgroundColor: COLORS.primary,
    minWidth: 14, height: 14, borderRadius: 7,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.white,
  },
  badgeText: { color: COLORS.white, fontFamily: FONTS.bold, fontSize: 7 },
});

export default MainNavigator;
