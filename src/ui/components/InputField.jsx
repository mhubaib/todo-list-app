import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Animated } from 'react-native';

const InputField = ({ placeHolder, value, onChangeText, secureTextEntry, children, icon, readOnly }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [animatedValue] = useState(new Animated.Value(0));

    const handleFocus = () => {
        setIsFocused(true);
        Animated.timing(animatedValue, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false,
        }).start();
    };

    const handleBlur = () => {
        setIsFocused(false);
        Animated.timing(animatedValue, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    };

    const borderColor = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['#e5e7eb', '#667eea'],
    });

    const shadowOpacity = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.15],
    });

    return (
        <View style={styles.inputContainer}>
            {/* label */}
            {children && (
                <Text style={[
                    styles.label,
                    { color: isFocused ? '#667eea' : '#374151' }
                ]}>
                    {children}
                </Text>
            )}

            {/* input container with animation */}
            <Animated.View style={[
                styles.inputWrapper,
                {
                    borderColor: borderColor,
                    shadowOpacity: shadowOpacity,
                }
            ]}>
                {/* icon  */}
                {icon && (
                    <View style={styles.iconContainer}>
                        {icon}
                    </View>
                )}

                {/* text input */}
                <TextInput
                    style={[
                        styles.input,
                        { paddingLeft: icon ? 45 : 16 }
                    ]}
                    placeholder={placeHolder}
                    placeholderTextColor='#9ca3af'
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={secureTextEntry}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    readOnly={readOnly}
                />

                {/* focus indicator */}
                <Animated.View
                    style={[
                        styles.focusIndicator,
                        {
                            transform: [{
                                scaleX: animatedValue.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, 1],
                                })
                            }]
                        }
                    ]}
                />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    inputContainer: {
        width: '100%',
        marginBottom: 4,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 8,
        color: '#374151',
        letterSpacing: 0.3,
    },
    inputWrapper: {
        position: 'relative',
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#e5e7eb',
        backgroundColor: '#ffffff',
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 3,
        overflow: 'hidden',
    },
    iconContainer: {
        position: 'absolute',
        left: 16,
        top: '50%',
        transform: [{ translateY: -10 }],
        zIndex: 1,
    },
    input: {
        height: 56,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#1f2937',
        fontWeight: '500',
        backgroundColor: 'transparent',
    },
    focusIndicator: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: '#667eea',
        borderRadius: 2,
    },
});

export default InputField;