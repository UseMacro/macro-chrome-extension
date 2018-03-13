import React, { Component } from 'react';
import Radium from 'radium';
import ReactDOM from 'react-dom';
import key from 'keymaster';

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
  toggle() {
    this.setState({show: this.state.show ? false : true});
  }
  close() {
    this.setState({show: false});
  }
  cancel(e) {
    e.stopPropagation();
  }
  render() {
    return this.state.show ? <div style={styles.container}>
      <div style={styles.modal} onClick={() => this.close()}>
        <div style={[styles.dialog, this.props.style]} onClick={this.cancel}>
          <div style={styles.header}>
            <h1>Onboarding Panel for {this.name} </h1>
          </div>
        </div>
      </div>
    </div> : null;
  }
}

let styles = {
  container: {
    position: 'fixed',
    zIndex: '9000',
    width: '100%',
    height: '100%',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0'
  },
  overlay: {
    opacity: '0.2',
    position: 'fixed',
    backgroundColor: '#000000',
    zIndex: '7000',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0'
  },
  modal: {
    display: 'block',
    position: 'absolute',
    zIndex: '8000',
    outline: '0',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0'
  },
  dialog: {
    width: '600px',
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.5)',
    outline: '0',
    backgroundColor: '#FFFFFF',
    padding: '20px',
    maxHeight: '90vh',
    overflowY: 'scroll',
    borderRadius: '15px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '5px',
    paddingLeft: '15px'
  },
  body: {
    display: 'flex',
    justifyContent: 'space-around'
  },
  col: {
    width: '45%'
  }
}

OnboardingPopup = Radium(OnboardingPopup);

ReactDOM.render(<OnboardingPopup data={data} name={name}/>, document.getElementById(ID));

