export function insertSorted(
    array: any[],
    data: any,
    compare: (a: any, b: any) => number
) {
    let low = 0;
    let high = array.length;

    while (low < high) {
        const mid = Math.floor((low + high) / 2);
        if (compare(array[mid], data) < 0) {
            low = mid + 1;
        } else {
            high = mid;
        }
    }

    array.splice(low, 0, data);
}

export function findLast<T>(array: T[], predicate: (value: T) => boolean) {
    for (let i = array.length - 1; i >= 0; i--) {
        if (predicate(array[i])) {
            return array[i];
        }
    }
    return undefined;
}