import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#757575',
      }}
    >
      <Tabs.Screen
        name="plan"
        options={{ title: t('tabs.plan') }}
      />
      <Tabs.Screen
        name="recipes"
        options={{ title: t('tabs.recipes') }}
      />
      <Tabs.Screen
        name="shopping"
        options={{ title: t('tabs.shopping') }}
      />
      <Tabs.Screen
        name="family"
        options={{ title: t('tabs.family') }}
      />
    </Tabs>
  );
}
