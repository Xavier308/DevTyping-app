// src/data/sampleSnippets.js

const sampleSnippets = {
  python: [
    {
      id: 'py1',
      name: 'Quick Sort',
      code: `def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)`
    },
    {
      id: 'py2',
      name: 'Binary Search',
      code: `def binary_search(arr, target):
    low = 0
    high = len(arr) - 1

    while low <= high:
        mid = (low + high) // 2
        if arr[mid] < target:
            low = mid + 1
        elif arr[mid] > target:
            high = mid - 1
        else:
            return mid
    return -1`
    },
    {
      id: 'py3',
      name: 'Merge Sort',
      code: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] < right[j]:
            result.append(left[i]); i += 1
        else:
            result.append(right[j]); j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result` 
    },
    {
      id: 'py4',
      name: 'Fibonacci Generator',
      code: `def fib_generator(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b` 
    },
    {
      id: 'py5',
      name: 'List Comprehension',
      code: `# Squares of first 10 numbers
    squares = [x*x for x in range(10)]
    print(squares)` 
    }
  ],

  javascript: [
    {
      id: 'js1',
      name: 'Array Filter',
      code: `const numbers = [1, 2, 3, 4, 5, 6];
    const evenNumbers = numbers.filter(num => num % 2 === 0);
    console.log(evenNumbers); // [2, 4, 6]`   
    },
    {
      id: 'js2',
      name: 'Promise Example',
      code: `const fetchData = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const data = { id: 1, name: 'User' };
            resolve(data);
        }, 1000);
    });
};

fetchData()
    .then(data => console.log(data))
    .catch(error => console.error(error));`   
    },
    {
      id: 'js3',
      name: 'Debounce Function',
      code: `function debounce(fn, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}`
    },
    {
      id: 'js4',
      name: 'Deep Clone',
      code: `const deepClone = obj => JSON.parse(JSON.stringify(obj));
// Usage: const copy = deepClone(original);`   
    },
    {
      id: 'js5',
      name: 'Merge Sort',
      code: `function mergeSort(arr) {
    if (arr.length <= 1) return arr;
    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));
    const right = mergeSort(arr.slice(mid));
    const result = [];
    let i = 0, j = 0;
    while (i < left.length && j < right.length) {
        if (left[i] < right[j]) result.push(left[i++]);
        else result.push(right[j++]);
    }
    return result.concat(left.slice(i)).concat(right.slice(j));
}`   
    }
  ]
};

export default sampleSnippets;
