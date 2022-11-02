export const shuffle = (array: any[]) => {
    const arr = [...array];
    return arr.sort(() => Math.random() - 0.5);
}
