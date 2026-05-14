/**
 * @file MainNavigator.tsx
 * @desc Navigator chính dạng Bottom Tab — quản lý chuyển đổi giữa các màn hình
 *       Home, Menu, Orders và Account với icon animated và style coffee.
 * @layer navigation
 */

import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Coffee, Package, User, Home, ShoppingBag, Menu } from 'lucide-react-native';
import { COLORS, FONTS } from '@/styles/theme';
import { useTranslation } from 'react-i18next';
import { useCart } from '@/context/CartContext';

import HomeScreen    from '@/pages/home/HomeScreen';
import MenuScreen    from '@/pages/menu/MenuScreen';
import OrderScreen   from '@/pages/orders/OrderScreen';
import AccountScreen from '@/pages/account/Account/AccountScreen';
import CartScreen    from '@/pages/cart/CartScreen'; // Add CartScreen

const Tab = createBottomTabNavigator();

const TabIcon = ({ focused, icon: Icon, label, badgeCount }: { focused: boolean, icon: any, label: string, badgeCount?: number }) => {
  const color = focused ? '#F97316' : '#9CA3AF';
  return (
    <View style={[s.tabItem, focused && s.tabItemActive]}>
      {focused && <View style={s.topIndicator} />}
      <View style={[s.iconWrap, focused && s.iconWrapActive]}>
        <Icon size={20} color={color} strokeWidth={focused ? 2.5 : 1.5} />
        {badgeCount !== undefined && badgeCount > 0 && (
          <View style={s.badge}>
            <Text style={s.badgeText}>{badgeCount}</Text>
          </View>
        )}
      </View>
      <Text style={[s.tabLabel, focused && s.tabLabelActive]} numberOfLines={1}>{label}</Text>
    </View>
  );
};

const MainNavigator = () => {
  const { totalItems } = useCart();
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: s.tabBar,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={Home} label={t('home') || "Trang chủ"} />,
        }}
      />
      <Tab.Screen
        name="MenuTab"
        component={MenuScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={ShoppingBag} label={t('order_menu') || "Đặt hàng"} />,
        }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrderScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={Package} label={t('orders') || "Đơn hàng"} />,
        }}
      />
      <Tab.Screen
        name="AccountTab"
        component={AccountScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={User} label={t('profile') || "Hồ sơ"} />,
        }}
      />
    </Tab.Navigator>
  );
};

const s = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.white,
    height: Platform.OS === 'ios' ? 92 : 75,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    paddingBottom: Platform.OS === 'ios' ? 30 : 15,
    paddingTop: 0,
  },
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
    backgroundColor: '#F97316',
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
  iconWrapActive: {
    backgroundColor: '#FFF7ED',
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: FONTS.medium,
    color: '#9CA3AF',
    textAlign: 'center',
    width: '100%',
  },
  tabLabelActive: {
    color: '#F97316',
    fontFamily: FONTS.bold,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#F97316',
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  badgeText: {
    color: COLORS.white,
    fontFamily: FONTS.bold,
    fontSize: 7,
  }
});

export default MainNavigator;
