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

/** _destroy: true special property */
saveValue({ id: 'id', _destroy: true });
cy.wait('@monolithSettings_PUT_/sections/1')
  .its('request.body')
  .should('deep.equal', {
    name: 'section 1',
    _destroy_background_image: true,
  });
