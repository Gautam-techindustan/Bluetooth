import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    TouchableHighlight,
    NativeAppEventEmitter,
    NativeEventEmitter,
    NativeModules,
    Platform,
    PermissionsAndroid,
    ListView,
    ScrollView,
    AppState,
    Dimensions,
    Alert,
    Image
} from 'react-native'
import { Button } from 'native-base';
import BleManager from "react-native-ble-manager";
import arraybuffer from "arraybuffer-to-string";
import axios from 'axios'
import { stringToBytes } from "convert-string";

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);


class BluetoothConnect extends Component {
    constructor() {
        super();

        this.state = {
            device: "",
            finalHeight: "10",
            appState: "",
            connected: false,
            peripherals: null
        };

        this.handleUpdateValueForCharacteristic = this.handleUpdateValueForCharacteristic.bind(this);
        this.handleDisconnectedPeripheral = this.handleDisconnectedPeripheral.bind(this);
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
        this.setState({ device: data[0], peripherals: data[1] })
    }

    handleAppStateChange(nextAppState) {
        if (
            this.state.appState.match(/inactive|background/) &&
            nextAppState === "active"
        ) {
            console.log("App has come to the foreground!");
            BleManager.getConnectedPeripherals([]).then(peripheralsArray => {
                console.log("Connected peripherals: " + peripheralsArray.length);
            });
        }
        this.setState({ appState: nextAppState });
    }

    componentWillUnmount() {
        this.handlerDisconnect.remove();
        this.handlerUpdate.remove();
    }

    handleDisconnectedPeripheral(data) {
        let peripheral = this.state.peripherals;
        if (peripheral) {
            peripheral.connected = false;
            this.setState({ peripherals: null }, () => this.props.navigation.navigate("Homepage"));
        }
        console.log("Disconnected from " + data.peripheral);
    }
    handleUpdateValueForCharacteristic(data) {
        console.log(
            "Received data from " +
            data.peripheral +
            " characteristic " +
            data.characteristic,
            data.value
        );
    }

    goBack = () => {
        this.props.navigation.navigate("Homepage");
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
                let bodyFormData = new FormData();
                bodyFormData.append('data', JSON.stringify(data1));

                axios({
                    method: 'post',
                    url: 'http://devskart.com/bluetooth/index.php',
                    data: bodyFormData
                })
                    .then(function (response) {
                        Alert.alert("Data sent successfully");
                        console.log(response, "api response");
                    })
                    .catch(function (error) {
                        Alert.alert("please try again");
                        console.log(error, "api eror");
                    });

                console.log("dataaaaaaa ==", data1);
                this.setState({
                    finalHeight: data1
                });

            })
            .catch(error => {
                // Failure code
                console.log("dataaa", error);
            });
    }

    disconnect = () => {
        const { device } = this.state;
        BleManager.disconnect(device.id);
    }

    render() {
        const { finalHeight } = this.state;
        return (
            <React.Fragment>
                <View style={styles.container}>
                    <View style={styles.logo}>
                        <Image style={{
                            height: 165,
                            width: 200
                        }} source={require("../assets/last.png")} />
                    </View>
                    <View style={styles.Data}>
                        {true ?
                            (<View >
                                <View style={{ marginLeft: 10, justifyContent: "center", height: 100, width: 100, borderRadius: 50, borderColor: "black", borderWidth: 5 }}>
                                    <Text style={{ textAlign: "center", width: "100%", fontSize: 30 }}>
                                        {finalHeight}
                                    </Text>
                                </View>
                            </View>) : null
                        }
                    </View>
                    <View style={styles.upperTabs}>
                        <Button style={styles.buttonClass} onPress={this.recieveData} >
                            <Text style={styles.recievedData}>Recieve</Text>
                        </Button>
                        <Button style={styles.buttonClass} >
                            <Text style={styles.recievedData}>Disconnect </Text>
                        </Button>
                    </View>
                </View>

            </React.Fragment>
        );
    }
}

export default BluetoothConnect;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ddf0fd",
        alignContent: "center",
        justifyContent: "center",
        alignItems: "center",
    },
    upperTabs: {
        display: "flex",
        marginBottom: 20,
        alignContent: "center",
        justifyContent: "center",
        alignItems: "center"
    },
    Data: {
        display: "flex",
        flex: 1
    },
    logo: {
        display: "flex",
        flex: 1,
        paddingTop: 10
    },
    buttonClass: {
        marginTop: 20,
        width: 300,
        textAlign: "center",
    },
    recievedData: {
        flex: 1,
        alignItems: "center",
        color: "#fff",
        textAlign: "center",

    },
});