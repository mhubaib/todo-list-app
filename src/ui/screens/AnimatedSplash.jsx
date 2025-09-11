import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions, StyleSheet } from 'react-native';

const { height } = Dimensions.get('window');

export default function AnimatedSplash({
    onFinish,
    appName = 'DailyApp',
    backgroundColor = '#0A84FF', // ganti dengan warna tema aplikasi Anda
    logoSource = require('../../assets/todo-app-icon.png'),
    duration = 1500, // durasi animasi logo masuk
    stay = 1500,      // jeda sebelum fade-out
    fadeOut = 500,   // durasi animasi keluar
}) {
    const scale = useRef(new Animated.Value(0.8)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const nameTranslate = useRef(new Animated.Value(20)).current;
    const nameOpacity = useRef(new Animated.Value(0)).current;
    const screenOpacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.parallel([
                Animated.timing(scale, { toValue: 1, duration, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 1, duration, useNativeDriver: true }),
            ]),
            Animated.parallel([
                Animated.timing(nameTranslate, { toValue: 0, duration: 600, useNativeDriver: true }),
                Animated.timing(nameOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
            ]),
            Animated.delay(stay),
            Animated.timing(screenOpacity, { toValue: 0, duration: fadeOut, useNativeDriver: true }),
        ]).start(() => {
            onFinish?.();
        });
    }, [duration, stay, fadeOut, onFinish, nameTranslate, nameOpacity, opacity, scale, screenOpacity]);

    return (
        <Animated.View style={[styles.container, { backgroundColor, opacity: screenOpacity }]}>
            <View style={styles.center}>
                <Animated.Image
                    source={logoSource}
                    resizeMode="contain"
                    style={{ width: height * 0.18, height: height * 0.18, opacity, transform: [{ scale }] }}
                />
            </View>
            <Animated.Text
                style={[
                    styles.appName,
                    {
                        opacity: nameOpacity,
                        transform: [{ translateY: nameTranslate }],
                    },
                ]}
            >
                {appName}
            </Animated.Text>
        </Animated.View>
    );
}
const styles = StyleSheet.create({
    container: { 
        ...StyleSheet.absoluteFillObject,
        flex: 1, 
        zIndex: 10,
    },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    appName: {
        position: 'absolute',
        bottom: 100,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 30,
        fontWeight: '800',
        color: '#ffffff',
    },
});
