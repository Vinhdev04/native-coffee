/**
 * @file MainNavigator.tsx
 * @desc Navigator chính dạng Bottom Tab — dark/light mode, responsive height.
 */

import React from 'react';
import { View, Text, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Package, User, Home, ShoppingBag } from 'lucide-react-native';
import { FONTS } from '@/styles/theme';
import { useTranslation } from 'react-i18next';
import { useCart } from '@/context/CartContext';
import { useTheme, getThemeColors } from '@/context/ThemeContext';

import HomeScreen    from '@/pages/home/screens/HomeScreen';
import MenuScreen    from '@/pages/menu/screens/MenuScreen';
import OrderScreen   from '@/pages/orders/screens/OrderScreen';
import AccountScreen from '@/pages/account/screens/AccountScreen';

const Tab = createBottomTabNavigator();

const TabIcon = ({
  focused, icon: Icon, label, badgeCount, colors,
}: {
  focused: boolean;
  icon: any;
  label: string;
  badgeCount?: number;
  colors: ReturnType<typeof getThemeColors>;
}) => {
  const color = focused ? colors.tabActive : colors.tabInactive;
  return (
    <View style={[tabItemStyle.tabItem, focused && tabItemStyle.tabItemActive]}>
      {focused && <View style={tabItemStyle.topIndicator} />}
      <View style={[tabItemStyle.iconWrap, focused && { backgroundColor: colors.tabIconActiveBg }]}>
        <Icon size={20} color={color} strokeWidth={focused ? 2.5 : 1.5} />
        {badgeCount !== undefined && badgeCount > 0 && (
          <View style={tabItemStyle.badge}>
            <Text style={tabItemStyle.badgeText}>{badgeCount > 9 ? '9+' : badgeCount}</Text>
          </View>
        )}
      </View>
      <Text
        style={[tabItemStyle.tabLabel, { color }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
};

const MainNavigator = () => {
  const { totalItems } = useCart();
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);
  const { height } = useWindowDimensions();

  // Responsive tab bar height
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
          backgroundColor: colors.tabBar,
          height: TAB_HEIGHT,
          borderTopWidth: 1,
          borderTopColor: colors.tabBorder,
          elevation: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: isDark ? 0.3 : 0.05,
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
            <TabIcon focused={focused} icon={Home} label={t('home')} colors={colors} />,
        }}
      />
      <Tab.Screen
        name="MenuTab"
        component={MenuScreen}
        options={{
          tabBarIcon: ({ focused }) =>
            <TabIcon focused={focused} icon={ShoppingBag} label={t('menu.title')} colors={colors} />,
        }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrderScreen}
        options={{
          tabBarIcon: ({ focused }) =>
            <TabIcon focused={focused} icon={Package} label={t('orders.title')} colors={colors} />,
        }}
      />
      <Tab.Screen
        name="AccountTab"
        component={AccountScreen}
        options={{
          tabBarIcon: ({ focused }) =>
            <TabIcon focused={focused} icon={User} label={t('profile')} colors={colors} />,
        }}
      />
    </Tab.Navigator>
  );
};

// Static styles that don't change with theme
const tabItemStyle = StyleSheet.create({
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    paddingHorizontal: 2,
  },
  tabItemActive: {},
  topIndicator: {
    position: 'absolute',
    top: -1,
    width: 32,
    height: 3,
    backgroundColor: '#FF7A00',
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 1,
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: FONTS.medium,
    textAlign: 'center',
    width: '100%',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF7A00',
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontFamily: FONTS.bold,
    fontSize: 7,
  },
});

export default MainNavigator;
