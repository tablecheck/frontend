import React, {
  Node,
  Node as OtherNode,
  Fragment,
  Fragment as Frag,
  Component,
  StatelessFunctionalComponent,
  useState
} from 'react';
import React2 from 'react';
import { GenericNode } from 'some-import';
import { GenericNode2 } from 'some-other-import';

import { OccasionSelectType } from './types';

function a(arg1: Node) {}

type t2 = OtherNode;
type Comp1 = StatelessFunctionalComponent;
let Comp2: StatelessFunctionalComponent;

const t3 = React2;
const t4 = React;

class Test extends Component {}

const test = <Fragment>Some Content</Fragment>;
const test2 = <Frag key={'test'}>Some Content</Frag>;

export const Requests = () => {
  const [occasion, setOccasion] = useState<OccasionSelectType>(null);
  return null;
};

arg.reduce<GenericNode[]>(() => {}, {});
arg.reduce<{ a: { b: { c: GenericNode2 }[] } }>(() => {}, {});
