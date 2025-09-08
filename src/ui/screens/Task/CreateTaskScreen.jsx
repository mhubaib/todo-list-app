import { addDoc, collection, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../../../firebase.config';
import { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import uuid from 'react-native-uuid';
import DateTimePicker from '@react-native-community/datetimepicker';
import LinearGradient from 'react-native-linear-gradient';
import InputField from '../../components/InputField';
import ButtonCustom from '../../components/ButtonCustom';
import CategoryItem from '../../components/CategoryItem';
import Header from '../../components/Header';

const CreateTaskScreen = ({ navigation, route }) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Umum');
    const [dueDate, setDueDate] = useState([null, null]);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [taskId, setTaskId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOnline, setIsOnline] = useState(true);
    const categories = ['Umum', 'Kerja', 'Pribadi', 'Belanja', 'Kesehatan'];

    // Monitor network connectivity
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsOnline(state.isConnected);
        });
        return unsubscribe;
    }, []);

    // Load task data for editing
    useEffect(() => {
        if (route.params?.task) {
            const { task } = route.params;
            setTitle(task.title);
            setCategory(task.category || 'Umum');
            const dateObj = task.dueDate ? new Date(task.dueDate.toDate ? task.dueDate.toDate() : task.dueDate) : null;
            const timeStr = task.dueTime || null;
            setDueDate([dateObj, timeStr]);
            setIsEditing(true);
            setTaskId(task.id);
        }
    }, [route.params]);

    const formatDate = (date) => {
        if (!date) return 'Pilih tanggal';
        return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (timeStr) => {
        return timeStr || 'Pilih jam';
    };

    const handleDateChange = (_, selectedDate) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setDueDate(([_, t]) => [selectedDate, t]);
        }
    };

    const handleTimeChange = (_, selectedTime) => {
        setShowTimePicker(Platform.OS === 'ios');
        if (selectedTime) {
            const hh = `${selectedTime.getHours()}`.padStart(2, '0');
            const mm = `${selectedTime.getMinutes()}`.padStart(2, '0');
            setDueDate(([d, _]) => [d, `${hh}:${mm}`]);
        }
    };

    const handleSubmit = async () => {
        if (!title.trim()) {
            Alert.alert('Error', 'Judul tugas tidak boleh kosong');
            return;
        }

        setIsSubmitting(true);
        const [dateObj, timeStr] = dueDate;

        try {
            if (isEditing) {
                // Edit task
                if (isOnline) {
                    const taskRef = doc(db, 'tugas', taskId);
                    await updateDoc(taskRef, {
                        title: title.trim(),
                        category: category,
                        dueDate: dateObj ? dateObj : null,
                        dueTime: timeStr || null,
                        updatedAt: serverTimestamp(),
                    });
                    Alert.alert('Sukses', 'Tugas berhasil diperbarui');
                } else {
                    // Offline: Update locally
                    const storedTasks = await AsyncStorage.getItem('tasks');
                    let tasks = storedTasks ? JSON.parse(storedTasks) : [];
                    tasks = tasks.map(task =>
                        task.id === taskId
                            ? { ...task, title: title.trim(), category, dueDate: dateObj, dueTime: timeStr }
                            : task
                    );
                    await AsyncStorage.setItem('tasks', JSON.stringify(tasks));

                    // Add to pendingTasks
                    const storedPending = await AsyncStorage.getItem('pendingTasks');
                    let pendingTasks = storedPending ? JSON.parse(storedPending) : [];
                    pendingTasks.push({
                        action: 'update',
                        id: taskId,
                        data: {
                            title: title.trim(),
                            category,
                            dueDate: dateObj ? dateObj : null,
                            dueTime: timeStr || null,
                        }
                    });
                    await AsyncStorage.setItem('pendingTasks', JSON.stringify(pendingTasks));

                    Alert.alert('Sukses', 'Tugas diperbarui (akan disinkronkan saat online)');
                }
            } else {
                // Create new task
                const newTask = {
                    id: uuid.v4(), // Generate UUID string
                    title: title.trim(),
                    category,
                    dueDate: dateObj ? dateObj : null,
                    dueTime: timeStr || null,
                    done: false,
                    userId: auth.currentUser.uid,
                    createdAt: new Date(),
                };

                if (isOnline) {
                    await addDoc(collection(db, 'tugas'), {
                        title: newTask.title,
                        category: newTask.category,
                        dueDate: newTask.dueDate,
                        dueTime: newTask.dueTime,
                        done: newTask.done,
                        userId: newTask.userId,
                        createdAt: serverTimestamp(),
                    });
                    Alert.alert('Sukses', 'Tugas berhasil dibuat');
                } else {
                    // Offline: Save to AsyncStorage
                    const storedTasks = await AsyncStorage.getItem('tasks');
                    const tasks = storedTasks ? JSON.parse(storedTasks) : [];
                    tasks.push(newTask);
                    await AsyncStorage.setItem('tasks', JSON.stringify(tasks));

                    // Add to pendingTasks
                    const storedPending = await AsyncStorage.getItem('pendingTasks');
                    let pendingTasks = storedPending ? JSON.parse(storedPending) : [];
                    pendingTasks.push({
                        action: 'create',
                        data: {
                            title: newTask.title,
                            category: newTask.category,
                            dueDate: newTask.dueDate,
                            dueTime: newTask.dueTime,
                            done: newTask.done,
                            userId: newTask.userId,
                            createdAt: newTask.createdAt,
                        }
                    });
                    await AsyncStorage.setItem('pendingTasks', JSON.stringify(pendingTasks));

                    Alert.alert('Sukses', 'Tugas dibuat (akan disinkronkan saat online)');
                }
            }

            setTitle('');
            setCategory('Umum');
            setDueDate([null, null]);
            navigation.goBack();
        } catch (error) {
            console.error('Error in handleSubmit:', error);
            Alert.alert('Gagal', error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
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
                        <Text style={styles.headerText}>
                            {isEditing ? 'Edit Task' : 'Create Task'}
                        </Text>
                    </Header>
                    <View style={styles.contentWrapper}>
                        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                            <CategoryItem items={categories} Category={category} setCategory={setCategory} />
                            <InputField
                                placeHolder={'Add task...'}
                                value={title}
                                onChangeText={setTitle}
                            >Task:</InputField>
                            <View style={styles.dateContainer}>
                                <Text style={styles.dateLabel}>Deadline (Tanggal):</Text>
                                <TouchableOpacity
                                    style={styles.dateButton}
                                    onPress={() => setShowDatePicker(true)}
                                >
                                    <Text style={styles.dateButtonText}>
                                        {formatDate(dueDate[0])}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.dateContainer}>
                                <Text style={styles.dateLabel}>Jam Pengerjaan:</Text>
                                <TouchableOpacity
                                    style={styles.dateButton}
                                    onPress={() => setShowTimePicker(true)}
                                >
                                    <Text style={styles.dateButtonText}>
                                        {formatTime(dueDate[1])}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <ButtonCustom
                                title={isEditing ? "Update" : "Submit"}
                                onPress={handleSubmit}
                                loading={isSubmitting}
                                loadingText={isEditing ? "Updating..." : "Creating..."}
                            />
                        </ScrollView>
                    </View>
                </LinearGradient>
                {showDatePicker && (
                    <DateTimePicker
                        value={dueDate[0] || new Date()}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={handleDateChange}
                        minimumDate={new Date()}
                    />
                )}
                {showTimePicker && (
                    <DateTimePicker
                        value={new Date()}
                        mode="time"
                        is24Hour={true}
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={handleTimeChange}
                    />
                )}
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: '#667eea'
    },
    gradientBackground: {
        flex: 1,
        position: 'relative',
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
    contentWrapper: {
        flex: 1,
        marginVertical: 25,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 25,
        marginHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    content: {
        padding: 20,
    },
    headerText: {
        fontSize: 28,
        color: '#FFFFFF',
        fontWeight: 'bold',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    dateContainer: {
        marginVertical: 12,
    },
    dateLabel: {
        marginBottom: 6,
        color: '#1a1a1a',
        fontWeight: '600',
    },
    dateButton: {
        paddingVertical: 12,
        paddingHorizontal: 14,
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e2ddddff',
    },
    dateButtonText: {
        color: '#1a1a1a',
        fontWeight: '500',
    },
});

export default CreateTaskScreen;