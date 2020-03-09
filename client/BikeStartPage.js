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
  ScrollView,
  View
} from 'react-native';
import SpeedExample from './SpeedExample';
import { BACKGROUND_COLOR } from './constants'
import fetchWithTimeout from './fetchWithTimeout'
import getUrlWithPort from './localUrl'
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
    flex: 1,
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
    flex: 6,
    marginHorizontal: 30,
  },
  switchContainer: {
    ...sharedStyles.pageItems,
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
    flex: 1,
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
    paddingLeft: 20,
  }),
  switchOptionsRight: toggled => ({
    ...sharedStyles.switchOptions(toggled),
    textAlign: 'right',
    paddingRight: 20,
  }),
  switchWrapper: {
    flex: 1,
    paddingLeft: 30,
    alignItems: 'center',
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
      localUrl: props.localUrl,
      setUrl: props.localUrl,
    };
  }

  onChangeIntegerInput = stateKey => text => {
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

  onChangeIpAddress = text => {
    const ipRegex = 
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/

    if (text.match(ipRegex)) {
      this.setState({ 
        localUrl: text,
        setUrl: text,
      })
    } else {
      this.setState({ setUrl: text })
    }
  }

  clearServer = async () => {
    return await fetchWithTimeout(getUrlWithPort(this.state.localUrl) + '/clear', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
    .then(() => true)
    .catch(error => {
      console.log(error)
      return false
    })
  }

  loadingEvent = event => {
    if (loadingTimer) {
      clearTimeout(loadingTimer)
    }

    if (event.finished) {
      this.props.updateState({
        rpm: this.state.rpm,
        bikeSpeed: this.state.bikeSpeed,
        delay: this.state.delay,
        started: true,
        toggleSpeed: this.state.toggleSpeed,
      })
    } else {
      this.setState({
        loading: false,
      })
      SpeedExample.stopAndroid()
    }

  }

  updateSwitch = toggleSpeed => {
    this.setState({
      toggleSpeed
    })
  }

  cancelLoad = () => {
    if (loadingTimer) {
      clearTimeout(loadingTimer)
    }
    console.warn('canceled android')
    SpeedExample.stopAndroid()
  }

  submitPress = async () => {
    this.setState({
      loading: true,
    })
    const result = await this.clearServer()
    if (result) {
      loadingTimer = setTimeout(this.cancelLoad, 30000)
      SpeedExample.startAndroid(this.state.toggleSpeed)
    } else {
      SpeedExample.sendToast('Something went wrong with connecting to the server')
      this.setState({
        loading: false,
      })
    }
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


  componentDidMount() {
    if (loadingTimer) {
      clearTimeout(loadingTimer)
    }
    this.setState({
      loading: false,
    })
    const subscriptionDefinitions = [
      { name: 'loadingFinishedEvent', callback: this.loadingEvent },
    ]

    subscriptionDefinitions.map(subscription => {
      const newSubscription = DeviceEventEmitter.addListener(subscription.name, subscription.callback)
      subscriptions.push(newSubscription)
    })
  }

  componentWillUnmount() {
    if (loadingTimer) {
      clearTimeout(loadingTimer)
    }
    subscriptions.map(subscription => {
      subscription.remove()
    })
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
        <ScrollView style={styles.inputContainer}>
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
              onChangeText={this.onChangeIntegerInput(this.getSpeedKey(this.state.toggleSpeed))}
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
              onChangeText={this.onChangeIntegerInput('delay')}
              style={styles.textInput}
              value={this.state.delay}
            />
          </View>
          <View style={sharedStyles.pageItems}>
            <Text style={styles.labeltext}>{'Url'}</Text>
            <TextInput
              returnKeyType={ "done" }
              textAlign={'center'}
              keyboardType='numeric'
              numberOfLines={1}
              editable
              underlineColorAndroid='transparent'
              maxLength={15}
              onChangeText={this.onChangeIpAddress}
              style={styles.textInput}
              value={this.state.setUrl}
            />
          </View>
        </ScrollView>
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