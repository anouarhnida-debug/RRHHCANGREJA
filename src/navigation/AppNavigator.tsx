import { Ionicons } from '@expo/vector-icons';
import {
  DefaultTheme,
  useNavigation,
} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { AccountScreen } from '../screens/AccountScreen';
import { ClockHubScreen } from '../screens/ClockHubScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { HoursReportScreen } from '../screens/HoursReportScreen';
import { MessagesScreen } from '../screens/MessagesScreen';
import { PersonalDataScreen } from '../screens/PersonalDataScreen';
import { PlanScreen } from '../screens/PlanScreen';
import { SessionScreen } from '../screens/SessionScreen';
import { ShiftHistoryScreen } from '../screens/ShiftHistoryScreen';
import { VacationRequestScreen } from '../screens/VacationRequestScreen';
import { useProfile } from '../hooks/useProfile';
import { colors, theme } from '../theme';
import { RootStackParamList, RootTabParamList } from '../types/navigation';

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const tabIcons: Record<keyof RootTabParamList, keyof typeof Ionicons.glyphMap> = {
  Inicio: 'home-outline',
  FH: 'finger-print-outline',
  Planificacion: 'calendar-outline',
  Mensajes: 'chatbubble-ellipses-outline',
  Cuenta: 'person-outline',
};

function TabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ color, size }) => (
          <Ionicons color={color} name={tabIcons[route.name]} size={size} />
        ),
      })}
    >
      <Tab.Screen component={HomeScreen} name="Inicio" options={{ title: 'Inicio' }} />
      <Tab.Screen component={ClockHubScreen} name="FH" options={{ title: 'FH' }} />
      <Tab.Screen
        component={PlanScreen}
        name="Planificacion"
        options={{ title: 'Planificación' }}
      />
      <Tab.Screen
        component={MessagesScreen}
        name="Mensajes"
        options={{ title: 'Mensajes' }}
      />
      <Tab.Screen component={AccountScreen} name="Cuenta" options={{ title: 'Cuenta' }} />
    </Tab.Navigator>
  );
}

function LoadingScreen() {
  return (
    <View style={styles.loadingScreen}>
      <ActivityIndicator color={colors.primary} size="large" />
      <Text style={styles.loadingText}>Cargando TurnoApp...</Text>
    </View>
  );
}

function BackButton() {
  const navigation = useNavigation();

  return (
    <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
      <Ionicons color={colors.textPrimary} name="chevron-back" size={20} />
    </Pressable>
  );
}

export const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    border: colors.border,
    primary: colors.primary,
    text: colors.textPrimary,
    notification: colors.primary,
  },
};

export function AppNavigator() {
  const { initialized, session } = useProfile();

  if (!initialized) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.background },
        headerBackVisible: false,
        headerLeft: BackButton,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          color: colors.textPrimary,
          fontSize: theme.typography.heading,
          fontWeight: '600',
        },
      }}
    >
      {session.isLoggedIn ? (
        <>
          <Stack.Screen component={TabsNavigator} name="Tabs" options={{ headerShown: false }} />
          <Stack.Screen
            component={PersonalDataScreen}
            name="PersonalData"
            options={{ title: 'Datos personales' }}
          />
          <Stack.Screen
            component={ShiftHistoryScreen}
            name="ShiftHistory"
            options={{ title: 'Historial de turnos' }}
          />
          <Stack.Screen
            component={VacationRequestScreen}
            name="VacationRequest"
            options={{ title: 'Solicitar vacaciones' }}
          />
          <Stack.Screen
            component={HoursReportScreen}
            name="HoursReport"
            options={{ title: 'Informe de horas' }}
          />
        </>
      ) : (
        <Stack.Screen component={SessionScreen} name="Session" options={{ headerShown: false }} />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    height: 72,
    paddingBottom: 10,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  loadingScreen: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    gap: 12,
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.textPrimary,
    fontSize: theme.typography.body,
  },
  backButton: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    marginRight: 8,
    width: 40,
  },
});
