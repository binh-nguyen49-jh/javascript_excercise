// Ex 1: Given an array of integers, removing duplicate elements and creating an array whose elements are unique. 
// (Eg: [1,2,2,3,4,4,4,5,6] => [1,2,3,4,5,6]). Find 3-4 ways to solve this.

// for each element -> delete duplicate elements after it.
// Time complexity: O(n^3)
// Auxiliary space: O(1)
function naiveApproach(arr) {
  const newArr = [...arr];
  for (let i = 0; i < newArr.length - 1; i ++) { // O(n)
    for (let j = i + 1; j < newArr.length; j++) { // O(n)
      if (newArr[i] === newArr[j]) {
        newArr.splice(j, 1); // O(n)
        j --;
      }
    }
  }
  return newArr;
}

// sort the array -> delete duplicate elements. But dont preserve the original position 
// Time complexity: O(n^2)
// Auxiliary space: O(1)
function naiveApproach2(arr) {
  let newArr = [...arr]
  newArr = newArr.sort(); // O(nlogn)
  let i = 0;
  while (i < newArr.length) { // O(n)
    while (i < newArr.length - 1 && newArr[i+1] === newArr[i]) {
        newArr.splice(i+1, 1); // O(n)
    }
    i ++;
  }
  return newArr;
}

// use map to keep track of elements and delete duplicate elements
// Time complexity: O(n^2)
// Auxiliary space: O(n)
function mapApproach(arr) {
  const newArr = [...arr];
  const map = new Map();
  for (let i = 0; i < newArr.length; i++) { // O(n)
    if (map.has(newArr[i])) {
        newArr.splice(i, 1); // O(n)
        i --;
    } else {
        map.set(newArr[i], 1);
    }
  }
  return newArr;
}

// use map to keep track of elements and just return its key
// Time complexity: O(n)
// Auxiliary space: O(n)
function mapApproach2(arr) {
  const map = new Map();
  for (let i = 0; i < arr.length; i++) {
    map.set(arr[i], 1);
  }
  return [...map.keys()];
}

console.log(naiveApproach([1,2,2,3,4,4,4,5,6]))
console.log(naiveApproach2([1,2,2,3,4,4,4,5,6]))
console.log(mapApproach([1,2,2,3,4,4,4,5,6]))
console.log(mapApproach2([6, 1,2,2,3,4,4,4,5]))
