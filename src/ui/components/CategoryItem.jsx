import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const CategoryItem = ({ items, Category, setCategory }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>Kategori:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
                {items.map((cat) => (
                    <TouchableOpacity
                        key={cat}
                        style={[
                            styles.categoryButton,
                            Category === cat && styles.categoryButtonSelected
                        ]}
                        onPress={() => setCategory(cat)}
                    >
                        <Text style={[
                            styles.categoryText,
                            Category === cat && styles.categoryTextSelected
                        ]}>
                            {cat}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 15,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    scroll: {
        flexDirection: 'row',
    },
    categoryButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        backgroundColor: '#f3f4f6',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    categoryButtonSelected: {
        backgroundColor: '#667eea',
        borderColor: '#667eea',
    },
    categoryText: {
        fontSize: 14,
        color: '#666',
    },
    categoryTextSelected: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default CategoryItem;
