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
            finalHeight: "",
            finalWeight:"",
            finalWaist:"",
            appState: "",
            connected: false,
            peripherals: null,
            time:null
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
        this.setState({ device: data[0], peripherals: data[1] },()=>{this.recieveData()})
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
        // let service = device.characteristics[4].service;
        // let characteristic = device.characteristics[4].characteristic;
        let time= setInterval(() => {
            BleManager.read(device.id, "497cb1f5-5703-4ca6-8dd8-5cd7230af887", "b8b5fe4f-0228-4250-a56c-f36d73397960")
            .then(readData => {
                let buffer = new Uint8Array(readData);
                let data1 = arraybuffer(buffer);
                // let bodyFormData = new FormData();
                // bodyFormData.append('data', JSON.stringify(data1));
                
                    // axios({
                    //     method: 'post',
                    //     url: 'http://devskart.com/bluetooth/index.php',
                    //     data: bodyFormData
                    // })
                    //     .then(function (response) {
                    //         // Alert.alert("Data sent successfully");
                    //         console.log(response, "api response");
                    //     })
                    //     .catch(function (error) {
                    //         // Alert.alert("please try again");
                    //         console.log(error, "api eror");
                    //     });

                    console.log("dataaaaaaa ==", data1);
                    this.setState({
                        finalHeight: data1
                    });
            })
            .catch(error => {
                // Failure code
                console.log("dataaa", error);
            });

            BleManager.read(device.id, "497cb1f5-5703-4ca6-8dd8-5cd7230af887", "2bc693c9-b68b-4e4d-8a65-80c980fa4c23")
            .then(readData => {
                let buffer = new Uint8Array(readData);
                let data1 = arraybuffer(buffer);

                    console.log("dataaaaaaa ==", data1);
                    this.setState({
                        finalWeight: data1
                    });
            })
            .catch(error => {
                // Failure code
                console.log("dataaa", error);
            });

            BleManager.read(device.id, "497cb1f5-5703-4ca6-8dd8-5cd7230af887", "9907b924-1686-49c0-afe9-ab809949ff05")
            .then(readData => {
                let buffer = new Uint8Array(readData);
                let data1 = arraybuffer(buffer);

                    console.log("dataaaaaaa ==", data1);
                    this.setState({
                        finalWaist: data1
                    });
            })
            .catch(error => {
                // Failure code
                console.log("dataaa", error);
            });

            const {finalHeight = "",finalWaist = "",finalWeight = ""} =this.state;
            let bodyFormData = new FormData();
            bodyFormData.append('data', JSON.stringify({length:finalHeight ,weight:finalWeight ,waist:finalWaist }));            
                axios({
                    method: 'post',
                    url: 'http://devskart.com/bluetooth/index.php',
                    data: bodyFormData
                })
                    .then(function (response) {
                        console.log(response, "api response");
                    })
                    .catch(function (error) {
                        console.log(error, "api eror");
                    });
        }, 1000);

        this.setState({
            time:time
        })
    }

    disconnect = () => {
        const { device,time } = this.state;
        clearInterval(time);
        BleManager.disconnect(device.id);
    }

    render() {
        const { finalHeight ,finalWeight,finalWaist } = this.state;
        return (
            <React.Fragment>
                <View style={styles.container}>
                    <View style={styles.logo}>
                        <Image style={{
                            height: 143,
                            width: 200
                        }} source={require("../assets/last.png")} />
                    </View>
                    <View style={styles.Data}>
                        <View  style={{flexDirection:"row"}} >
                            <View style={{ marginLeft: 10, justifyContent: "center", height: 100, width: 100, borderRadius: 50, borderColor: "rgba(255,00,00,0.8)", borderWidth: 15 }}>
                                <Text style={{ textAlign: "center", width: "100%", fontSize: 30 }}>
                                    {finalHeight}
                                </Text>
                                <Text style={{ textAlign: "center", paddingLeft: 10, paddingTop: 100 }}>length </Text>
                            </View>
                            
                            <View style={{ marginLeft: 10, justifyContent: "center", height: 100, width: 100, borderRadius: 50, borderColor: "rgba(255,00,00,0.8)", borderWidth: 15 }}>
                                <Text style={{ textAlign: "center", width: "100%", fontSize: 30 }}>
                                    {finalWeight}
                                </Text>
                                <Text style={{ textAlign: "center", paddingLeft: 10, paddingTop: 100 }}>Weight </Text>
                            </View>
                            <View style={{ marginLeft: 10, justifyContent: "center", height: 100, width: 100, borderRadius: 50, borderColor: "rgba(255,00,00,0.8)", borderWidth: 15 }}>
                                <Text style={{ textAlign: "center", width: "100%", fontSize: 30 }}>
                                    {finalWaist}
                                </Text>
                                <Text style={{ textAlign: "center", paddingLeft: 10, paddingTop: 100 }}>Waist </Text>
                            </View>

                        </View>
                       
                    </View>
                    <View style={styles.upperTabs}>
                        {/* <TouchableHighlight
                            underlayColor="#ff92be"
                            style={styles.buttonClass}
                            onPress={this.recieveData}
                        >
                            <Text style={styles.recievedData}>Receive</Text>
                        </TouchableHighlight> */}
                        <TouchableHighlight
                            underlayColor="#ff92be"
                            style={styles.buttonClass}
                            onPress={this.disconnect}
                        >
                            <Text style={styles.recievedData}>Disconnect </Text>
                        </TouchableHighlight>
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
        backgroundColor: "#fff",
        alignContent: "center",
        justifyContent: "center",
        alignItems: "center",
    },
    upperTabs: {
        display: "flex",
        flex:1,
        marginBottom: 20,
        alignContent: "center",
        justifyContent: "center",
        alignItems: "center"
    },
    Data: {
        display: "flex",
        flex: 1,
        textAlign: "center"
    },
    logo: {
        display: "flex",
        flex: 1,
        paddingTop: 10
    },
    buttonClass: {
        marginTop: 20,
        width: 300,
        padding: 20,
        backgroundColor: "#ff92be"
    },
    recievedData: {
        // color: "#fff",
        textAlign: "center",

    },
});