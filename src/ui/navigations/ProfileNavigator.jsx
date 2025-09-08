import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import VerifyPasswordScreen from '../screens/Auth/VerifyPasswordScreen';
import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen';

const ProfileStack = createNativeStackNavigator();

const ProfileNavigator = () => {
    return (
        <ProfileStack.Navigator>
            <ProfileStack.Screen name='ProfileHome' component={ProfileScreen} options={{ headerShown: false }} />
            <ProfileStack.Screen name='VerifyPassword' component={VerifyPasswordScreen} options={{ headerShown: false }} />
            <ProfileStack.Screen name='EditProfile' component={EditProfileScreen} options={{ headerShown: false }} />
            <ProfileStack.Screen name='ChangePassword' component={ChangePasswordScreen} options={{ headerShown: false }} />
        </ProfileStack.Navigator>
    )
}

export default ProfileNavigator;