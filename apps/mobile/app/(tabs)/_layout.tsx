import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#6b7280',
        headerStyle: { backgroundColor: '#2563eb' },
        headerTintColor: '#fff',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Plantoes',
          tabBarLabel: 'Plantoes',
        }}
      />
      <Tabs.Screen
        name="documentos"
        options={{
          title: 'Documentos',
          tabBarLabel: 'Documentos',
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notificacoes',
          tabBarLabel: 'Notificacoes',
        }}
      />
    </Tabs>
  );
}
