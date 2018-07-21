/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import { View } from 'react-native';
import BikeStartPage from './BikeStartPage'
import BikeDisplayPage from './BikeDisplayPage'

const styles = {
  header: { backgroundColor: '#ededed', height: 60 },
  container: { flex: 1 },
}

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rpm: '8',
      delay: '1',
      started: false,
    };
  }

  updateState = (rpm, delay, started) => {
    this.setState({rpm, delay, started})
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}/>
        { 
          this.state.started ?
            <BikeDisplayPage updateState={this.updateState} rpm={this.state.rpm} delay={this.state.delay} />
          :
            <BikeStartPage updateState={this.updateState} rpm={this.state.rpm} delay={this.state.delay} />
        }
      </View>
    );
  }
}
