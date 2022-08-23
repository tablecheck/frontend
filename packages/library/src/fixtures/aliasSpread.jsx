import { components } from 'my-select';
import { components as reactSelectComponents } from 'react-select';

export function createSelect(props) {
  const { MyControl } = components;
  const { Control } = reactSelectComponents;
  return (
    <Control {...props}>
      <MyControl>
        <div>Test</div>
      </MyControl>
    </Control>
  );
}
