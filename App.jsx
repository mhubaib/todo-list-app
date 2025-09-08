import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RegisterScreen from './src/ui/screens/Auth/RegisterScreen';
import LoginScreen from './src/ui/screens/Auth/LoginScreen';
import MainTabNavigator from './src/ui/navigations/MainTabNavigator';
import { enableScreens } from 'react-native-screens';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase.config';
import RNBootSplash from 'react-native-bootsplash';
import AnimatedSplash from './src/ui/screens/AnimatedSplash';
import { navigationRef } from './src/utils/navigationRef';

enableScreens();

const Stack = createNativeStackNavigator();

const App = () => {
  const [usr, setUsr] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [showAnimatedSplash, setShowAnimatedSplash] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsr(user);
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  return (
    <>
      <NavigationContainer
        ref={navigationRef}
        onReady={() => {
          RNBootSplash.hide({ fade: true });
        }}
      >
        <Stack.Navigator initialRouteName={usr ? 'Task' : 'Login'}>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false, animation: 'fade', animationDuration: 500 }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false, animation: 'fade', animationDuration: 500 }} />
          <Stack.Screen name="Task" component={MainTabNavigator} options={{ headerShown: false, animation: 'fade', animationDuration: 500 }} />
          <Stack.Screen name="MainTabNavigator" component={MainTabNavigator} />
        </Stack.Navigator>
      </NavigationContainer>

      {showAnimatedSplash && (
        <AnimatedSplash
          appName="Daily App"
          backgroundColor="#667eea"
          onFinish={() => setShowAnimatedSplash(false)}
        />
      )}
    </>
  );
};

export default App;


