import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { DiamondIcon } from '../components/JewelryLogo';
import { useAuth } from '../contexts/AuthContext';
import { ClientesScreen } from '../screens/ClientesScreen';
import { HistoricoClienteScreen } from '../screens/HistoricoClienteScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { theme } from '../theme/theme';

export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  HistoricoCliente: { clienteId: number };
};

export type MainTabParamList = {
  ClientesTab: undefined;
  LixeiraTab: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const LixeiraPlaceholderScreen: React.FC = () => (
  <View style={styles.placeholderContainer}>
    <Ionicons name="trash-outline" size={40} color={theme.colors.gold} />
    <Text style={styles.placeholderTitle}>Lixeira</Text>
    <Text style={styles.placeholderSubtitle}>
      Retenção de 10 dias será implementada na Etapa 6.
    </Text>
  </View>
);

const MainTabNavigator: React.FC = () => {
  const { signOut } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerShadowVisible: false,
        headerTitleStyle: {
          ...theme.typography.screenTitle,
          color: theme.colors.primary,
        },
        headerTitleAlign: 'center',
        headerLeft: () => (
          <TouchableOpacity
            onPress={signOut}
            style={styles.logoutButton}
            accessibilityLabel="Sair do aplicativo"
          >
            <Ionicons
              name="log-out-outline"
              size={22}
              color={theme.colors.primary}
            />
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        ),
        headerRight: () => (
          <View style={styles.headerDiamond}>
            <DiamondIcon size={24} color={theme.colors.gold} />
          </View>
        ),
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, size, focused }) => {
          if (route.name === 'ClientesTab') {
            return (
              <Ionicons
                name={focused ? 'people' : 'people-outline'}
                size={size}
                color={color}
              />
            );
          }
          return (
            <Ionicons
              name={focused ? 'trash' : 'trash-outline'}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="ClientesTab"
        component={ClientesScreen}
        options={{ title: 'Clientes' }}
      />
      <Tab.Screen
        name="LixeiraTab"
        component={LixeiraPlaceholderScreen}
        options={{ title: 'Lixeira' }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <View style={styles.loadingScreen}>
        <DiamondIcon size={54} color={theme.colors.gold} />
        <ActivityIndicator
          size="large"
          color={theme.colors.primary}
          style={styles.spinner}
        />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            <Stack.Screen
              name="HistoricoCliente"
              component={HistoricoClienteScreen}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    marginTop: theme.spacing.md,
  },
  placeholderContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  placeholderTitle: {
    ...theme.typography.screenTitle,
    color: theme.colors.primary,
    marginTop: theme.spacing.md,
  },
  placeholderSubtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: theme.spacing.md,
    gap: 4,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  headerDiamond: {
    marginRight: theme.spacing.md,
  },
});