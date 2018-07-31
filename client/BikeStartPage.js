import React, { Component } from 'react';
import {
  DeviceEventEmitter,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  Button,
  View
} from 'react-native';
import SpeedExample from './SpeedExample';
import { SERVER_URL, BACKGROUND_COLOR } from './constants'
import fetchWithTimeout from './fetchWithTimeout'
import Loader from './Loader'

const styles = {
  container: {
    backgroundColor: BACKGROUND_COLOR,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch'
  },
  fontStyle: {
    fontSize: 20,
    height: 40
  },
  inputField: {
    flex: 2
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    height: 200
  }
}

let loadingTimer
const subscriptions = []

export default class BikeStartPage extends Component<{}> {
  constructor(props) {
    super(props);
    this.state = {
      rpm: props.rpm,
      delay: props.delay,
      loading: false,
    };

    const subscriptionDefinitions = [
      { name: 'loadingFinishedEvent', callback: this.loadingEvent },
    ]

    subscriptionDefinitions.map(subscription => {
      const newSubscription = DeviceEventEmitter.addListener(subscription.name, subscription.callback)
      subscriptions.push(newSubscription)
    })
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

  clearServer = async () => {
    await fetchWithTimeout(SERVER_URL + '/clear', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
    .catch(error => console.log(error))
  }

  resetState = () => {
    SpeedExample.stopAndroid()
    this.setState({
      loading: false,
    })
    clearTimeout(loadingTimer)
  }

  loadingEvent = () => {
    this.setState({
      loading: false,
    })
    clearTimeout(loadingTimer)
    this.props.updateState(this.state.rpm, this.state.delay, true)
  }

  submitPress = async () => {
    this.setState({
      loading: true,
    })

    loadingTimer = setTimeout(this.loadingEvent, 3000)

    // SpeedExample.startAndroid()
    await this.clearServer()
  }
  
  goToAndroid = () => SpeedExample.startAndroid()

  componentWillUnmount() {
    if (loadingTimer) {
      clearTimeout(loadingTimer)
    }
    // subscriptions.map(subscription => {
    //   subscription.remove()
    // })
    // SpeedExample.stopAndroid()
  }

  render() {
    return (
      <View style={styles.container}>
        <Loader loading={this.state.loading} requestClose={this.resetState}/>
        <View style={styles.inputField}>
          <Text style={styles.fontStyle}>{'RPM'}</Text>
          <TextInput 
            keyboardType='numeric'
            returnKeyType={ "done" }
            numberOfLines={1}
            editable
            underlineColorAndroid='transparent'
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
            underlineColorAndroid='transparent'
            maxLength={2}
            onChangeText={this.onChanged('delay')}
            style={{...styles.fontStyle, backgroundColor: 'white'}}
            value={this.state.delay}
          />
        </View>
        <Button
          style={styles.button}
          title="Start"
          onPress={this.submitPress}
          disabled={this.state.loading}
        />
      </View>
    );
  }
}