export function useTodosUtility() {
    // Utility functions
    const getCategoryColor = (category) => ({
        'Umum': '#6c757d',
        'Kerja': '#007bff',
        'Pribadi': '#28a745',
        'Belanja': '#ffc107',
        'Kesehatan': '#dc3545',
        'Pendidikan': '#17a2b8'
    }[category] || '#6c757d');

    const formatDueDate = (dueDate) => {
        if (!dueDate) return null;
        const date = dueDate.toDate ? dueDate.toDate() : new Date(dueDate);
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    };

    const isOverdue = (dueDate, isDone) => {
        if (!dueDate) return false;
        const date = dueDate.toDate ? dueDate.toDate() : new Date(dueDate);
        return date < new Date() && !isDone;
    };


    return {
        getCategoryColor, formatDueDate, isOverdue
    };
}