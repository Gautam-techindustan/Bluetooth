import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    Image,
    TouchableHighlight
} from "react-native";
import { Button } from 'native-base';
import BleManager from "react-native-ble-manager";


class Homepage extends Component {
    constructor() {
        super();

        this.state = {
            peripherals: new Map(),
        };
    }


    buttonPressed = () => {

        BleManager.enableBluetooth();
        this.props.navigation.navigate("BluetoothList")
    }



    render() {
        return (
            <View style={styles.container}>
                <View style={styles.logo}>
                    <Image style={{
                        height: 217,
                        width: 300
                    }} source={require("../assets/secondscreen.png")} />
                </View>
                <View style={styles.upperTabs}>

                    <TouchableHighlight
                        underlayColor="#ff92be"
                        style={styles.buttonClass}
                        onPress={this.buttonPressed}
                    >
                        <Text style={styles.recievedData} >Get Started</Text>
                    </TouchableHighlight>

                </View>
            </View>);
    }
}

export default Homepage;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignContent: "center",
        justifyContent: "flex-end",
        alignItems: "center",
    },
    logo: {
        flex: 1,
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",

    },
    upperTabs: {
        display: "flex",
        marginBottom: 20,
        alignContent: "center",
        justifyContent: "center",
        alignItems: "center"
    },
    buttonClass: {
        width: 300,
        padding: 20,
        backgroundColor: "#ff92be"
    },
    recievedData: {
        color: "#fff",
        textAlign: "center"
    },
});