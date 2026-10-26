import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/home/HomeScreen.js';
import CourseDetailScreen from '../screens/courses/CourseDetailScreen.js';
import AssignmentDetailScreen from '../screens/assignments/AssignmentDetailScreen.js';
import ROUTES from './routes.js';
import colors from '../theme/colors.js';

const Stack = createNativeStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primaryDark },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold' },
        headerBackTitle: 'Quay lại',
      }}>
      <Stack.Screen
        name={ROUTES.HOME.MAIN}
        component={HomeScreen}
        options={{ title: 'Tổng quan học tập' }}
      />
      <Stack.Screen
        name={ROUTES.HOME.COURSE_DETAIL}
        component={CourseDetailScreen}
        options={{ title: 'Chi tiết môn học' }}
      />
      <Stack.Screen
        name={ROUTES.HOME.ASSIGNMENT_DETAIL}
        component={AssignmentDetailScreen}
        options={{ title: 'Chi tiết bài tập' }}
      />
    </Stack.Navigator>
  );
}
