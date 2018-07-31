import React, { Component } from 'react';
import {
  Text,
  View,
  Button,
  DeviceEventEmitter
} from 'react-native';
import SpeedExample from './SpeedExample';
import { SERVER_URL } from './constants'
import fetchWithTimeout from './fetchWithTimeout'

const subscriptions = []

const styles = {
  rpmContainer: {
    marginBottom: 20,
  },
  text: {
    fontSize: 40,
  }
}

export default class BikeStartPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rpm: props.rpm,
      delay: props.delay,
      tvOn: false,
      realtimeRpm: '0',
    };

    const subscriptionDefinitions = [
      { name: 'calculatedSpeedEvent', callback: this.calculateSpeedEvent },
    ]

    subscriptionDefinitions.map(subscription => {
      const newSubscription = DeviceEventEmitter.addListener(subscription.name, subscription.callback)
      subscriptions.push(newSubscription)
    })
  }

  backPress = () => {
    SpeedExample.stopAndroid()
    this.props.updateState('' + this.state.rpm, '' + this.state.delay, false)
  }

  rpmIncrease = () => {
    this.setState((prevState, props) => {
      return {rpm: parseInt(prevState.rpm) + 1};
    });
  }

  rpmDecrease = () => {
    this.setState((prevState, props) => {
      let newRpmValue = prevState.rpm - 1;
      if (newRpmValue < 0) {
        newRpmValue = 0;
      }
      return {rpm: newRpmValue};
    });
  }

  delayIncrease = () => {
    this.setState((prevState, props) => {
      return {delay: parseInt(prevState.delay) + 1};
    });
  }

  delayDecrease = () => {
    this.setState((prevState, props) => {
      let newDelayValue = prevState.delay - 1;
      if (newDelayValue < 0) {
        newDelayValue = 0;
      }
      return {delay: newDelayValue};
    })
  }

  isTvStillOn = newTvValue => newTvValue === this.state.tvOn

  handleResponse = (response) => {
    return response.json()
      .then(json => {
        if (response.ok) {
          return json
        } else {
          return Promise.reject(json)
        }
      })
  }

  sendToServer = async rpm => {
    const queryParams = `?currentRpm=${rpm}&delay=${this.state.delay}&desiredRpm=${this.state.rpm}`

    const result = await fetchWithTimeout(SERVER_URL + queryParams, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rpm,
      }),
    })
    .then(this.handleResponse)
    .catch(error => {
      return { isShowingTV: this.state.tvOn }
    })

    return result
  }

  outputBool = value => {
    return value ? 'Yes' : 'No'
  }

  calculateSpeedEvent = async event => {
    const rpm = parseFloat(event.calculatedSpeed).toFixed(2)
    const result = await this.sendToServer(rpm)

    this.setState({
      realtimeRpm: ('' + rpm),
      tvOn: result ? result.isShowingTV : this.state.tvOn,
    })
  }

  componentWillUnmount() {
    subscriptions.map(subscription => {
      subscription.remove()
    })
    SpeedExample.stopAndroid()
  }

  render() {
    return (
      <View>
        <Button title="back" onPress={this.backPress} />
        <View>
          <View style={styles.rpmContainer}>
            <Text style={styles.text}>{this.state.realtimeRpm}</Text>
            <Text style={styles.text}>{'Showing TV: ' + this.outputBool(this.state.tvOn)}</Text>
          </View>
          <View>
            <Button title="-" onPress={this.rpmDecrease} />
            <Text>{'RPM: ' + this.state.rpm}</Text>
            <Button title="+" onPress={this.rpmIncrease} />
          </View>
          <View>
            <Button title="-" onPress={this.delayDecrease} />
            <Text>{'Delay: ' + this.state.delay}</Text>
            <Button title="+" onPress={this.delayIncrease} />
          </View>
        </View>
      </View> 
    )
  }
}