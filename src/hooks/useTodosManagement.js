import { Alert } from 'react-native';
import { updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase.config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useTodosManagement({ setTasks, saveTasksToStorage, setPendingTasks, isOnline, tasks, pendingTasks }) {
    // Task manipulation functions
    const toggleTask = async (taskId, currentStatus) => {
        try {
            if (isOnline) {
                await updateDoc(doc(db, 'tasks', taskId), { done: !currentStatus });
            } else {
                const updatedTasks = tasks.map(task =>
                    task.id === taskId ? { ...task, done: !currentStatus } : task
                );
                setTasks(updatedTasks);
                saveTasksToStorage(updatedTasks);
                const pendingTask = { action: 'update', id: taskId, data: { done: !currentStatus } };
                setPendingTasks(prev => [...prev, pendingTask]);
                await AsyncStorage.setItem('@pendingtasks_key', JSON.stringify([...pendingTasks, pendingTask]));
            }
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const deleteTask = (taskId, taskTitle) => {
        Alert.alert(
            'Hapus Tugas',
            `Apakah Anda yakin ingin menghapus tugas "${taskTitle}"?`,
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Hapus',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            if (isOnline) {
                                await deleteDoc(doc(db, 'tasks', taskId));
                            } else {
                                const updatedTasks = tasks.filter(task => task.id !== taskId);
                                setTasks(updatedTasks);
                                saveTasksToStorage(updatedTasks);
                                const pendingTask = { action: 'delete', id: taskId };
                                setPendingTasks(prev => [...prev, pendingTask]);
                                await AsyncStorage.setItem('@pendingtasks_key', JSON.stringify([...pendingTasks, pendingTask]));
                            }
                        } catch (error) {
                            console.error('Error deleting task:', error);
                            Alert.alert('Error', 'Gagal menghapus tugas');
                        }
                    },
                },
            ]
        );
    };

    return {
        toggleTask, deleteTask
    }
};