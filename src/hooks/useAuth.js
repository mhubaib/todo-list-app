import { Alert } from 'react-native';
import { signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth, db } from '../../firebase.config';
import { setDoc, doc } from 'firebase/firestore'

export function useAuth({ navigation, setIsSubmitting, setName, setEmail, setPassword, setError, name, email, password, setLoading, user, destination }) {
    const handleLogout = async () => {
        try {
            Alert.alert('Logout', 'Apakah anda yakin ingin logout?', [
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await signOut(auth);
                        navigation.replace('Login');
                    }
                },
                {
                    text: 'Batal',
                    style: 'cancel',
                }
            ])
        } catch (error) {
            console.error('Logout failed: ', error.message);
        }
    }

    const handleLogin = async () => {
        setIsSubmitting(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigation.replace('Task');
        } catch (error) {
            setError(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRegister = async () => {
        setIsSubmitting(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const account = userCredential.user;

            await setDoc(doc(db, 'users', account.uid), {
                uid: account.uid,
                name: name,
                email: email,
                createdAt: new Date(),
            });

            setName('');
            setEmail('');
            setPassword('');
            setError('');

            navigation.replace('Task');
        } catch (err) {
            if (err.code === 'auth/email-already-in-use') {
                setError('Email sudah terdaftar, silakan gunakan email lain.');
            } else {
                setError(err.message);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVerify = async () => {
        if (!user?.email) {
            setError('User tidak valid');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const cred = EmailAuthProvider.credential(user.email, password);
            await reauthenticateWithCredential(user, cred);
            navigation.replace(destination);
        } catch (e) {
            console.log('Verification error:', e);
            if (e.code === 'auth/wrong-password') {
                setError('Password salah. Silakan coba lagi.');
            } else if (e.code === 'auth/too-many-requests') {
                setError('Terlalu banyak perobaan. Coba lagi nanti')
            } else {
                setError('Verifikasi gagal. Periksa password anda')
            }
        } finally {
            setLoading(false);
        }
    };


    return { handleLogout, handleLogin, handleRegister, handleVerify }
}