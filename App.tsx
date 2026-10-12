import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppProvider } from './src/context/AppContext';

// 5 Màn hình chính thuộc Bottom Tab
import HomeScreen from './src/screens/HomeScreen';
import SubjectsScreen from './src/screens/SubjectsScreen';
import ScheduleScreen from './src/screens/ScheduleScreen';
import AssignmentsScreen from './src/screens/AssignmentsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// Các Màn hình chi tiết thuộc Stack Navigation
import SubjectDetailScreen from './src/screens/SubjectDetailScreen';
import ScheduleDetailScreen from './src/screens/ScheduleDetailScreen';
import AssignmentDetailScreen from './src/screens/AssignmentDetailScreen';
import GradeDetailScreen from './src/screens/GradeDetailScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';

// Khởi tạo các Navigator
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Khai báo icon riêng biệt để tránh re-render & thỏa mãn eslint
const HomeIcon = ({ focused }: { focused: boolean }) => (
  <Text style={[styles.tabIcon, focused ? styles.iconActive : styles.iconInactive]}>
    🏠
  </Text>
);

const SubjectsIcon = ({ focused }: { focused: boolean }) => (
  <Text style={[styles.tabIcon, focused ? styles.iconActive : styles.iconInactive]}>
    📚
  </Text>
);

const ScheduleIcon = ({ focused }: { focused: boolean }) => (
  <Text style={[styles.tabIcon, focused ? styles.iconActive : styles.iconInactive]}>
    📅
  </Text>
);

const AssignmentsIcon = ({ focused }: { focused: boolean }) => (
  <Text style={[styles.tabIcon, focused ? styles.iconActive : styles.iconInactive]}>
    📝
  </Text>
);

const ProfileIcon = ({ focused }: { focused: boolean }) => (
  <Text style={[styles.tabIcon, focused ? styles.iconActive : styles.iconInactive]}>
    👤
  </Text>
);

// Cấu hình cây 5 Tab dưới đáy màn hình
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        headerStyle: styles.header,
        headerTintColor: '#FFFFFF',
        headerTitleStyle: styles.headerTitle,
      }}>
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          title: 'Tổng quan',
          tabBarLabel: 'Tổng quan',
          tabBarIcon: HomeIcon,
        }}
      />
      <Tab.Screen
        name="SubjectsTab"
        component={SubjectsScreen}
        options={{
          title: 'Môn học',
          tabBarLabel: 'Môn học',
          tabBarIcon: SubjectsIcon,
        }}
      />
      <Tab.Screen
        name="ScheduleTab"
        component={ScheduleScreen}
        options={{
          title: 'Thời khóa biểu',
          tabBarLabel: 'Lịch học',
          tabBarIcon: ScheduleIcon,
        }}
      />
      <Tab.Screen
        name="AssignmentsTab"
        component={AssignmentsScreen}
        options={{
          title: 'Bài tập',
          tabBarLabel: 'Bài tập',
          tabBarIcon: AssignmentsIcon,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: 'Cá nhân & Kết quả',
          tabBarLabel: 'Cá nhân',
          tabBarIcon: ProfileIcon,
        }}
      />
    </Tab.Navigator>
  );
}

// Cây điều hướng chính (Root Navigation Tree)
export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerStyle: styles.header,
              headerTintColor: '#FFFFFF',
              headerTitleStyle: styles.headerTitle,
              headerBackTitle: 'Quay lại',
            }}>
            {/* Màn hình gốc chứa 5 Tabs (ẩn header của stack vì tab đã có header riêng) */}
            <Stack.Screen
              name="MainTabs"
              component={MainTabs}
              options={{ headerShown: false }}
            />

            {/* Các màn hình chi tiết được mở (Stack push) */}
            <Stack.Screen
              name="SubjectDetail"
              component={SubjectDetailScreen}
              options={{ title: 'Chi tiết môn học' }}
            />
            <Stack.Screen
              name="ScheduleDetail"
              component={ScheduleDetailScreen}
              options={{ title: 'Chi tiết buổi học' }}
            />
            <Stack.Screen
              name="AssignmentDetail"
              component={AssignmentDetailScreen}
              options={{ title: 'Chi tiết bài tập' }}
            />
            <Stack.Screen
              name="GradeDetail"
              component={GradeDetailScreen}
              options={{ title: 'Kết quả học tập' }}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{ title: 'Chỉnh sửa thông tin' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    paddingBottom: 6,
    paddingTop: 6,
    height: 60,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#1E40AF',
  },
  headerTitle: {
    fontWeight: 'bold',
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
});
