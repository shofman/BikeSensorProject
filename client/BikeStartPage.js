import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  Button,
  View
} from 'react-native';
import SpeedExample from './SpeedExample';
import { SERVER_URL } from './constants'

const styles = {
  container: { flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'stretch' },
  fontStyle: {fontSize: 20, height: 40},
  inputField: { flex: 2 },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    height: 200
  }
}

export default class BikeStartPage extends Component<{}> {
  constructor(props) {
    super(props);
    this.state = {
      rpm: props.rpm,
      delay: props.delay,
    };
  }

  onChanged = stateKey => text => {
    let newText = '';
    const numbers = '0123456789';

    for (var i=0; i < text.length; i++) {
      if(numbers.indexOf(text[i]) > -1 ) {
        newText = newText + text[i];
      }
      else {
        alert("please enter numbers only");
      }
    }
    
    this.setState({ [stateKey]: newText });
  }

  clearServer = () => {
    fetch(SERVER_URL + '/clear', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
    .catch(error => console.log(error))
  }

  submitPress = async () => {
    SpeedExample.setupTimer()
    await this.clearServer()
    this.props.updateState(this.state.rpm, this.state.delay, true) 
  }
  
  goToAndroid = () => SpeedExample.startAndroid()

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.inputField}>
          <Text style={styles.fontStyle}>{'RPM'}</Text>
          <TextInput 
            keyboardType='numeric'
            returnKeyType={ "done" }
            numberOfLines={1}
            editable
            maxLength={3}
            onChangeText={this.onChanged('rpm')}
            style={{...styles.fontStyle, backgroundColor: 'white'}}
            value={this.state.rpm}
          />
        </View>
        <View style={styles.inputField}>
          <Text style={styles.fontStyle}>{'Delay'}</Text>
          <TextInput
            keyboardType='numeric'
            returnKeyType={ "done" }
            numberOfLines={1}
            editable
            maxLength={2}
            onChangeText={this.onChanged('delay')}
            style={{...styles.fontStyle, backgroundColor: 'white'}}
            value={this.state.delay}
          />
        </View>
        <Button title="Start" onPress={this.submitPress} />
        <Button title="AndroidDeets" onPress={this.goToAndroid} /> 
      </View>
    );
  }
}