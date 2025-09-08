import { useState } from 'react';
import { Text, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import InputField from '../../components/InputField';
import ButtonCustom from '../../components/ButtonCustom';
import AuthContainer from '../../containers/AuthContainer';
import { useAuth } from '../../../hooks/useAuth';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [hidden, setHidden] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { handleLogin } = useAuth({ navigation, setIsSubmitting, setError, email, password });

    const changeStatusBarVisibility = () => setHidden(!hidden);

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <StatusBar
                    animated={true}
                    hidden={hidden}
                />
                <AuthContainer screen='login' onPress={changeStatusBarVisibility} title="Welcome Back" text="Please login to your account.">
                    <InputField placeHolder="user@sample.com" value={email} onChangeText={setEmail}>Email</InputField>
                    <InputField placeHolder="********" value={password} onChangeText={setPassword} secureTextEntry={true}>Password</InputField>
                    {error ? <Text style={styles.error}>{error}</Text> : null}
                    <ButtonCustom title="Sign in" onPress={handleLogin} loading={isSubmitting} loadingText='Signing-In' />
                    <Text style={styles.text2}>
                        Belum punya akun? <Text onPress={() => navigation.navigate('Register')} style={styles.link}>Sign up</Text>
                    </Text>
                </AuthContainer>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#667eea'
    },
    link: {
        color: '#007BFF',
        fontWeight: 'bold',
    },
    text2: {
        fontSize: 14,
        color: '#666',
        marginTop: 8,
    },
    error: {
        color: 'red',
        marginVertical: 6,
    },
});


export default LoginScreen;

