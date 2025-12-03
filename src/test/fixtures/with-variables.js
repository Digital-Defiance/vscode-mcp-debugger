// Program with various variable types for inspection testing
function testVariables() {
  const numberVar = 42;
  const stringVar = "hello world";
  const boolVar = true;
  const arrayVar = [1, 2, 3, 4, 5];
  const objectVar = {
    name: "Test",
    value: 100,
    nested: {
      deep: "value",
    },
  };

  console.log("Variables initialized");

  return {
    numberVar,
    stringVar,
    boolVar,
    arrayVar,
    objectVar,
  };
}

const result = testVariables();
console.log("Result:", result);
