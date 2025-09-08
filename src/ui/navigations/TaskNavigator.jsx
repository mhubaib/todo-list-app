import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TaskScreen from '../screens/Task/TaskScreen';
import CreateTaskScreen from '../screens/Task/CreateTaskScreen';

const Stack = createNativeStackNavigator();

const TaskNavigator = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen name="BerandaMain" component={TaskScreen} options={{ headerShown: false }} />
            <Stack.Screen name="CreateTaskScreen" component={CreateTaskScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
};

export default TaskNavigator;
