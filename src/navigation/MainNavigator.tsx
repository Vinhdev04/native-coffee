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
  if (focused) {
    return (
      <View style={s.activeTabPill}>
        <Icon size={20} color={COLORS.white} strokeWidth={2.5} />
        <Text style={s.activeTabText}>{label}</Text>
      </View>
    );
  }

  return (
    <View style={s.inactiveTabIcon}>
      <Icon size={24} color="#9CA3AF" strokeWidth={1.5} />
      {badgeCount !== undefined && badgeCount > 0 && (
        <View style={s.badge}>
          <Text style={s.badgeText}>{badgeCount}</Text>
        </View>
      )}
    </View>
  );
};

const MainNavigator = () => {
  const { t } = useTranslation();
  const { totalItems } = useCart();

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
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={Home} label="Sảnh" />,
        }}
      />
      <Tab.Screen
        name="MenuTab"
        component={MenuScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={Menu} label="Thực đơn" />,
        }}
      />
      <Tab.Screen
        name="CartTab"
        component={CartScreen}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('Cart');
          },
        })}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={ShoppingBag} label="Giỏ hàng" badgeCount={totalItems} />,
        }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrderScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={Package} label="Đơn hàng" />,
        }}
      />
      <Tab.Screen
        name="AccountTab"
        component={AccountScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={User} label="Hồ sơ" />,
        }}
      />
    </Tab.Navigator>
  );
};

const s = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 30 : 20,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(28, 21, 16, 0.96)', // Slightly translucent dark capsule
    borderRadius: 40,
    height: 64,
    borderTopWidth: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    paddingHorizontal: 8,
    paddingBottom: 0,
  },
  activeTabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 8,
  },
  activeTabText: {
    color: COLORS.white,
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
  inactiveTabIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 48,
    height: 48,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: COLORS.primary,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1E140A',
  },
  badgeText: {
    color: COLORS.white,
    fontFamily: FONTS.bold,
    fontSize: 9,
  }
});

export default MainNavigator;
