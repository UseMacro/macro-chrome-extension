import React, { Component } from 'react';
import Radium from 'radium';
import ReactDOM from 'react-dom';
import key from 'keymaster';

import WebFont from 'webfontloader';

WebFont.load({
  google: {
    families: ['Overpass:400,700']
  }
});

const ID = 'macro-onboarding-popup-wrapper';

if (!document.getElementById(ID)) {
  let macro = document.createElement('div');
  macro.setAttribute('id', ID);
  document.body.appendChild(macro);
}

class OnboardingPopup extends Component {
  constructor(props) {
    super(props);
    this.state = {show: true};
    this.name = props.name;
    this.data = props.data;
  }
  componentDidMount() {
    this.initKeys();
  }
  initKeys() {
    key.filter = (event) => true;
    key('escape', (event, handler) => {
      this.close();
    });
  }
  close() {
    this.setState({show: false});
  }
  cancel(e) {
    e.stopPropagation();
  }
  // inclusive range
  randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  render() {
    let sectionIndex1 = this.props.first ? 0 : this.randInt(0, this.props.data.sections.length - 1);
    let shortcutIndex1 = this.props.first ? 0 : this.randInt(0, this.props.data.sections[sectionIndex1].shortcuts.length - 1);
    let sectionIndex2 = this.props.first ? 0 : this.randInt(0, this.props.data.sections.length - 1);
    let shortcutIndex2 = this.props.first ? 1 : this.randInt(0, this.props.data.sections[sectionIndex2].shortcuts.length - 1);
    let shortcutHint1 = this.props.data.sections[sectionIndex1].shortcuts[shortcutIndex1];
    let shortcutHint2 = this.props.data.sections[sectionIndex2].shortcuts[shortcutIndex2];

    return this.state.show ? <div style={styles.container} onClick={() => this.close()}>
      <div style={styles.pointer}/>
      <div style={styles.popup} onClick={this.cancel}>
        <p style={[styles.reset, styles.primary, {marginTop: '10px'}]}>Press {shortcutHint1.keys[0].default} to {shortcutHint1.name.toLowerCase()}.</p>
        <p style={[styles.reset, styles.primary]}>Press {shortcutHint2.keys[0].default} to {shortcutHint2.name.toLowerCase()}.</p>
        <p style={styles.secondary}>Discover more {this.name} shortcuts by pressing Alt+/ or by clicking the Macro icon.</p>
        <div style={styles.footer}>
          <div style={styles.button} onClick={() => this.close()}>
            <p style={[styles.reset, styles.secondary]}>GOT IT</p>
          </div>
          <div style={styles.plug}>
            <p style={[styles.reset, styles.tertiary]}>POWERED BY</p>
            <img style={styles.icon} src={icon}/>
          </div>
        </div>
      </div>
    </div> : null;
  }
}

let styles = {
  reset: {
    marginTop: '0',
    marginRight: '0',
    marginBottom: '0',
    marginLeft: '0'
  },
  primary: {
    fontWeight: '700'
  },
  secondary: {
    color: '#888'
  },
  tertiary: {
    color: '#BBB',
    fontSize: '9px',
    paddingTop: '3px'
  },
  container: {
    position: 'fixed',
    zIndex: '9000',
    width: '100%',
    height: '100%',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    fontFamily: 'Overpass,Helvetica',
    fontSize: '12px',
    lineHeight: '1.5'
  },
  popup: {
    position: 'absolute',
    zIndex: '9100',
    top: '10px',
    right: '30px',
    backgroundColor: '#F7FCFF',
    width: '250px',
    padding: '15px',
    boxShadow: '1px 3px 7px rgba(0, 0, 0, 0.3)',
    borderRadius: '2px'
  },
  button: {
    backgroundColor: '#FFF',
    padding: '3px 15px',
    color: '#AAA',
    borderRadius: '3px',
    border: '1px solid #DDD',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '11px'
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '15px'
  },
  plug: {
    display: 'flex'
  },
  icon: {
    width: '20px',
    height: '20px',
    marginLeft: '7px'
  },
  pointer: {
    width: '0',
    height: '0',
    position: 'absolute',
    top: '2px',
    right: '35px',
    borderLeft: '10px solid transparent',
    borderRight: '10px solid transparent',
    borderBottom: '10px solid #F7FCFF',
    zIndex: '9200'
  },
}

OnboardingPopup = Radium(OnboardingPopup);

ReactDOM.render(<OnboardingPopup data={data} name={name} first={first}/>, document.getElementById(ID));
