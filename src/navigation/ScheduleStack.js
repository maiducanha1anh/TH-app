import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ScheduleScreen from '../screens/schedule/ScheduleScreen.js';
import SessionDetailScreen from '../screens/schedule/SessionDetailScreen.js';
import ROUTES from './routes.js';
import colors from '../theme/colors.js';

const Stack = createNativeStackNavigator();

export default function ScheduleStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primaryDark },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold' },
        headerBackTitle: 'Quay lại',
      }}>
      <Stack.Screen
        name={ROUTES.SCHEDULE.MAIN}
        component={ScheduleScreen}
        options={{ title: 'Thời khóa biểu' }}
      />
      <Stack.Screen
        name={ROUTES.SCHEDULE.DETAIL}
        component={SessionDetailScreen}
        options={{ title: 'Chi tiết buổi học' }}
      />
    </Stack.Navigator>
  );
}
