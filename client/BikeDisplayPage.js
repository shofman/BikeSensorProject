import React, { Component } from 'react';
import {
  Text,
  View,
  Button,
  DeviceEventEmitter,
  TouchableOpacity,
} from 'react-native';
import SpeedExample from './SpeedExample';
import { SERVER_URL, BACKGROUND_COLOR } from './constants'
import fetchWithTimeout from './fetchWithTimeout'

const subscriptions = []
let isReceivingResults = false
let pingTimeout

const styles = {
  container: {
    backgroundColor: BACKGROUND_COLOR,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch'
  },
  content: {
    flex: 2,
    marginHorizontal: 20,
    marginBottom: 10
  },
  detailsContainer: {
    flex: 5,
    borderBottomWidth: 2,
    borderBottomColor: 'lightgrey',
  },
  text: {
    fontSize: 40,
  },
  setting: {
    flex: 3,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    marginVertical: 10,
  },
  settingText: {
    textAlign: 'center',
    alignSelf: 'center',
    marginHorizontal: 20,
    fontSize: 24,
    flex: 1,
  },
  settingButton: (isLeft, isPositive) => ({
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: isLeft ? 5 : 0,
    borderBottomRightRadius: isLeft ? 0 : 5,
    borderTopLeftRadius: isLeft ? 5 : 0,
    borderTopRightRadius: isLeft ? 0 : 5,
    backgroundColor: isPositive ? '#777' : '#555'
  }),
  settingWrapper: {
    flex: 2,
    flexDirection: 'row',
    backgroundColor: 'white',
    alignSelf: 'center'
  },
  settingLabel: {
    fontSize: 20,
    fontWeight: '400',
    alignSelf: 'flex-start',
    textAlign: 'left',
    justifyContent: 'center',
    flex: 1,
  },
  settingButtonText: {
    padding: 1,
    fontWeight: '500',
    color: 'white',
    fontSize: 30,
  },
  button: disabled => ({
    alignItems: 'center',
    backgroundColor: disabled ? '#cccccc' : '#2196F3',
    padding: 10,
  }),
  buttonText: disabled => ({
    fontSize: 18,
    padding: 5,
    textAlign: 'center',
    fontWeight: '500',
    color: disabled ? '#a1a1a1' : 'white'
  })
}

export default class BikeStartPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rpm: props.rpm,
      bikeSpeed: props.bikeSpeed,
      delay: props.delay,
      toggleSpeed: props.toggleSpeed,
      tvOn: false,
      realtimeResult: '0.00',
      connectedToServer: false,
    };

    const subscriptionDefinitions = [
      { name: 'calculatedSpeedEvent', callback: this.calculateSpeedEvent },
      { name: 'calculatedCadenceEvent', callback: this.calculateCadenceEvent },
    ]

    subscriptionDefinitions.map(subscription => {
      const newSubscription = DeviceEventEmitter.addListener(subscription.name, subscription.callback)
      subscriptions.push(newSubscription)
    })
  }

  getSpeedKey = selectedProp => {
    if (selectedProp) {
      return 'bikeSpeed'
    } else {
      return 'rpm'
    }
  }
  

  backPress = () => {
    SpeedExample.stopAndroid()
    this.props.updateState(
      '' + this.state.rpm,
      '' + this.state.bikeSpeed,
      '' + this.state.delay,
      false,
      this.state.toggleSpeed
    )
  }

  speedIncrease = () => {
    this.setState((prevState, props) => {
      const speedKey = this.getSpeedKey(prevState.toggleSpeed)
      return {[speedKey]: parseInt(prevState[speedKey]) + 1};
    });
  }

  speedDecrease = () => {
    this.setState((prevState, props) => {
      const speedKey = this.getSpeedKey(prevState.toggleSpeed)
      let newValue = prevState[speedKey] - 1;
      if (newValue < 0) {
        newValue = 0;
      }
      return {[speedKey]: newValue};
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

  pingServer = async () => {
    return await fetchWithTimeout(SERVER_URL, {
      method: 'GET',
    })
    .then(() => {
      this.setState({
        connectedToServer: true,
      })
    })
    .catch(error => {
      this.setState({
        connectedToServer: false,
      })
    })
  }

  sendToServer = async incomingResult => {
    const targetKey = this.getSpeedKey(this.state.toggleSpeed)
    const desired = this.state[targetKey]
    const queryParams = `?currentRpm=${incomingResult}&delay=${this.state.delay}&desiredRpm=${desired}`

    const result = await fetchWithTimeout(SERVER_URL + queryParams, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rpm: incomingResult,
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
    const incomingResult = parseFloat(event.calculatedSpeed).toFixed(2)
    const result = await this.sendToServer(incomingResult)
    if (isReceivingResults) {
      this.setState({
        realtimeResult: ('' + incomingResult),
        tvOn: result ? result.isShowingTV : this.state.tvOn,
      })
    }
  }

  calculateCadenceEvent = async event => {
    const incomingResult = parseFloat(event.calculatedCadence).toFixed(2)
    const result = await this.sendToServer(incomingResult)
    if (isReceivingResults) {
      this.setState({
        realtimeResult: ('' + incomingResult),
        tvOn: result ? result.isShowingTV : this.state.tvOn,
      })
    }
  }

  componentDidMount() {
    isReceivingResults = true
    this.pingServer()
    pingTimeout = setInterval(this.pingServer, 5000)
  }

  componentWillUnmount() {
    clearInterval(pingTimeout)
    isReceivingResults = false
    subscriptions.map(subscription => {
      subscription.remove()
    })
    SpeedExample.stopAndroid()
  }

  renderSettingButton = (text, press, overrideStyle) => {
    return (
      <TouchableOpacity
        activeOpacity={0.5}
        style={{...styles.button(false), ...overrideStyle}}
        onPress={press}
      >
        <Text style={styles.settingButtonText}>
          {text}
        </Text>
      </TouchableOpacity>
    )
  }

  showSpeedOrCadence = isSpeed => {
    if (isSpeed) {
      return 'Desired Speed:'
    } else {
      return 'Desired RPM:'
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.detailsContainer}>
            <Text style={styles.text}>{'Incoming: ' + this.state.realtimeResult}</Text>
            <Text style={styles.text}>{'Connected: ' + this.outputBool(this.state.connectedToServer)}</Text>
            <Text style={styles.text}>{'Showing TV: ' + this.outputBool(this.state.tvOn)}</Text>
          </View>
          <View style={styles.setting}>
            <Text style={styles.settingLabel}>{this.showSpeedOrCadence(this.state.toggleSpeed)}</Text>
            <View style={styles.settingWrapper}>
              {this.renderSettingButton('-', this.speedDecrease, styles.settingButton(true, false))}
              <Text style={styles.settingText}>{this.state[this.getSpeedKey(this.state.toggleSpeed)]}</Text>
              {this.renderSettingButton('+', this.speedIncrease, styles.settingButton(false, false))}
            </View>
          </View>
          <View style={styles.setting}>
            <Text style={styles.settingLabel}>{'Delay in Seconds:'}</Text>
            <View style={styles.settingWrapper}>
              {this.renderSettingButton('-', this.delayDecrease, styles.settingButton(true, true))}
              <Text style={styles.settingText}>{this.state.delay}</Text>
              {this.renderSettingButton('+', this.delayIncrease, styles.settingButton(false, true))}
            </View>
          </View>
        </View>
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.button(this.state.loading)}
          onPress={this.backPress}
          disabled={this.state.loading}
        >
          <Text style={styles.buttonText(this.state.loading)}>
            {'Back'}
          </Text>
        </TouchableOpacity>
      </View> 
    )
  }
}