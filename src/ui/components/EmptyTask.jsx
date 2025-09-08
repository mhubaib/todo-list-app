import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const EmptyTasks = ({ title = 'Belum ada tugas', subtitle = 'Tambahkan tugas pertamamu agar hari ini lebih produktif.', ctaText = 'Buat Tugas', onPress, ctaVisible }) => {
    return (
        <View style={styles.wrapper}>
            <LinearGradient
                colors={['#667eea', '#764ba2', '#f093fb']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
            >
                <View style={styles.circleLarge} />
                <View style={styles.circleSmall} />

                <View style={styles.content}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.subtitle}>{subtitle}</Text>

                    {ctaVisible && (
                    <TouchableOpacity style={styles.cta} onPress={onPress}>
                        <Icon name="add-circle-outline" size={22} color="#667eea" />
                        <Text style={styles.ctaText}>{ctaText}</Text>
                        <Icon name="chevron-right" size={22} color="#667eea" />
                    </TouchableOpacity>
                    )}
                </View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: { paddingVertical: 8 },
    card: {
        borderRadius: 20,
        overflow: 'hidden',
        padding: 16,
        minHeight: 120,
        justifyContent: 'center',
    },
    circleLarge: {
        position: 'absolute',
        width: 220, height: 220, borderRadius: 110,
        backgroundColor: 'rgba(255,255,255,0.15)',
        top: -60, right: -40,
    },
    circleSmall: {
        position: 'absolute',
        width: 120, height: 120, borderRadius: 60,
        backgroundColor: 'rgba(255,255,255,0.2)',
        bottom: -40, left: -30,
    },
    content: { alignItems: 'center', gap: 6 },
    title: { color: '#fff', fontSize: 18, fontWeight: '700', textAlign: 'center' },
    subtitle: { color: 'rgba(255,255,255,0.95)', fontSize: 13, textAlign: 'center' },
    cta: {
        marginTop: 10,
        backgroundColor: '#fff',
        paddingHorizontal: 14, paddingVertical: 10,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    ctaText: { color: '#1a1a1a', fontWeight: '700' },
});

export default EmptyTasks;