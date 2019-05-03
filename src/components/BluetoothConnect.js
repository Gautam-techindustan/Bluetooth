import React, { Component } from 'react';
import {
    Text,
    Button,
    NativeModules,
} from 'react-native'
import BleManager from "react-native-ble-manager";
import arraybuffer from "arraybuffer-to-string";
import { stringToBytes } from "convert-string";

const window = Dimensions.get("window");
const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);


class BluetoothConnect extends Component {
    constructor() {
        super();

        this.state = {
            device: "",
            finalHeight: ""
        };

        this.handleUpdateValueForCharacteristic = this.handleUpdateValueForCharacteristic.bind(
            this
        );
        this.handleDisconnectedPeripheral = this.handleDisconnectedPeripheral.bind(
            this
        );
        this.handleAppStateChange = this.handleAppStateChange.bind(this);
    }


    componentDidMount() {
        this.handlerDisconnect = bleManagerEmitter.addListener(
            "BleManagerDisconnectPeripheral",
            this.handleDisconnectedPeripheral
        );
        this.handlerUpdate = bleManagerEmitter.addListener(
            "BleManagerDidUpdateValueForCharacteristic",
            this.handleUpdateValueForCharacteristic
        );

        let data = JSON.parse(this.props.navigation.getParam("item"));
        console.log(data, "data after connected ");
        this.setState({ device: data })
    }

    goBack = () => {
        this.props.navigation.navigate("Homepage");
    }

    sendData = () => {
        return
    }

    recieveData = () => {
        let { device } = this.state;
        let service = device.characteristics[4].service;
        let characteristic = device.characteristics[4].characteristic;

        BleManager.read(device.id, service, characteristic)
            .then(readData => {
                // Success code
                // console.log('Read: ' + readData);

                let buffer = new Uint8Array(readData);

                let data1 = arraybuffer(buffer);
                console.log("dataaaaaaa ==", data1);

                if (data1) {
                    this.setState({
                        finalHeight: data1
                    });
                }
            })
            .catch(error => {
                // Failure code
                console.log("dataaa", error);
            });

    }

    render() {
        const { finalHeight } = this.props;
        return (
            <React.Fragment>
                {
                    finalHeight ? <Text
                        style={{ flex: 1, justifyContent: "center", alignSelf: "center" }}
                    >
                        Recieving data is {finalHeight}
                    </Text> : null}

                <Button title="Send" onPress={this.sendData} ></Button>
                <Button title="Recieve data" onPress={this.recieveData} ></Button>
                <Text>hbguyh </Text>
                <Button title="Go Back" onPress={this.goBack} ></Button>
            </React.Fragment>
        );
    }
}

export default BluetoothConnect;