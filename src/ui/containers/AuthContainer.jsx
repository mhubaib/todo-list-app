import {
    View,
    Text,
    StyleSheet,
    // Dimensions,
    TouchableWithoutFeedback,
    Keyboard,
    SafeAreaView,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

// const { width, height } = Dimensions.get("window");

const AuthContainer = ({ title, text, children, onPress, screen }) => {
    const dismissKeyboard = onPress || (() => Keyboard.dismiss());

    return (
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
            <SafeAreaView style={styles.container}>
                <KeyboardAwareScrollView
                    contentContainerStyle={styles.scrollContent}
                    enableOnAndroid={true}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Background Gradient */}
                    <LinearGradient
                        colors={["#667eea", "#764ba2", "#f093fb"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.gradientBackground}
                    >
                        {/* Floating Elements */}
                        <View style={[styles.floatingElement, styles.element1]} />
                        <View style={[styles.floatingElement, styles.element2]} />
                        <View style={[styles.floatingElement, styles.element3]} />

                        {/* App Logo/Title (only in login screen) */}
                        {screen === "login" && (
                            <View style={styles.headerContainer}>
                                <View style={styles.logoContainer}>
                                    <Text style={styles.appTitle}>MyDailyApp</Text>
                                    <View style={styles.logoDot} />
                                </View>
                                <Text style={styles.subtitle}>Your Premium Experience</Text>
                            </View>
                        )}

                        {/* Form Container */}
                        <View style={styles.formWrapper}>
                            <View style={styles.containerForm}>
                                {/* Header */}
                                <View style={styles.formHeader}>
                                    <Text style={styles.title}>{title}</Text>
                                    <Text style={styles.text}>{text}</Text>
                                </View>

                                {/* Input Fields */}
                                <View style={styles.inputContainer}>{children}</View>
                            </View>
                        </View>
                    </LinearGradient>
                </KeyboardAwareScrollView>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { flexGrow: 1 },
    gradientBackground: {
        flex: 1,
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 50,
    },
    floatingElement: {
        position: "absolute",
        borderRadius: 100,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
    element1: {
        width: 120,
        height: 120,
        top: 100,
        left: -30,
        transform: [{ rotate: "45deg" }],
    },
    element2: {
        width: 80,
        height: 80,
        top: 200,
        right: -20,
        backgroundColor: "rgba(255, 255, 255, 0.08)",
    },
    element3: {
        width: 60,
        height: 60,
        top: 300,
        left: 30,
        backgroundColor: "rgba(255, 255, 255, 0.06)",
        transform: [{ rotate: "30deg" }],
    },
    headerContainer: {
        alignItems: "center",
        marginTop: 10,
        marginBottom: 20,
        zIndex: 2,
    },
    logoContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 2,
    },
    appTitle: {
        fontSize: 34,
        color: "#FFFFFF",
        fontWeight: "800",
        letterSpacing: 1.2,
        textShadowColor: "rgba(0, 0, 0, 0.3)",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    logoDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#FFD700",
        marginLeft: 5,
        shadowColor: "#FFD700",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
    },
    subtitle: {
        fontSize: 16,
        color: "rgba(255, 255, 255, 0.9)",
        fontWeight: "300",
        letterSpacing: 0.5,
    },
    formWrapper: {
        width: "100%",
        flex: 1,
        justifyContent: "flex-end",
        paddingHorizontal: 20,
        zIndex: 2,
    },
    containerForm: {
        width: "100%",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderRadius: 40,
        paddingVertical: 40,
        paddingHorizontal: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 20,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.3)",
    },
    formHeader: {
        alignItems: "center",
        marginBottom: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#1a1a1a",
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    text: {
        fontSize: 16,
        color: "#6b7280",
        textAlign: "center",
        lineHeight: 24,
        maxWidth: "90%",
    },
    inputContainer: {
        width: "100%",
        gap: 20,
    },
});

export default AuthContainer;
