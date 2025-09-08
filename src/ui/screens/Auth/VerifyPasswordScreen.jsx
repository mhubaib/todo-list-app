import { useState } from "react";
import { Text, StyleSheet, StatusBar, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import Header from "../../components/Header";
import InputField from "../../components/InputField";
import ButtonCustom from "../../components/ButtonCustom";
import { auth } from "../../../../firebase.config";
import { useAuth } from "../../../hooks/useAuth";

const VerifyPasswordScreen = ({ navigation, route }) => {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const user = auth.currentUser;
    const destination = route.params?.destination || 'EditProfile'
    const { handleVerify } = useAuth({ user, setError, setLoading, navigation, password, destination })

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <StatusBar animated={true} />
                <LinearGradient colors={['#667eea', '#764ba2', '#f093fb']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
                    <Header>
                        <Text style={styles.title}>Verifikasi</Text>
                    </Header>
                    <Text style={styles.subtitle}>Masukkan password untuk melanjutkan</Text>
                    <View style={styles.container2} >
                        <InputField placeHolder="********" value={password} onChangeText={setPassword} secureTextEntry={true}>Password</InputField>
                        {error ? <Text style={styles.error}>{error}</Text> : null}
                        <ButtonCustom title="Verifikasi" onPress={handleVerify} loading={loading} loadingText="Verifying" />
                    </View>
                </LinearGradient>
            </SafeAreaView>
        </SafeAreaProvider>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#667eea' },
    container2: { backgroundColor: '#ffffff', flex: 0.4, marginVertical: 18, marginBottom: 30, borderRadius: 20, paddingHorizontal: 20, paddingVertical: 20, gap: 10 },
    gradient: { flex: 1, paddingHorizontal: 20, justifyContent: 'flex-start' },
    title: { fontSize: 32, color: '#FFFFFF', fontWeight: 'bold', textShadowColor: 'rgba(0, 0, 0, 0.3)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
    subtitle: { color: '#fff', marginTop: 8, marginBottom: 16, textAlign: 'center' },
    error: { color: 'red' },
});
export default VerifyPasswordScreen;