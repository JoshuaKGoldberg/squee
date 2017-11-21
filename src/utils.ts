export const removeFromArray = <T>(array: T[], item: T): boolean => {
    let removed = false;

    for (let i = 0; i < array.length; i += 1) {
        if (array[i] === item) {
            removed = true;
            array.splice(i, 1);
            i -= 1;
        }
    }

    return removed;
};
