import React, { Component } from 'react';
import { View, Image, Text } from 'react-native';
import BikeStartPage from './BikeStartPage'
import BikeDisplayPage from './BikeDisplayPage'
import {
  BACKGROUND_COLOR,
  USE_SPEED_KEY,
  RPM_VALUE_KEY,
  BIKE_SPEED_VALUE_KEY,
  SERVER_URL,
  URL_KEY,
  DELAY_KEY
} from './constants'
import { retrieveData, storeData } from './storage'

const styles = {
  headerImage: {
    flex: 1,
    height: 60,
    marginRight: 20,
  },
  headerText: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
    marginLeft: 20,
    fontSize: 30,
    fontStyle: 'italic',
    textShadowOffset: {
      width: 1,
      height: 1,
    },
  },
  headerSeperator: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'lightgrey',
  },
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
}

const rpmDefault = '90'
const bikeSpeedDefault = '16'
const delayDefault = '1'
const useSpeedDefault = false

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      rpm: rpmDefault,
      bikeSpeed: bikeSpeedDefault,
      delay: delayDefault,
      started: false,
      toggleSpeed: useSpeedDefault,
      localUrl: SERVER_URL,
    };
  }

  async componentWillMount() {
    const storedRpm = await retrieveData(RPM_VALUE_KEY, rpmDefault)
    const storedBikeSpeed = await retrieveData(BIKE_SPEED_VALUE_KEY, bikeSpeedDefault)
    const storedDelay = await retrieveData(DELAY_KEY, delayDefault)
    const useSpeed = await retrieveData(USE_SPEED_KEY, useSpeedDefault)
    const localUrl = await retrieveData(URL_KEY, SERVER_URL)

    this.setState({
      rpm: storedRpm,
      bikeSpeed: storedBikeSpeed,
      delay: storedDelay,
      toggleSpeed: useSpeed,
      localUrl,
    })
  }

  updateState = globalState => {
    const { rpm, bikeSpeed, delay, started, toggleSpeed, localUrl } = globalState
    if (rpm) {
      storeData(RPM_VALUE_KEY, rpm)
    }
    if (bikeSpeed) {
      storeData(BIKE_SPEED_VALUE_KEY, bikeSpeed)
    }
    if (delay) {
      storeData(DELAY_KEY, delay)
    }
    if (toggleSpeed) {
      storeData(USE_SPEED_KEY, toggleSpeed)
    }
    if (localUrl) {
      storeData(URL_KEY, localUrl)
    }

    this.setState(globalState)
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.headerSeperator}>
          <Text style={styles.headerText}>{'Bike + TV'}</Text>
          <Image style={styles.headerImage} resizeMode={'contain'} source={require('./logo.png')} />
        </View>
        { 
          this.state.started ?
            <BikeDisplayPage 
              updateState={this.updateState}
              rpm={this.state.rpm}
              bikeSpeed={this.state.bikeSpeed}
              delay={this.state.delay}
              toggleSpeed={this.state.toggleSpeed}
              localUrl={this.state.localUrl}
            />
          :
            <BikeStartPage 
              updateState={this.updateState}
              rpm={this.state.rpm}
              bikeSpeed={this.state.bikeSpeed}
              delay={this.state.delay}
              toggleSpeed={this.state.toggleSpeed}
              localUrl={this.state.localUrl}
            />
        }
      </View>
    );
  }
}
