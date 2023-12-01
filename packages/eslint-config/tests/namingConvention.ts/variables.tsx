/** Booleans */
// eslint-disable-next-line @typescript-eslint/naming-convention
const badName = true;
const isBadName = true;
const disabled = true;

/** Dereferencing */
function SomeComponent({ icon: Icon, command }) {
  const { icon: IconComponent } = command;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { other: Other } = command;
  const iconComponentRef = null;
}
