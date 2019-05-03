import React from 'react';
import Routes from './src/components/Routes';
import { YellowBox, View } from 'react-native';

export default class App extends React.Component {
  render() {
    console.disableYellowBox = true;
    // const _XHR = GLOBAL.originalXMLHttpRequest || GLOBAL.XMLHttpRequest?
    //   GLOBAL.originalXMLHttpRequest :
    //   GLOBAL.XMLHttpRequest

    // XMLHttpRequest = _XHR
    return (
      <View style={{ flex: 1, alignContent: "center", justifyContent: "center" }}>
        <Routes />
      </View>
    )
  }
}

