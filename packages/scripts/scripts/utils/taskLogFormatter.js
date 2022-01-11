const Spinnies = require('spinnies');

const spinners = new Spinnies({
  color: 'blue',
  succeedColor: 'green',
  failColor: 'red'
});

const taskList = [];

function logTaskStart(message) {
  const id = `${taskList.length}`;
  taskList.push([id, message]);
  spinners.add(id, { text: message });
}
function logTaskEnd(isSuccessOrWarnings) {
  const [messageId, message] = taskList.pop();
  if (Array.isArray(isSuccessOrWarnings) && isSuccessOrWarnings.length) {
    spinners.succeed(messageId, {
      text: `${message} Done with warnings!\n${isSuccessOrWarnings.join('\n')}`,
      succeedColor: 'yellow'
    });
  } else if (
    isSuccessOrWarnings ||
    typeof isSuccessOrWarnings === 'undefined'
  ) {
    spinners.succeed(messageId);
  } else {
    spinners.fail(messageId, { text: `${message} Failed!` });
  }
}

module.exports = {
  spinners,
  logTaskStart,
  logTaskEnd
};
