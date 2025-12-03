// Program with infinite loop for hang detection testing
function runForever() {
  let counter = 0;
  while (true) {
    counter++;
    // This will hang forever
  }
  return counter;
}

runForever();
