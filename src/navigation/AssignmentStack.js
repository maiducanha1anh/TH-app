import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AssignmentListScreen from '../screens/assignments/AssignmentListScreen.js';
import AssignmentDetailScreen from '../screens/assignments/AssignmentDetailScreen.js';
import AssignmentFormScreen from '../screens/assignments/AssignmentFormScreen.js';
import ROUTES from './routes.js';
import colors from '../theme/colors.js';

const Stack = createNativeStackNavigator();

export default function AssignmentStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primaryDark },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold' },
        headerBackTitle: 'Quay lại',
      }}>
      <Stack.Screen
        name={ROUTES.ASSIGNMENTS.LIST}
        component={AssignmentListScreen}
        options={{ title: 'Danh sách bài tập' }}
      />
      <Stack.Screen
        name={ROUTES.ASSIGNMENTS.DETAIL}
        component={AssignmentDetailScreen}
        options={{ title: 'Chi tiết bài tập' }}
      />
      <Stack.Screen
        name={ROUTES.ASSIGNMENTS.FORM}
        component={AssignmentFormScreen}
        options={{ title: 'Thêm bài tập mới' }}
      />
    </Stack.Navigator>
  );
}
