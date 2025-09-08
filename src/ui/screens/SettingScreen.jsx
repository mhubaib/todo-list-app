import { View, Text, StyleSheet, Button } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../../../firebase.config';

const SettingScreen = ({ navigation }) => {
    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigation.replace('Login');
        } catch (error) {
            console.error('Logout failed: ', error.message);
        }
    };
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Selamat Datang di Halaman Settings</Text>
            <Button title="Logout" onPress={handleLogout} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        wiidth: '100%',
    },
    text: {
        fontSize: 16,
        fontWeight: '300',
    },
});

export default SettingScreen;
