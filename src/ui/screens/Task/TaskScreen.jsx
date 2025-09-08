import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, ScrollView, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { collection, where, orderBy, onSnapshot, query, updateDoc, doc, deleteDoc, addDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import LinearGradient from 'react-native-linear-gradient';
import { auth, db } from '../../../../firebase.config';
import InputField from '../../components/InputField';
import CategoryItem from '../../components/CategoryItem';
import Header from '../../components/Header';
import TaskSkeleton from '../../components/TaskSkeleton';
import { useTodosManagement } from '../../../hooks/useTodosManagement';
import TaskItem from '../../components/TaskItem';
import { useStatusBarManager } from '../../../hooks/useStatusBarManager';
import EmptyTasks from '../../components/EmptyTask';

const TaskScreen = ({ navigation }) => {
    const [tasks, setTasks] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('Semua');
    const [searchText, setSearchText] = useState('');
    const [isOnline, setIsOnline] = useState(true);
    const [pendingTasks, setPendingTasks] = useState([]);
    const [isStatusBarHidden, setIsStatusBarHidden] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [skeletonCount, setSkeletonCount] = useState({ notDone: 2, done: 2 });
    const categories = ['Semua', 'Umum', 'Kerja', 'Pribadi', 'Belanja', 'Kesehatan'];
    const { toggleTask, deleteTask } = useTodosManagement({ setTasks, saveTasksToStorage, setPendingTasks, isOnline, tasks, pendingTasks });
    const { changeStatusBarVisibility } = useStatusBarManager({ setIsStatusBarHidden, isStatusBarHidden });

    // Initialize skeleton count from AsyncStorage on mount
    useEffect(() => {
        const initSkeletonCount = async () => {
            try {
                const storedTasks = await AsyncStorage.getItem('tasks');
                if (storedTasks) {
                    const parsedTasks = JSON.parse(storedTasks);
                    const notDoneCount = parsedTasks.filter(task => !task.done).length || 4;
                    const doneCount = parsedTasks.filter(task => task.done).length || 2;
                    setSkeletonCount({ notDone: notDoneCount, done: doneCount });
                }
            } catch (error) {
                console.error('Error initializing skeleton count:', error);
            }
        };
        initSkeletonCount();
    }, []);

    // Network connectivity monitoring
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => setIsOnline(state.isConnected));
        return unsubscribe;
    }, []);

    // Load tasks and pending tasks from storage when offline
    useEffect(() => {
        const loadData = async () => {
            try {
                const storedTasks = await AsyncStorage.getItem('tasks');
                if (storedTasks) {
                    const parsedTasks = JSON.parse(storedTasks);
                    setTasks(parsedTasks);
                    const notDoneCount = parsedTasks.filter(task => !task.done).length ?? 2;
                    const doneCount = parsedTasks.filter(task => task.done).length ?? 2;
                    setSkeletonCount({ notDone: notDoneCount, done: doneCount });
                }
                const storedPending = await AsyncStorage.getItem('pendingTasks');
                if (storedPending) setPendingTasks(JSON.parse(storedPending));
            } catch (error) {
                console.error('Error loading data from storage:', error);
            } finally {
                if (!isOnline) setIsLoading(false);
            }
        };
        if (!isOnline) loadData();
    }, [isOnline]);

    const saveTasksToStorage = async (tasksToSave) => {
        try {
            await AsyncStorage.setItem('tasks', JSON.stringify(tasksToSave));
        } catch (error) {
            console.error('Error saving tasks to storage:', error);
        }
    };

    // Sync pending tasks when online
    const syncPendingTasks = useCallback(async () => {
        if (!isOnline || !pendingTasks.length) return;

        try {
            for (const task of pendingTasks) {
                if (task.action === 'create') {
                    await addDoc(collection(db, 'tugas'), task.data);
                } else if (task.action === 'update') {
                    await updateDoc(doc(db, 'tugas', task.id), task.data);
                } else if (task.action === 'delete') {
                    await deleteDoc(doc(db, 'tugas', task.id));
                }
            }
            setPendingTasks([]);
            await AsyncStorage.removeItem('pendingTasks');
        } catch (error) {
            console.error('Error syncing pending tasks:', error);
        }
    }, [isOnline, pendingTasks]);

    useEffect(() => {
        if (isOnline) syncPendingTasks();
    }, [isOnline, syncPendingTasks]);

    // Fetch tasks from Firestore
    useEffect(() => {
        const q = query(collection(db, 'tugas'), where('userId', '==', auth.currentUser.uid), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const taskList = snapshot.docs.map(dok => ({ id: dok.id, ...dok.data() }));
            setTasks(taskList);
            const notDoneCount = taskList.filter(task => !task.done).length ?? 2;
            const doneCount = taskList.length - notDoneCount ?? 2;
            setSkeletonCount({ notDone: notDoneCount, done: doneCount });
            if (isOnline) saveTasksToStorage(taskList);
            setIsLoading(false);
        }, (error) => {
            console.error('Error fetching tasks:', error);
            setIsLoading(false);
        });
        return unsubscribe;
    }, [isOnline]);

    // Prepare sectioned data for FlatList
    const getSectionedData = useCallback(() => {
        let filteredTasks = tasks;
        if (selectedCategory !== 'Semua') {
            filteredTasks = filteredTasks.filter(task => task.category === selectedCategory);
        }
        if (searchText.trim()) {
            filteredTasks = filteredTasks.filter(task =>
                task.title.toLowerCase().includes(searchText.toLowerCase())
            );
        }
        return [
            { title: 'Belum Selesai :', data: filteredTasks.filter(task => !task.done) },
            { title: 'Selesai :', data: filteredTasks.filter(task => task.done) }
        ];
    }, [tasks, selectedCategory, searchText]);

    // Skeleton sections for loading state
    const getSkeletonSections = () => [
        { title: 'Belum Selesai :', count: skeletonCount.notDone },
        { title: 'Selesai :', count: skeletonCount.done }
    ];

    const sections = getSectionedData();

    const isSameDay = (a, b) => {
        const taskToday = a?.toDate ? a.toDate() : new Date(a);
        return taskToday.getFullYear() === b.getFullYear() && taskToday.getMonth() === b.getMonth() && taskToday.getDate() === b.getDate();
    };

    const today = new Date();

    const visibleSections = sections.map(s => ({...s, data: s.data.filter(t => t.dueDate && isSameDay(t.dueDate, today)) })).filter(s => s.data.length > 0);

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
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
                            <Text style={styles.title}>Tugas Hari Ini</Text>
                        </TouchableWithoutFeedback>
                    </Header>
                    <View style={styles.contentContainer}>
                        {!isOnline && (
                            <View style={styles.offlineIndicator}>
                                <Text style={styles.offlineText}>Mode Offline</Text>
                            </View>
                        )}
                        <View style={styles.contentWrapper}>
                            <InputField placeHolder="Cari tugas..." value={searchText} onChangeText={setSearchText} />
                            <CategoryItem Category={selectedCategory} setCategory={setSelectedCategory} items={categories} />
                            {isLoading ? (
                                <ScrollView>
                                    {getSkeletonSections().map((section, index) => (
                                        <View key={`section-${index}`}>
                                            <Text style={styles.sectionHeader}>{section.title}</Text>
                                            {[...Array(section.count)].map((_, i) => (
                                                <TaskSkeleton key={`skeleton-${index}-${i}`} />
                                            ))}
                                        </View>
                                    ))}
                                </ScrollView>
                            ) : (
                                <FlatList
                                    data={visibleSections}
                                    showsVerticalScrollIndicator={false}
                                    keyExtractor={(item, index) => item.title + index}
                                    renderItem={({ item }) => (
                                        <View>
                                            <Text style={styles.sectionHeader}>{item.title}</Text>
                                            {item.data.map(task => <TaskItem key={task.id} task={task} toggleTask={toggleTask} deleteTask={deleteTask} navigation={navigation} />)}
                                        </View>
                                    )}
                                    ListEmptyComponent={<EmptyTasks onPress={() => navigation.navigate('CreateTaskScreen')} ctaText='Buat Tugas Baru' ctaVisible={true}/>}
                                />
                            )}
                            <TouchableOpacity
                                style={styles.addBtn}
                                onPress={() => navigation.navigate('CreateTaskScreen')}
                            >
                                <Text style={styles.addText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </LinearGradient>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#667eea' },
    gradientBackground: { flex: 1, position: 'relative' },
    floatingElement: { position: 'absolute', borderRadius: 100, backgroundColor: 'rgba(255, 255, 255, 0.1)' },
    element1: { width: 120, height: 120, top: 100, left: -30, transform: [{ rotate: '45deg' }] },
    element2: { width: 80, height: 80, top: 200, right: -20, backgroundColor: 'rgba(255, 255, 255, 0.08)' },
    element3: { width: 60, height: 60, top: 300, left: 30, backgroundColor: 'rgba(255, 255, 255, 0.06)', transform: [{ rotate: '30deg' }] },
    contentContainer: { flex: 1, paddingHorizontal: 20, paddingVertical: 25, zIndex: 2 },
    contentWrapper: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 25,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    title: { fontSize: 32, color: '#FFFFFF', fontWeight: 'bold', textShadowColor: 'rgba(0, 0, 0, 0.3)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
    offlineIndicator: { backgroundColor: '#ffc107', padding: 8, borderRadius: 8, marginBottom: 10, alignItems: 'center' },
    offlineText: { color: '#856404', fontWeight: 'bold', fontSize: 12 },
    sectionHeader: { fontSize: 18, fontWeight: 'bold', marginVertical: 10, color: '#1a1a1a' },
    item: {
        padding: 12,
        borderWidth: 1,
        borderColor: '#e2ddddff',
        borderRadius: 12,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    overdueItem: { borderLeftWidth: 5, borderLeftColor: '#dc3545' },
    taskContent: { flex: 1, marginLeft: 10 },
    text: { fontSize: 16, marginBottom: 5, color: '#1a1a1a', fontWeight: '500' },
    done: { textDecorationLine: 'line-through', color: '#6b7280' },
    taskMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
    categoryTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, alignSelf: 'flex-start' },
    categoryTagText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
    dueDateTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, backgroundColor: '#ffc107', marginLeft: 10 },
    overdueTag: { backgroundColor: '#dc3545' },
    dueDateText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
    overdueText: { color: 'white', fontWeight: 'bold' },
    checkbox: { width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
    checkboxInner: { width: 20, height: 20, borderWidth: 2, borderColor: '#667eea', borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
    checkboxChecked: { backgroundColor: '#667eea' },
    checkmark: { color: 'white', fontSize: 12, fontWeight: 'bold' },
    editBtn: { padding: 8, marginLeft: 5 },
    editText: { fontSize: 16 },
    deleteBtn: { padding: 8, marginLeft: 10 },
    deleteText: { fontSize: 18 },
    addBtn: {
        backgroundColor: '#667eea',
        width: 56,
        height: 56,
        padding: 4,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 28,
        alignSelf: 'flex-end',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    addText: { color: 'white', fontSize: 28, fontWeight: 'bold' },
});

export default TaskScreen;