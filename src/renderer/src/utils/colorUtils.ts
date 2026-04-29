export const getRandomColor = (id: string | number) => {
    const colors = [
        '#EF4444', // red-500
        '#F97316', // orange-500
        '#F59E0B', // amber-500
        '#84CC16', // lime-500
        '#10B981', // emerald-500
        '#06B6D4', // cyan-500
        '#3B82F6', // blue-500
        '#6366F1', // indigo-500
        '#8B5CF6', // violet-500 (Cho phép dùng làm màu avatar định danh)
        '#D946EF', // fuchsia-500
        '#EC4899', // pink-500
        '#F43F5E', // rose-500
    ];

    let hash = 0;
    const str = String(id);
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash % colors.length);
    return colors[index];
};
