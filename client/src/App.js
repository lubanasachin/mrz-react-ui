import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import Form from './mrz/Form.js';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>MRZ Code Generator</h2>
        </div>
        <Form />
      </div>
    );      
  }
}

export default App;
