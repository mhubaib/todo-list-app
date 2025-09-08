import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import Header from '../../components/Header';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../../../firebase.config';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../../../hooks/useAuth';
import { useStatusBarManager } from '../../../hooks/useStatusBarManager';

const ProfileScreen = ({ navigation }) => {
    const [isStatusBarHidden, setIsStatusBarHidden] = useState(false);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const { handleLogout } = useAuth({ navigation })
    const { changeStatusBarVisibility } = useStatusBarManager({ setIsStatusBarHidden, isStatusBarHidden });

    useEffect(() => {
        const unsubAuth = onAuthStateChanged(auth, (user) => {
            if (!user) {
                setProfile(null);
                setLoading(false);
                return;
            }

            const ref = doc(db, 'users', user.uid);
            const unsubDoc = onSnapshot(ref, (snap) => {
                if (snap.exists()) {
                    const data = snap.data();
                    const createdAt = data?.createdAt?.toDate ? data.createdAt.toDate() : null;
                    setProfile({
                        name: data?.name ?? user.displayName ?? 'User',
                        email: data?.email ?? user.email ?? '-',
                        createdAt,
                    });
                } else {
                    setProfile({
                        name: user.displayName ?? 'User',
                        email: user.email ?? '-',
                        createdAt: null,
                    });
                }
                setLoading(false);
            }, () => setLoading(false));

            // cleanup per-auth change
            return () => unsubDoc();
        });

        return () => unsubAuth();
    }, []);

    const formattedCreatedAt = useMemo(() => {
        if (!profile?.createdAt) return '-';
        try {
            return `${profile.createdAt.toLocaleDateString()} ${profile.createdAt.toLocaleTimeString()}`;
        } catch {
            return '-';
        }
    }, [profile]);

    const initial = (profile?.name || 'U').trim().substring(0, 2).toUpperCase();

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.containerProfile} edges={['top']}>
                <StatusBar animated={true} hidden={isStatusBarHidden} />
                <LinearGradient
                    colors={['#667eea', '#764ba2', '#f093fb']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientBackground}
                >
                    <View style={[styles.floatingElement, styles.element1]} />
                    <View style={[styles.floatingElement, styles.element2]} />
                    <View style={[styles.floatingElement, styles.element3]} />

                    <Header>
                        <TouchableWithoutFeedback onPress={changeStatusBarVisibility}>
                            <Text style={styles.title}>My Profile</Text>
                        </TouchableWithoutFeedback>
                    </Header>

                    <View style={styles.contentContainer}>
                        {loading ? (
                            <ActivityIndicator size="large" color="#fff" />
                        ) : (
                            <>
                                {/* profile header */}
                                <View style={styles.profileHeader}>
                                    <View style={styles.avatarContainer}>
                                        <Text style={styles.avatarText}>{initial}</Text>
                                    </View>
                                    <Text style={styles.userName}>{profile?.name || '-'}</Text>
                                    <Text style={styles.userEmail}>{profile?.email || '-'}</Text>
                                </View>

                                {/* info card */}
                                <View style={styles.infoCard}>
                                    <View style={styles.infoRow}>
                                        <Icon name="person" size={20} color="#667eea" />
                                        <Text style={styles.label}>Name</Text>
                                        <Text style={styles.value}>{profile?.name || '-'}</Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <Icon name="email" size={20} color="#667eea" />
                                        <Text style={styles.label}>Email</Text>
                                        <Text style={styles.value}>{profile?.email || '-'}</Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <Icon name="schedule" size={20} color="#667eea" />
                                        <Text style={styles.label}>Registered</Text>
                                        <Text style={styles.value}>{formattedCreatedAt}</Text>
                                    </View>
                                </View>

                                {/* profile options */}
                                <View style={styles.profileOptions}>
                                    <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('VerifyPassword', { destination: 'EditProfile' })}>
                                        <Icon name="person-outline" size={24} color="#667eea" />
                                        <Text style={styles.menuText}>Edit Profile</Text>
                                        <Icon name="chevron-right" size={24} color="#667eea" />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('VerifyPassword', { destination: 'ChangePassword' })}>
                                        <Icon name="lock-outline" size={24} color="#667eea" />
                                        <Text style={styles.menuText}>Change Password</Text>
                                        <Icon name="chevron-right" size={24} color="#667eea" />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                                        <Icon name="logout" size={24} color="#667eea" />
                                        <Text style={styles.menuText}>Logout</Text>
                                        <Icon name="chevron-right" size={24} color="#667eea" />
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </LinearGradient>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

const styles = StyleSheet.create({
    containerProfile: {
        flex: 1,
        width: '100%',
        backgroundColor: '#667eea',
    },
    gradientBackground: {
        flex: 1,
        alignItems: 'center',
    },
    floatingElement: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    element1: {
        top: -100,
    },
    element2: {
        top: 150,
        left: -50,
    },
    element3: {
        bottom: 200,
        right: -50,
    },
    title: {
        fontSize: 32,
        color: '#FFFFFF',
        fontWeight: 'bold',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    contentContainer: {
        flex: 1,
        width: '100%',
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 10,
    },
    avatarContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: 'rgba(255,255,255,0.25)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.6)',
    },
    avatarText: {
        fontSize: 40,
        color: '#fff',
        fontWeight: 'bold',
    },
    userName: {
        marginTop: 12,
        fontSize: 22,
        color: '#fff',
        fontWeight: '700',
    },
    userEmail: {
        marginTop: 4,
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
    },
    infoCard: {
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 16,
        padding: 16,
        gap: 25,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    label: {
        color: '#764ba2',
        fontWeight: '700',
        minWidth: 90,
    },
    value: {
        color: '#333',
        flex: 1,
        flexWrap: 'wrap',
    },
    profileOptions: {
        marginTop: 16,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 16,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    menuText: {
        flex: 1,
        marginLeft: 12,
        color: '#333',
        fontWeight: '600',
    },
});

export default ProfileScreen;