import { useState, useEffect } from 'react';
import { Pressable, Text, StyleSheet, Animated, View, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';

const ButtonCustom = ({
    title = 'Button',
    onPress,
    variant = 'primary',
    icon,
    disabled = false,
    fullWidth = true,
    loading = false,
    loadingText = 'Loading...'
}) => {
    const [animatedValue] = useState(new Animated.Value(0));
    const [scaleValue] = useState(new Animated.Value(1));
    const [spinValue] = useState(new Animated.Value(0));

    // Start spinning animation when loading
    useEffect(() => {
        if (loading) {
            const spinAnimation = Animated.loop(
                Animated.timing(spinValue, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                })
            );
            spinAnimation.start();
        } else {
            spinValue.setValue(0);
        }
    }, [loading, spinValue]);

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const handlePressIn = () => {
        if (loading) return; // Prevent press when loading

        Animated.parallel([
            Animated.timing(animatedValue, {
                toValue: 1,
                duration: 150,
                useNativeDriver: false,
            }),
            Animated.timing(scaleValue, {
                toValue: 0.96,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handlePressOut = () => {
        if (loading) return; // Prevent press when loading

        Animated.parallel([
            Animated.timing(animatedValue, {
                toValue: 0,
                duration: 150,
                useNativeDriver: false,
            }),
            Animated.timing(scaleValue, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handlePress = () => {
        if (loading || disabled) return;
        onPress && onPress();
    };

    const getButtonStyle = () => {
        switch (variant) {
            case 'secondary':
                return styles.secondaryButton;
            case 'outline':
                return styles.outlineButton;
            default:
                return styles.primaryButton;
        }
    };

    const getTextStyle = () => {
        switch (variant) {
            case 'secondary':
                return styles.secondaryText;
            case 'outline':
                return styles.outlineText;
            default:
                return styles.primaryText;
        }
    };

    if (variant === 'primary') {
        return (
            <Animated.View style={[
                styles.buttonContainer,
                { transform: [{ scale: scaleValue }] },
                !fullWidth && { alignSelf: 'center' }
            ]}>
                <Pressable
                    style={({ pressed }) => [
                        styles.button,
                        getButtonStyle(),
                        disabled && styles.disabledButton,
                        loading && styles.loadingButton,
                        !fullWidth && { paddingHorizontal: 32 }
                    ]}
                    onPress={handlePress}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    disabled={disabled || loading}
                >
                    <LinearGradient
                        colors={disabled || loading ? ['#9ca3af', '#6b7280'] : ['#667eea', '#764ba2']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradientButton}
                    >
                        <View style={styles.buttonContent}>
                            {loading ? (
                                <>
                                    <Animated.View style={[styles.spinnerContainer, { transform: [{ rotate: spin }] }]}>
                                        <ActivityIndicator
                                            size="small"
                                            color="#ffffff"
                                            style={styles.spinner}
                                        />
                                    </Animated.View>
                                    <Text style={[getTextStyle(), styles.loadingText]}>
                                        {loadingText}
                                    </Text>
                                </>
                            ) : (
                                <>
                                    {icon && (
                                        <View style={styles.iconContainer}>
                                            {icon}
                                        </View>
                                    )}
                                    <Text style={[getTextStyle(), disabled && styles.disabledText]}>
                                        {title}
                                    </Text>
                                </>
                            )}
                        </View>

                        {/* Shimmer Effect - only when not loading */}
                        {!disabled && !loading && (
                            <Animated.View style={[
                                styles.shimmerEffect,
                                {
                                    opacity: animatedValue.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, 0.3],
                                    })
                                }
                            ]} />
                        )}
                    </LinearGradient>
                </Pressable>
            </Animated.View>
        );
    }

    // For secondary and outline variants
    return (
        <Animated.View style={[
            styles.buttonContainer,
            { transform: [{ scale: scaleValue }] },
            !fullWidth && { alignSelf: 'center' }
        ]}>
            <Pressable
                style={({ pressed }) => [
                    styles.button,
                    getButtonStyle(),
                    disabled && styles.disabledButton,
                    loading && styles.loadingButton,
                    !fullWidth && { paddingHorizontal: 32 },
                    pressed && styles.pressedButton
                ]}
                onPress={handlePress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={disabled || loading}
            >
                <View style={styles.buttonContent}>
                    {loading ? (
                        <>
                            <Animated.View style={[styles.spinnerContainer, { transform: [{ rotate: spin }] }]}>
                                <ActivityIndicator
                                    size="small"
                                    color={variant === 'outline' ? '#667eea' : '#374151'}
                                    style={styles.spinner}
                                />
                            </Animated.View>
                            <Text style={[getTextStyle(), styles.loadingText]}>
                                {loadingText}
                            </Text>
                        </>
                    ) : (
                        <>
                            {icon && (
                                <View style={styles.iconContainer}>
                                    {icon}
                                </View>
                            )}
                            <Text style={[getTextStyle(), disabled && styles.disabledText]}>
                                {title}
                            </Text>
                        </>
                    )}
                </View>
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    buttonContainer: {
        width: '100%',
        marginVertical: 8,
    },
    button: {
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 4,
    },
    gradientButton: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        position: 'relative',
        borderRadius: 16,
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
    },
    primaryButton: {
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 6,
    },
    secondaryButton: {
        backgroundColor: '#f8fafc',
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
        paddingVertical: 16,
        paddingHorizontal: 24,
        shadowColor: '#64748b',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    outlineButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#667eea',
        paddingVertical: 14,
        paddingHorizontal: 24,
    },
    pressedButton: {
        transform: [{ scale: 0.98 }],
    },
    disabledButton: {
        opacity: 0.6,
        elevation: 0,
        shadowOpacity: 0,
    },
    loadingButton: {
        opacity: 0.8,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        marginRight: 8,
    },
    spinnerContainer: {
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    spinner: {
        width: 16,
        height: 16,
    },
    loadingText: {
        opacity: 0.9,
    },
    shimmerEffect: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 16,
    },
    primaryText: {
        color: '#ffffff',
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    secondaryText: {
        color: '#374151',
        fontSize: 17,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    outlineText: {
        color: '#667eea',
        fontSize: 17,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    disabledText: {
        opacity: 0.7,
    },
});

export default ButtonCustom;