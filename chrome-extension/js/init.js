import React from 'react';
import ReactDOM from 'react-dom';
import { Panel } from 'macro-panel';

const ID = 'macro-wrapper';

if (!document.getElementById(ID)) {
  let macro = document.createElement('div');
  macro.setAttribute('id', ID);
  document.body.appendChild(macro);
}

ReactDOM.render(<Panel />, document.getElementById(ID));
