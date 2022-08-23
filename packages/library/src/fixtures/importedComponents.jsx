import { Component } from './component';
import { components } from './components';
import DefaultComponent from './defaults';

export default function TestComponent() {
  return (
    <div>
      <Component prop1={12} />
      <components.SomeProp>Children</components.SomeProp>
      <DefaultComponent>
        <div>Excess</div>
      </DefaultComponent>
    </div>
  );
}
