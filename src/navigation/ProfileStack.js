import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../screens/profile/ProfileScreen.js';
import EditProfileScreen from '../screens/profile/EditProfileScreen.js';
import GradeListScreen from '../screens/profile/GradeListScreen.js';
import GradeDetailScreen from '../screens/profile/GradeDetailScreen.js';
import ROUTES from './routes.js';
import colors from '../theme/colors.js';

const Stack = createNativeStackNavigator();

export default function ProfileStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primaryDark },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold' },
        headerBackTitle: 'Quay lại',
      }}>
      <Stack.Screen
        name={ROUTES.PROFILE.MAIN}
        component={ProfileScreen}
        options={{ title: 'Hồ sơ sinh viên' }}
      />
      <Stack.Screen
        name={ROUTES.PROFILE.EDIT}
        component={EditProfileScreen}
        options={{ title: 'Chỉnh sửa thông tin' }}
      />
      <Stack.Screen
        name={ROUTES.PROFILE.GRADE_LIST}
        component={GradeListScreen}
        options={{ title: 'Kết quả học tập' }}
      />
      <Stack.Screen
        name={ROUTES.PROFILE.GRADE_DETAIL}
        component={GradeDetailScreen}
        options={{ title: 'Chi tiết điểm môn học' }}
      />
    </Stack.Navigator>
  );
}
