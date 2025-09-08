import { useEffect, useState } from 'react';
import { Text, StyleSheet, StatusBar, Alert, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Header from '../../components/Header';
import InputField from '../../components/InputField';
import ButtonCustom from '../../components/ButtonCustom';
import { auth, db } from '../../../../firebase.config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateEmail } from 'firebase/auth';

const EditProfileScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');
    const user = auth.currentUser;

    useEffect(() => {
        (async () => {
            try {
                const snap = await getDoc(doc(db, 'users', user.uid));
                if (snap.exists()) {
                    const d = snap.data();
                    setName(d?.name || '');
                    setEmail(d?.email || user.email || '');
                } else {
                    setName(user.displayName || '');
                    setEmail(user.email || '');
                }
            } catch {
                setErr('Gagal memuat profil');
            }
        })();
    }, []);

    const handleSave = async () => {
        if (!name.trim() || !email.trim()) { setErr('Nama wajib diisi'); return; }
        setLoading(true);
        setErr('');
        try {
            // await user.reload();
            // const freshUser = user;

            // if (email !== freshUser.email) {
            //     await updateEmail(freshUser, email); // perlu reauth; sudah dilakukan di langkah sebelumnya
            // }

            await updateDoc(doc(db, 'users', user.uid), { name, email });
            Alert.alert('Sukses', 'Profil berhasil diperbarui', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (e) {
            setErr('Gagal menyimpan. Pastikan email valid dan koneksi stabil.', e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <StatusBar animated={true} />
                <LinearGradient colors={['#667eea', '#764ba2', '#f093fb']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
                    <Header><Text style={styles.title}>Edit Profile</Text></Header>
                    <View style={styles.container2}>
                        <InputField placeHolder="Username..." value={name} onChangeText={setName}>Username</InputField>
                        <InputField placeHolder="user@sample.com" value={email} readOnly>Email</InputField>
                        {err ? <Text style={styles.error}>{err}</Text> : null}
                        <ButtonCustom title="Submit" onPress={handleSave} loading={loading} loadingText="Submitting" />
                    </View>
                </LinearGradient>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#667eea' },
    container2: { backgroundColor: '#ffffff', flex: 0.7, marginVertical: 18, marginBottom: 30, borderRadius: 20, paddingHorizontal: 20, paddingVertical: 20, gap: 10 },
    gradient: { flex: 1, paddingHorizontal: 20, justifyContent: 'flex-start' },
    title: { fontSize: 32, color: '#FFFFFF', fontWeight: 'bold', textShadowColor: 'rgba(0, 0, 0, 0.3)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
    error: { color: 'red', marginTop: 8 },
});

export default EditProfileScreen;