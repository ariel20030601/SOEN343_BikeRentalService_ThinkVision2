import { Tabs } from 'expo-router';

import Ionicons from '@expo/vector-icons/Ionicons';


export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#F15A29',
        tabBarInactiveTintColor: '#9A9A9A',
        headerStyle: {
          backgroundColor: '#25292e',
        },
        headerShadowVisible: false,
        headerTintColor: '#fff',
        tabBarStyle: {
          backgroundColor: '#F9F6F1',
        },
        tabBarShowLabel: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="pricing"
        options={{
          title: 'Pricing',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "pricetag-sharp" : "pricetag-outline"} color={color} size={24}/>
          ),
        }}
      />
      <Tabs.Screen
        name="billing"
        options={{
          title: 'Billing',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'card-sharp' : 'card-outline'} color={color} size={24}/>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'receipt-sharp' : 'receipt-outline'} color={color} size={24}/>
          ),
        }}
      />
      <Tabs.Screen
        name="redirectMap"
        options={{
          title: 'Map',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'map-sharp' : 'map-outline'} color={color} size={24}/>
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          href: null, 
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="login"
        options={{
          href: null, 
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="signup"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="qr_scanner"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="bikeReserve"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="operatorMap"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="riderMap"
        options={{
          href: null,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
