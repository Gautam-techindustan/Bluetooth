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
    BluetoothConnect
} from './'


const mainNav = createSwitchNavigator({
    BluetoothConnect : BluetoothConnect,
  Homepage: Homepage,

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
