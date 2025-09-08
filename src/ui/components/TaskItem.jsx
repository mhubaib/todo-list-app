import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTodosUtility } from '../../hooks/useTodosUtility';
import { navigate } from '../../utils/navigationRef';

const TaskItem = ({ task, toggleTask, deleteTask }) => {
    const { formatDueDate, getCategoryColor, isOverdue } = useTodosUtility();

    const handleEditTask = () => {
        // Navigate to Tasks tab first, then to CreateTaskScreen
        navigate('Task', {
            screen: 'Tasks',
            params: {
                screen: 'CreateTaskScreen',
                params: { task }
            }
        });
    };

    return (
        <View style={[styles.item, isOverdue(task.dueDate, task.done) && styles.overdueItem]}>
            <TouchableOpacity style={styles.checkbox} onPress={() => toggleTask(task.id, task.done)}>
                <View style={[styles.checkboxInner, task.done && styles.checkboxChecked]}>
                    {task.done && <Text style={styles.checkmark}>✓</Text>}
                </View>
            </TouchableOpacity>
            <View style={styles.taskContent}>
                <Text style={[styles.text, task.done && styles.done]}>{task.title}</Text>
                <View style={styles.taskMeta}>
                    <View style={[styles.categoryTag, { backgroundColor: getCategoryColor(task.category) }]}>
                        <Text style={styles.categoryTagText}>{task.category}</Text>
                    </View>
                    {task.dueDate && (
                        <View style={[styles.dueDateTag, isOverdue(task.dueDate, task.done) && styles.overdueTag]}>
                            <Text style={[styles.dueDateText, isOverdue(task.dueDate, task.done) && styles.overdueText]}>
                                {formatDueDate(task.dueDate)}
                            </Text>
                        </View>
                    )}
                    {task.dueTime && (
                        <View style={[styles.dueDateTag, isOverdue(task.dueDate, task.done) && styles.overdueTag]}>
                            <Text style={[styles.dueDateText, isOverdue(task.dueDate, task.done) && styles.overdueText]}>
                                {task.dueTime}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
            <TouchableOpacity style={styles.editBtn} onPress={handleEditTask}>
                <Text style={styles.editText}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteTask(task.id, task.title)}>
                <Text style={styles.deleteText}>🗑️</Text>
            </TouchableOpacity>
        </View>
    )
};

const styles = StyleSheet.create({
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
    taskMeta: { flexDirection: 'row', marginTop: 5 },
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
    editBtn: { padding: 8, marginLeft: 4 },
    editText: { fontSize: 16 },
    deleteBtn: { padding: 8, marginLeft: 0 },
    deleteText: { fontSize: 18 },
})

export default TaskItem;
