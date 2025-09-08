import { useState } from "react";
import { View, Text, StyleSheet, StatusBar, Alert } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import Header from "../../components/Header";
import InputField from "../../components/InputField";
import ButtonCustom from "../../components/ButtonCustom";
import { auth } from "../../../../firebase.config";
import { updatePassword } from "firebase/auth";

const ChangePasswordScreen = ({ navigation }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const user = auth.currentUser;

    const handleChangePassword = async () => {
        // validasi input
        if (!newPassword.trim() || !confirmPassword.trim()) {
            setError('Semua field harus diisi');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password minimal 6 karakter');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Konfirmasi password tidak cocok');
        }

        setLoading(true);
        setError('');

        try {
            await updatePassword(user, newPassword);

            setNewPassword('');
            setConfirmPassword('');

            Alert.alert(
                'Sukses!',
                'Password anda berhasil diubah, anda akan logout untuk keamanan',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            auth.signOut();
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'Login' }],
                            });
                        }
                    }
                ]
            );
        } catch (err) {
            console.error('Change password error:', err);

            switch (err.code) {
                case 'auth/weak-password':
                    setError('Password baru terlalu lemah');
                    break;
                case 'auth/requires-recent-login':
                    setError('Sesi login terlalu lama. Silakan login ulang.');
                    break;
                default:
                    setError('Gagal mengubah password. Coba lagi.');
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <StatusBar animated={true} />
                <LinearGradient
                    colors={['#667eea', '#764ba2', '#f093fb']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradient}
                >
                    <Header>
                        <Text style={styles.title}>Ubah Password</Text>
                    </Header>

                    <Text style={styles.subtitle}>
                        Masukkan password baru Anda
                    </Text>
                    <View style={styles.formContainer}>
                        <InputField
                            placeHolder="Password baru"
                            value={newPassword}
                            onChangeText={setNewPassword}
                            secureTextEntry={true}
                        >
                            Password Baru
                        </InputField>

                        <InputField
                            placeHolder="Konfirmasi password baru"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={true}
                        >
                            Konfirmasi Password
                        </InputField>

                        {error ? <Text style={styles.error}>{error}</Text> : null}

                        <ButtonCustom
                            title="Ubah Password"
                            onPress={handleChangePassword}
                            loading={loading}
                            loadingText="Mengubah Password"
                        />
                    </View>
                </LinearGradient>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#667eea',
    },
    gradient: {
        flex: 1,
        paddingHorizontal: 20,
        justifyContent: 'flex-start',
    },
    title: {
        fontSize: 32,
        color: '#FFFFFF',
        fontWeight: 'bold',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    subtitle: {
        color: '#fff',
        marginTop: 8,
        marginBottom: 16,
        textAlign: 'center',
        fontSize: 16,
    },
    formContainer: {
        backgroundColor: '#ffffff',
        flex: 0.6,
        marginVertical: 18,
        marginBottom: 30,
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 20,
        gap: 15,
    },
    error: {
        color: '#dc3545',
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '500',
    },
});

export default ChangePasswordScreen;