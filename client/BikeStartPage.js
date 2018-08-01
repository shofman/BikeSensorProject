import React, { Component } from 'react';
import {
  DeviceEventEmitter,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  Button,
  Switch,
  TouchableOpacity,
  View
} from 'react-native';
import SpeedExample from './SpeedExample';
import { SERVER_URL, BACKGROUND_COLOR } from './constants'
import fetchWithTimeout from './fetchWithTimeout'
import Loader from './Loader'

const sharedStyles = {
  fontStyle: {
    fontSize: 20,
    height: 40
  },
  pageItems: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchOptions: (toggled) => ({
    ...sharedStyles.fontStyle,
    flex: 2,
    fontWeight: toggled ? '500' : 'normal',
  }),
}

const TEXT_INPUT_HEIGHT = 42

const styles = {
  container: {
    backgroundColor: BACKGROUND_COLOR,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch'
  },
  textInput: {
    ...sharedStyles.fontStyle,
    backgroundColor: 'white',
    marginTop: 10,
    height: TEXT_INPUT_HEIGHT,
    borderRadius: 10,
    flex: 3,
  },
  labeltext: {
    ...sharedStyles.fontStyle,
    marginTop: TEXT_INPUT_HEIGHT / 2,
    flex: 3,
    marginRight: 5,
  },
  inputContainer: {
    flex: 4,
    marginHorizontal: 30,
  },
  switchContainer: {
    ...sharedStyles.pageItems,
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
    flex: 2,
    borderBottomWidth: 2,
    borderBottomColor: 'lightgrey',
    marginHorizontal: 20,
  },
  switchStyle: {
    marginRight: 20,
    marginBottom: 10,
    transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }]
  },
  switchOptionsLeft: toggled => ({
    ...sharedStyles.switchOptions(toggled),
    marginHorizontal: 20,
    marginRight: 10,
  }),
  switchOptionsRight: toggled => ({
    ...sharedStyles.switchOptions(toggled),
    marginLeft: 30,
    marginRight: -5,
  }),
  switchWrapper: {
    flex: 2,
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

let loadingTimer
const subscriptions = []

export default class BikeStartPage extends Component<{}> {
  constructor(props) {
    super(props);
    this.state = {
      rpm: props.rpm,
      bikeSpeed: props.bikeSpeed,
      delay: props.delay,
      loading: false,
      toggleSpeed: props.toggleSpeed, // Toggle between cadence and speed
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
    // console.warn('firign onchange')
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
    // console.warn('we are reseting state')
    this.setState({
      loading: false,
    })
    clearTimeout(loadingTimer)
  }

  loadingEvent = () => {
    // console.warn('we are calling loading')
    this.setState({
      loading: false,
    })
    clearTimeout(loadingTimer)
    this.props.updateState(
      this.state.rpm,
      this.state.bikeSpeed,
      this.state.delay,
      true,
      this.state.toggleSpeed
    )
  }

  updateSwitch = toggleSpeed => {
    // console.warn('we are updating switch')
    this.setState({
      toggleSpeed
    })
  }

  submitPress = async () => {
    // console.warn('we are submitting the press')
    this.setState({
      loading: true,
    })

    loadingTimer = setTimeout(this.loadingEvent, 3000)

    SpeedExample.startAndroid(this.state.toggleSpeed)
    await this.clearServer()
  }

  underlineSelected = selectedProp => {
    if (selectedProp) {
      return 'underline'
    } else {
      return 'none'
    }
  }

  rpmText = selectedProp => {
    if (selectedProp) {
      return 'Wheel Speed'
    } else {
      return 'RPM'
    }
  }

  getSpeedKey = selectedProp => {
    if (selectedProp) {
      return 'bikeSpeed'
    } else {
      return 'rpm'
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // console.warn('checking component')
    if (this.props.rpm !== prevProps.rpm) {
      this.setState({
        rpm: this.props.rpm,
      })
    }
    if (this.props.bikeSpeed !== prevProps.bikeSpeed) {
      this.setState({
        bikeSpeed: this.props.bikeSpeed,
      })
    }
    if (this.props.delay !== prevProps.delay) {
      this.setState({
        delay: this.props.delay
      })
    }
    if (this.props.toggleSpeed !== prevProps.toggleSpeed) {
      this.setState({
        toggleSpeed: this.props.toggleSpeed,
      })
    }
  }


  componentWillUnmount() {
    if (loadingTimer) {
      clearTimeout(loadingTimer)
    }
    subscriptions.map(subscription => {
      subscription.remove()
    })
    // SpeedExample.stopAndroid()
  }

  render() {
    return (
      <View style={styles.container}>
        <Loader loading={this.state.loading} requestClose={() => {}}/>
        <View style={styles.switchContainer}>
          <Text style={styles.switchOptionsLeft(!this.state.toggleSpeed)}>{'Cadence'}</Text>
          <View style={styles.switchWrapper}>
            <Switch
              style={styles.switchStyle}
              onValueChange={this.updateSwitch}
              value={this.state.toggleSpeed} 
            />
          </View>
          <Text style={styles.switchOptionsRight(this.state.toggleSpeed)}>{'Speed'}</Text>
        </View>
        <View style={styles.inputContainer}>
          <View style={sharedStyles.pageItems}>
            <Text style={styles.labeltext}>{this.rpmText(this.state.toggleSpeed)}</Text>
            <TextInput 
              keyboardType='numeric'
              returnKeyType={ "done" }
              numberOfLines={1}
              textAlign={'center'}
              editable
              underlineColorAndroid='transparent'
              maxLength={3}
              onChangeText={this.onChanged(this.getSpeedKey(this.state.toggleSpeed))}
              style={styles.textInput}
              value={this.state[this.getSpeedKey(this.state.toggleSpeed)]}
            />
          </View>
          <View style={sharedStyles.pageItems}>
            <Text style={styles.labeltext}>{'Delay (sec.)'}</Text>
            <TextInput
              keyboardType='numeric'
              returnKeyType={ "done" }
              textAlign={'center'}
              numberOfLines={1}
              editable
              underlineColorAndroid='transparent'
              maxLength={2}
              onChangeText={this.onChanged('delay')}
              style={styles.textInput}
              value={this.state.delay}
            />
          </View>
        </View>
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.button(this.state.loading)}
          onPress={this.submitPress}
          disabled={this.state.loading}
        >
          <Text style={styles.buttonText(this.state.loading)}>Start</Text>
        </TouchableOpacity>
      </View>
    );
  }
}