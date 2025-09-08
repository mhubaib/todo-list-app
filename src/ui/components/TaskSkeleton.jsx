import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TaskSkeleton = ({
    shimmerColors = ['#e9e9e9', '#f3f3f3', '#e9e9e9'],
    height = 76,
    borderRadius = 12
}) => {
    const translateX = useRef(new Animated.Value(-SCREEN_WIDTH)).current;

    useEffect(() => {
        const loop = Animated.loop(
            Animated.timing(translateX, {
                toValue: SCREEN_WIDTH,
                duration: 2000,
                useNativeDriver: true,
            })
        );
        loop.start();
        return () => loop.stop();
    }, [translateX]);

    return (
        <View style={[styles.skeletonItem, { height, borderRadius }]}>
            {/* checkbox skeleton */}
            <View style={styles.skeletonCheckbox} />

            {/* content skeleton */}
            <View style={styles.skeletonContent}>
                {/* title skeleton */}
                <View style={styles.skeletonTitle} />

                {/* meta info skeleton */}
                <View style={styles.skeletonMeta}>
                    <View style={styles.skeletonCategory} />
                    <View style={styles.skeletonDueDate} />
                </View>

            </View>
            {/* action buttons skeleton */}
            <View style={styles.skeletonActions}>
                <View style={styles.skeletonButton} />
                <View style={styles.skeletonButton} />
            </View>

            {/* Shimmer overlay */}
            <View style={StyleSheet.absoluteFill}>
                <Animated.View
                    style={[
                        styles.shimmerWrapper,
                        { transform: [{ translateX }] }
                    ]}
                >
                    <LinearGradient
                        colors={shimmerColors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.shimmer}
                    />
                </Animated.View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    skeletonItem: {
        width: '100%',
        padding: 12,
        borderWidth: 1,
        borderColor: '#e2ddddff',
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f2f2f2',
        overflow: 'hidden',
        position: 'relative',
    },
    skeletonCheckbox: {
        width: 24,
        height: 24,
        borderRadius: 4,
        backgroundColor: '#e4e4e4',
    },
    skeletonContent: {
        flex: 1,
        marginLeft: 10,
    },
    skeletonTitle: {
        width: '80%',
        height: 16,
        borderRadius: 4,
        marginBottom: 8,
        backgroundColor: '#e4e4e4',
    },
    skeletonMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    skeletonCategory: {
        width: 60,
        height: 20,
        borderRadius: 10,
        marginRight: 10,
        backgroundColor: '#e4e4e4',
    },
    skeletonDueDate: {
        width: 70,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#e4e4e4',
    },
    skeletonActions: {
        flexDirection: 'row',
        marginLeft: 10,
        marginTop: 8,
    },
    skeletonButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginLeft: 8,
        backgroundColor: '#e4e4e4',
    },
    shimmerWrapper: {
        width: 120,
        height: '100%',
    },
    shimmer: {
        flex: 1,
        opacity: 0.5,
    },
});

export default TaskSkeleton;