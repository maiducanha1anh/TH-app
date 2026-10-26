import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CourseListScreen from '../screens/courses/CourseListScreen.js';
import CourseDetailScreen from '../screens/courses/CourseDetailScreen.js';
import ROUTES from './routes.js';
import colors from '../theme/colors.js';

const Stack = createNativeStackNavigator();

export default function CourseStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primaryDark },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold' },
        headerBackTitle: 'Quay lại',
      }}>
      <Stack.Screen
        name={ROUTES.COURSES.LIST}
        component={CourseListScreen}
        options={{ title: 'Danh sách môn học' }}
      />
      <Stack.Screen
        name={ROUTES.COURSES.DETAIL}
        component={CourseDetailScreen}
        options={{ title: 'Chi tiết môn học' }}
      />
    </Stack.Navigator>
  );
}
