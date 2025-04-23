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
      }
    ],
    javascript: [
      {
        id: 'js1',
        name: 'Array Filter',
        code: `const numbers = [1, 2, 3, 4, 5, 6];
  const evenNumbers = numbers.filter(num => {
    return num % 2 === 0;
  });
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
      }
    ]
  };
  
  export default sampleSnippets;