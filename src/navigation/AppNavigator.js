import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeStack from './HomeStack.js';
import CourseStack from './CourseStack.js';
import ScheduleStack from './ScheduleStack.js';
import AssignmentStack from './AssignmentStack.js';
import ProfileStack from './ProfileStack.js';
import ROUTES from './routes.js';
import { useAppData } from '../context/AppDataContext.js';
import colors from '../theme/colors.js';

const Tab = createBottomTabNavigator();

// Khai báo icon riêng biệt để tối ưu render
const HomeIcon = ({ focused }) => (
  <Text style={[styles.tabIcon, focused ? styles.iconActive : styles.iconInactive]}>
    🏠
  </Text>
);

const CourseIcon = ({ focused }) => (
  <Text style={[styles.tabIcon, focused ? styles.iconActive : styles.iconInactive]}>
    📚
  </Text>
);

const ScheduleIcon = ({ focused }) => (
  <Text style={[styles.tabIcon, focused ? styles.iconActive : styles.iconInactive]}>
    📅
  </Text>
);

const AssignmentIcon = ({ focused }) => (
  <Text style={[styles.tabIcon, focused ? styles.iconActive : styles.iconInactive]}>
    📝
  </Text>
);

const ProfileIcon = ({ focused }) => (
  <Text style={[styles.tabIcon, focused ? styles.iconActive : styles.iconInactive]}>
    👤
  </Text>
);

export default function AppNavigator() {
  const { uncompletedAssignmentsCount } = useAppData();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false, // Ẩn header của Tab vì mỗi Stack con đã có Header riêng
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}>
      <Tab.Screen
        name={ROUTES.TABS.HOME}
        component={HomeStack}
        options={{
          tabBarLabel: 'Tổng quan',
          tabBarIcon: HomeIcon,
        }}
      />
      <Tab.Screen
        name={ROUTES.TABS.COURSES}
        component={CourseStack}
        options={{
          tabBarLabel: 'Môn học',
          tabBarIcon: CourseIcon,
        }}
      />
      <Tab.Screen
        name={ROUTES.TABS.SCHEDULE}
        component={ScheduleStack}
        options={{
          tabBarLabel: 'Lịch học',
          tabBarIcon: ScheduleIcon,
        }}
      />
      <Tab.Screen
        name={ROUTES.TABS.ASSIGNMENTS}
        component={AssignmentStack}
        options={{
          tabBarLabel: 'Bài tập',
          tabBarIcon: AssignmentIcon,
          // Badge số bài tập chưa hoàn thành theo mục 4 quy tắc 3
          tabBarBadge:
            uncompletedAssignmentsCount > 0 ? uncompletedAssignmentsCount : undefined,
          tabBarBadgeStyle: styles.badgeStyle,
        }}
      />
      <Tab.Screen
        name={ROUTES.TABS.PROFILE}
        component={ProfileStack}
        options={{
          tabBarLabel: 'Cá nhân',
          tabBarIcon: ProfileIcon,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    paddingBottom: 6,
    paddingTop: 6,
    height: 60,
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  tabIcon: {
    fontSize: 18,
  },
  iconActive: {
    opacity: 1,
  },
  iconInactive: {
    opacity: 0.5,
  },
  badgeStyle: {
    backgroundColor: colors.danger,
    color: colors.textInverse,
    fontSize: 10,
    fontWeight: 'bold',
  },
});
