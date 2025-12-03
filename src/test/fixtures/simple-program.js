// Simple test program for debugging
function add(a, b) {
  const result = a + b;
  return result;
}

function multiply(x, y) {
  let result = 0;
  for (let i = 0; i < y; i++) {
    result += x;
  }
  return result;
}

function main() {
  const sum = add(5, 3);
  console.log("Sum:", sum);

  const product = multiply(4, 3);
  console.log("Product:", product);

  return sum + product;
}

// Run the program
const finalResult = main();
console.log("Final result:", finalResult);
