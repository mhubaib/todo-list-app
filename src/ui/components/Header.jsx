import { View, StyleSheet } from 'react-native';

const Header = ({ children }) => {
    return (
            <View style={styles.headerContent}>
                {children}
            </View>
    );
};

const styles = StyleSheet.create({
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
    },
});

export default Header;
