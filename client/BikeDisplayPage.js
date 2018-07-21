import React, { Component } from 'react';
import {
  Text,
  View,
  Button,
  DeviceEventEmitter
} from 'react-native';
import SpeedExample from './SpeedExample';
import { SERVER_URL } from './constants'

let subscription

export default class BikeStartPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rpm: props.rpm,
      delay: props.delay,
      tvOn: false,
      realtimeRpm: '0',
      slowed: false,
    };
    subscription = DeviceEventEmitter.addListener('speedEvent', this.speedEvent)
  }

  slowPress = () => {
    const newValue = !this.state.slowed
    if (newValue) {
      SpeedExample.setSlowdown()
    } else {
      SpeedExample.cancelSlowdown()
    }

    this.setState({
      slowed: newValue,
    })
  }

  backPress = () => {
    SpeedExample.stopTimer()
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

  sendToServer = async rpm => {
    const queryParams = `?currentRpm=${rpm}&delay=${this.state.delay}&desiredRpm=${this.state.rpm}`

    const result = await fetch(SERVER_URL + queryParams, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rpm,
      }),
    }).catch(error => {
      console.log(error)
      return { json: () => {} }
    })

    return result.json()
  }

  outputBool = value => value ? 'Yes' : 'No'

  speedEvent = async event => {
    const rpm = parseFloat(event.speed).toFixed(2)
    const result = await this.sendToServer(rpm)

    this.setState({
      realtimeRpm: ('' + rpm),
      tvOn: result ? result.isShowingTV : this.state.tvOn,
    })
  }

  componentWillUnmount() {
    subscription.remove()
  }

  render() {
    return (
      <View>
        <Button title="back" onPress={this.backPress} />
        <Button title={'Slowed: ' + this.state.slowed} onPress={this.slowPress} />
        <View>
          <View style={{marginBottom: 20}}>
            <Text style={{fontSize: 40}}>{this.state.realtimeRpm}</Text>
            <Text style={{fontSize: 40}}>{'Showing TV: ' + this.outputBool(this.state.tvOn)}</Text>
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