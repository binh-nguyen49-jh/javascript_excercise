// Ex 2: Given an array of integers, find integers with the most repetitions. If multiple numbers have the same maximum number of repetition, export all of them.
// Maximum 3 rounds, not nested.

// Define a map that counts the freq of each elements // reduce
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

function oneForLoopApproach(arr) {
  const map = new Map();
  const results = [];
  let maxFreq = 0;

  for (let number of arr) {
    if (map.has(number)) {
      map.set(number, map.get(number) + 1);
    } else {
      map.set(number, 1);
    }

    const numFreq = map.get(number);
    if (numFreq > maxFreq) {
      maxFreq = numFreq;
      results.length = 0;
      results.push(number);
    } else if (numFreq === maxFreq) {
      results.push(number);
    }
  }

  return results;
}


function oneReduceLoopApproach(arr) {
  const map = new Map();
  let maxFreq = 0;
  
  const results = arr.reduce((accArray, curNum) => {
    if (map.has(curNum)) {
      map.set(curNum, map.get(curNum) + 1);
    } else {
      map.set(curNum, 1);
    }

    const numFreq = map.get(curNum);
    if (numFreq > maxFreq) {
      maxFreq = numFreq;
      accArray.length = 0;
      accArray.push(curNum);
    } else if (numFreq === maxFreq) {
      accArray.push(curNum);
    }
    return accArray;
  }, []);

  return results;
}

console.log(mapApproach([1,2,2, 2,3,4,4,4,5,6]))
console.log(oneForLoopApproach([1,2,2, 2,3,4,4,4,5,6]))
console.log(oneReduceLoopApproach([1,2,2, 2,3,4,4,4,5,6]))