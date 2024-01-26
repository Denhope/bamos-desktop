//Compacts whitespaces in a string.
export const compactWhitespace = (str) => str.replace(/\s{2,}/g, ' ');

//Combines two arrays of objects, using the specified key to match objects.

export const combine = (a, b, prop) =>
  Object.values(
    [...a, ...b].reduce((acc, v) => {
      if (v[prop])
        acc[v[prop]] = acc[v[prop]] ? { ...acc[v[prop]], ...v } : { ...v };
      return acc;
    }, {})
  );

const x = [
  { id: 1, name: 'John' },
  { id: 2, name: 'Maria' },
];
const y = [
  { id: 1, age: 28 },
  { id: 3, age: 26 },
  { id: 2, age: { a: 5, b: 7 } },
  { id: 2, ssss: { a: 5, b: 7 } },
];
combine(x, y, 'id');
// [
//  { id: 1, name: 'John', age: 28 },
//  { id: 2, name: 'Maria' },
//  { id: 3, age: 26 }
// ]
//Calculates the difference between two arrays, without filtering duplicate values.

//Create a Set from b to get the unique values in b.
//Use Array.prototype.filter() on a to only keep values not contained in b, using Set.prototype.has().
export const difference = (a, b) => {
  const s = new Set(b);
  return a.filter((x) => !s.has(x));
};

difference([1, 2, 3, 3], [1, 2, 4]); // [3, 3]

// include in arr
export const include = (a, b) => {
  const s = new Set(b);
  return a.filter((x) => s.has(x));
};

//filtered in arr
export const filtered = (arr, code, searchString, pos, groupNum) => {
  return arr.filter(
    (x) =>
      x.code.toString().includes(code) &&
      x.taskNumber?.toString(groupNum) &&
      x.taskNumber.toString().includes(searchString, pos)
  );
};

//Finds all unique values in an array.

export const uniqueElements = (arr) => [...new Set(arr)];
uniqueElements([1, 2, 2, 3, 4, 4, 5]); // [1, 2, 3, 4, 5]
