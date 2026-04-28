import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Coffee, ClipboardList, User, Home } from 'lucide-react-native';
import { COLORS, FONTS } from '~/styles/theme';
import { useTranslation } from 'react-i18next';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

import HomeScreen    from '~/pages/home/HomeScreen';
import MenuScreen    from '~/pages/menu/MenuScreen';
import OrderScreen   from '~/pages/orders/OrderScreen';
import AccountScreen from '~/pages/account/AccountScreen';

const Tab = createBottomTabNavigator();

/** Icon tab có animation scale khi active */
const AnimatedTabIcon = ({
  icon: Icon,
  color,
  focused,
}: {
  icon: any;
  color: string;
  focused: boolean;
}) => {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(focused ? 1.2 : 1, { damping: 12, stiffness: 120 }) }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Icon size={24} color={color} />
    </Animated.View>
  );
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
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon icon={Home} color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="MenuTab"
        component={MenuScreen}
        options={{
          tabBarLabel: t('menu.title'),
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon icon={Coffee} color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrderScreen}
        options={{
          tabBarLabel: t('orders.title'),
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon icon={ClipboardList} color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="AccountTab"
        component={AccountScreen}
        options={{
          tabBarLabel: t('account.title'),
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon icon={User} color={color} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
