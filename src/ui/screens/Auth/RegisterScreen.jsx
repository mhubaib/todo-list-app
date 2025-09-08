import { useState, useEffect, use } from 'react';
import { Text, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../../firebase.config';
import InputField from '../../components/InputField';
import ButtonCustom from '../../components/ButtonCustom';
import AuthContainer from '../../containers/AuthContainer';
import { useAuth } from '../../../hooks/useAuth';
import { useStatusBarManager } from '../../../hooks/useStatusBarManager';

const RegisterScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [hidden, setHidden] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { handleRegister } = useAuth({navigation, setIsSubmitting, setError, setEmail, setPassword, setName, name, email, password});
    const { changeStatusBarVisibility } = useStatusBarManager({ setIsStatusBarHidden: setHidden, isStatusBarHidden: hidden });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                navigation.replace('Task');
            }
        });

        return () => unsubscribe();
    }, [navigation]);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                animated={true}
                hidden={hidden}
            />
            <AuthContainer onPress={changeStatusBarVisibility} title="Get Started" text="Please register to your account.">
                <InputField placeHolder="Username..." value={name} onChangeText={setName}>Username</InputField>
                <InputField placeHolder="user@sample.com" value={email} onChangeText={setEmail}>Email</InputField>
                <InputField placeHolder="********" value={password} onChangeText={setPassword} secureTextEntry={true}>Password</InputField>
                {error ? <Text style={styles.error}>{error}</Text> : null}
                <ButtonCustom title="Sign up" onPress={handleRegister} loading={isSubmitting} loadingText='Signing-Up'/>
                <Text style={styles.text2}>
                    Sudah punya akun? <Text onPress={() => navigation.navigate('Login')} style={styles.link}>Sign in</Text>
                </Text>
            </AuthContainer>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#667eea',
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

export default RegisterScreen;
