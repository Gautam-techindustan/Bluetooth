import React, { Component } from "react";
import {
  createSwitchNavigator,
  createAppContainer,
  createBottomTabNavigator,
  createStackNavigator,
} from "react-navigation";

import { Text, View, TouchableOpacity, Image, YellowBox } from "react-native";
import {
  Homepage,
  BluetoothConnect,
  BluetoothList,
  SplashScreen
} from './'


const mainNav = createSwitchNavigator({
  SplashScreen: SplashScreen,
  Homepage: Homepage,
  BluetoothList: BluetoothList,
  BluetoothConnect: BluetoothConnect,

});
const Routes = createAppContainer(mainNav);

export default class extends Component {
  render() {
    return (
      <View style={{ flex: 1, fontFamily: "Lato-LightItalic" }}>
        <Routes />
      </View>
    );
  }
}
