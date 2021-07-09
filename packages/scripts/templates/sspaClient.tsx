import React from 'react';
import ReactDOM from 'react-dom';
import singleSpaReact from 'single-spa-react';
import { App } from './App';

const reactLifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: App,
  domElementGetter: () => {
    const domNode = document.getElementById('sspa-content');
    if (!domNode) throw new Error('Could not find element #sspa-content');
    return domNode;
  }
});

export const bootstrap = [reactLifecycles.bootstrap];

export const mount = [reactLifecycles.mount];

export const unmount = [reactLifecycles.unmount];

export const navigation = [];
