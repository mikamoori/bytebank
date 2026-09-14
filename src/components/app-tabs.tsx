import { Tabs } from 'expo-router';
import React from 'react';

export default function AppTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // <-- ISTO DESATIVA A BARRA PRETA SUPERIOR
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E2DCFF',
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#7C65C1',
        tabBarInactiveTintColor: '#A1A1AA',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          headerShown: false, // Força a remoção na tela principal também
        }}
      />
      {/* Caso existam outras abas, como explore */}
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explorar',
          headerShown: false,
        }}
      />
    </Tabs>
  );
}