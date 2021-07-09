// this pauses the running until you push enter in the terminal.
// mostly only useful for pausing and debugging when a file gets modified.
async function waitForEnter(message = 'Enter To continue...') {
  await new Promise((resolve) => {
    console.log(message);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.once('data', () => resolve());
  }).then(() => {
    process.stdin.setRawMode(false);
  });
}

module.exports = {
  waitForEnter
};
