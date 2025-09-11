import { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, StatusBar, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { collection, where, orderBy, onSnapshot, query, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../../../../firebase.config';
import Header from '../../components/Header';
import TaskItem from '../../components/TaskItem';
import { useStatusBarManager } from '../../../hooks/useStatusBarManager';
import { useTodosUtility } from '../../../hooks/useTodosUtility';
import EmptyTasks from '../../components/EmptyTask';
import { navigate } from '../../../utils/navigationRef';

const CalenderScreen = ({ navigation }) => {
    const [tugas, setTugas] = useState([]);
    const [selectedDate, setSelectedDate] = useState(formatDateKey(new Date()));
    const [isOnline, setIsOnline] = useState(true);
    const [hidden, setHidden] = useState(false);
    const {changeStatusBarVisibility} = useStatusBarManager({ setIsStatusBarHidden: setHidden, isStatusBarHidden: hidden });
    const {getCategoryColor} = useTodosUtility();
    // Network state
    useEffect(() => {
        const unsub = NetInfo.addEventListener(state => setIsOnline(state.isConnected));
        return unsub;
    }, []);

    // Load offline when needed
    useEffect(() => {
        if (!isOnline) {
            (async () => {
                try {
                    const storedTasks = await AsyncStorage.getItem('tasks');
                    if (storedTasks) {
                        setTugas(JSON.parse(storedTasks));
                    }
                } catch (e) {
                    console.log('Error load offline tasks', e);
                }
            })();
        }
    }, [isOnline]);

    // Realtime tasks
    useEffect(() => {
        if (!auth?.currentUser?.uid) { return; }
        const q = query(
            collection(db, 'tugas'),
            where('userId', '==', auth.currentUser.uid),
            orderBy('createdAt', 'desc')
        );
        const unsub = onSnapshot(q, (snap) => {
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setTugas(list);
            if (isOnline) {
                AsyncStorage.setItem('tasks', JSON.stringify(list)).catch(() => { });
            }
        });
        return unsub;
    }, [isOnline]);

    const toggleTask = useCallback(async (taskId, currentStatus) => {
        try {
            const taskRef = doc(db, 'tugas', taskId);
            await updateDoc(taskRef, { done: !currentStatus });
        } catch (e) {
            Alert.alert('Error', 'Gagal memperbarui status tugas');
        }
    }, []);

    const deleteTask = useCallback((taskId, title) => {
        Alert.alert(
            'Hapus Tugas',
            `Apakah Anda yakin ingin menghapus tugas "${title}"?`,
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Hapus',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, 'tugas', taskId));
                        } catch (e) {
                            Alert.alert('Error', 'Gagal menghapus tugas');
                        }
                    }
                }
            ]
        );
    }, []);

    // Tasks per date
    const tasksByDate = useMemo(() => {
        const map = {};
        for (const t of tugas) {
            const k = toDateKey(t.dueDate);
            if (!k) continue;
            if (!map[k]) map[k] = [];
            map[k].push(t);
        }
        return map;
    }, [tugas]);

    // Marked dates with dots by category + selected
    const markedDates = useMemo(() => {
        const marks = {};
        Object.keys(tasksByDate).forEach(dateKey => {
            const items = tasksByDate[dateKey];
            const dots = dedupeColors(
                items.map(i => ({ color: getCategoryColor(i.category), key: i.category || 'Umum' }))
            ).slice(0, 3); // at most 3 dots for cleanliness
            marks[dateKey] = { marked: dots.length > 0, dots };
        });
        // selected date style
        marks[selectedDate] = {
            ...(marks[selectedDate] || {}),
            selected: true,
            selectedColor: '#667eea',
            selectedTextColor: '#ffffff'
        };
        return marks;
    }, [tasksByDate, selectedDate, getCategoryColor]);

    const todayTasks = tasksByDate[selectedDate] || [];

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container1}>
                <StatusBar animated={true} hidden={hidden} />
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
                            <Text style={styles.title}>Kalender Tugas</Text>
                        </TouchableWithoutFeedback>
                    </Header>

                    <View style={styles.container2}>
                        {!isOnline && (
                            <View style={styles.offlineIndicator}>
                                <Text style={styles.offlineText}>Mode Offline</Text>
                            </View>
                        )}

                        <View style={styles.contentWrapper}>
                            <Calendar
                                current={selectedDate}
                                onDayPress={(day) => setSelectedDate(day.dateString)}
                                markedDates={markedDates}
                                markingType="multi-dot"
                                enableSwipeMonths={true}
                                animated={true}
                                theme={{
                                    calendarBackground: 'transparent',
                                    textSectionTitleColor: '#1a1a1a',
                                    monthTextColor: '#1a1a1a',
                                    dayTextColor: '#1a1a1a',
                                    arrowColor: '#667eea',
                                    todayTextColor: '#764ba2',
                                    textDisabledColor: '#c7c7c7',
                                    selectedDayBackgroundColor: '#667eea',
                                    selectedDayTextColor: '#ffffff',
                                }}
                                style={styles.calendar}
                            />

                            <Text style={styles.sectionHeader}>
                                {formatHumanDate(selectedDate)} ({todayTasks.length} tugas)
                            </Text>

                            <FlatList
                                data={todayTasks}
                                keyExtractor={(item) => item.id}
                                showsVerticalScrollIndicator={false}
                                renderItem={({ item: task }) => (
                                    <TaskItem key={task.id} task={task} toggleTask={toggleTask} deleteTask={deleteTask} navigation={navigation}/>
                                )}
                                ListEmptyComponent={<EmptyTasks title='Belum ada tugas di tanggal ini' subtitle='Tambahkan tugas pertamamu agar harinya lebih produktif.' ctaText='Buat Tugas' ctaVisible={true} onPress={handleCreateTask}/>}
                            />
                        </View>
                    </View>
                </LinearGradient>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

function handleCreateTask() {
    navigate('Tasks', { screen: 'CreateTaskScreen' });
}

function toDateKey(dueDate) {
    if (!dueDate) return null;
    const date = dueDate.toDate ? dueDate.toDate() : new Date(dueDate);
    return formatDateKey(date);
}

function formatDateKey(d) {
    const yyyy = d.getFullYear();
    const mm = `${d.getMonth() + 1}`.padStart(2, '0');
    const dd = `${d.getDate()}`.padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

function formatHumanDate(dateKey) {
    const [y, m, d] = dateKey.split('-').map(Number);
    const dt = new Date(y, (m - 1), d);
    return dt.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function dedupeColors(dots) {
    const seen = new Set();
    const res = [];
    for (const d of dots) {
        if (seen.has(d.key)) continue;
        seen.add(d.key);
        res.push(d);
    }
    return res;
}

const styles = StyleSheet.create({
    container1: {
        flex: 1,
        backgroundColor: '#667eea',
    },
    gradientBackground: {
        flex: 1,
        position: 'relative',
    },
    calendar: {
        // height: 200,
        // width: 200,
    },
    floatingElement: {
        position: 'absolute',
        borderRadius: 100,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    element1: {
        width: 120,
        height: 120,
        top: 100,
        left: -30,
        transform: [{ rotate: '45deg' }],
    },
    element2: {
        width: 80,
        height: 80,
        top: 200,
        right: -20,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
    element3: {
        width: 60,
        height: 60,
        top: 300,
        left: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        transform: [{ rotate: '30deg' }],
    },
    container2: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 25,
        zIndex: 2,
    },
    contentWrapper: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 25,
        padding: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    title: {
        fontSize: 32,
        color: '#FFFFFF',
        fontWeight: 'bold',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    offlineIndicator: {
        backgroundColor: '#ffc107',
        padding: 8,
        borderRadius: 8,
        marginBottom: 10,
        alignItems: 'center',
    },
    offlineText: {
        color: '#856404',
        fontWeight: 'bold',
        fontSize: 12,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#1a1a1a',
    },
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
    overdueItem: {
        borderLeftWidth: 5,
        borderLeftColor: '#dc3545',
    },
    taskContent: {
        flex: 1,
        marginLeft: 10,
    },
    text: {
        fontSize: 16,
        marginBottom: 5,
        color: '#1a1a1a',
        fontWeight: '500',
    },
    done: {
        textDecorationLine: 'line-through',
        color: '#6b7280',
    },
    taskMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    categoryTag: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        alignSelf: 'flex-start',
    },
    categoryTagText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    dueDateTag: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        backgroundColor: '#ffc107',
        marginLeft: 10,
    },
    overdueTag: {
        backgroundColor: '#dc3545',
    },
    dueDateText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    overdueText: {
        color: 'white',
        fontWeight: 'bold',
    },
    checkbox: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxInner: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: '#667eea',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#667eea',
    },
    checkmark: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    editBtn: {
        padding: 8,
        marginLeft: 5,
    },
    editText: {
        fontSize: 16,
    },
    deleteBtn: {
        padding: 8,
        marginLeft: 10,
    },
    deleteText: {
        fontSize: 18,
    },
});

export default CalenderScreen;