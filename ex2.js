// Ex 2: Given an array of integers, find integers with the most repetitions. If multiple numbers have the same maximum number of repetition, export all of them.
// Maximum 3 rounds, not nested.

// Define a map that counts the freq of each elements
function mapApproach(arr) {
  const map = new Map();
  for (let number of arr) {
    if (map.has(number)) {
      map.set(number, map.get(number) + 1);
    } else {
      map.set(number, 1);
    }
  }

  let maxFreq = 0;
  for (let number of map.keys()) {
    const numFreq = map.get(number);
    if (numFreq > maxFreq) {
      maxFreq = numFreq;
    }
  }

  const results = [];
  for (let number of map.keys()) {
    if (map.get(number) === maxFreq) {
        results.push(number - 0);
    }
  }

  return results;
}

console.log(mapApproach([1,2,2, 2,3,4,4,4,5,6]))