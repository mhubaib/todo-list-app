import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CalenderScreen from '../screens/Task/CalenderScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import TaskNavigator from './TaskNavigator';
import ProfileNavigator from './ProfileNavigator';

const Tab = createBottomTabNavigator();

const getTabBarIcon = (route) => ({ color, size }) => {
    const iconName =
        route.name === 'Tasks'
            ? 'document-text-outline'
            : route.name === 'Calender'
                ? 'calendar-outline'
                : route.name === 'Profile'
                    ? 'person-outline'
                    : 'settings-outline';

    return <Ionicons name={iconName} size={24} color={color} />;
};

const MainTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: getTabBarIcon(route),
                tabBarActiveTintColor: '#007bff',
                tabBarInactiveTintColor: 'gray',
            })}
        >
            <Tab.Screen name="Tasks" component={TaskNavigator} options={{ headerShown: false }} />
            <Tab.Screen name="Calender" component={CalenderScreen} options={{ headerShown: false }} />
            <Tab.Screen name="Profile" component={ProfileNavigator} options={{ headerShown: false }} />
        </Tab.Navigator>
    );
};


export default MainTabNavigator;
