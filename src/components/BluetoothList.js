import React, { Component } from "react";
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Button,
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
  Image
} from "react-native";
import BleManager from "react-native-ble-manager";
import arraybuffer from "arraybuffer-to-string";
import { stringToBytes } from "convert-string";

const window = Dimensions.get("window");
const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

export default class BluetoothList extends Component {
  constructor() {
    super();

    this.state = {
      finalHeight: "",
      scanning: false,
      peripherals: new Map(),
      appState: "",
      toggle: false,
      device: "",
      connected: false
    };

    this.handleDiscoverPeripheral = this.handleDiscoverPeripheral.bind(this);
    this.handleStopScan = this.handleStopScan.bind(this);
    this.handleUpdateValueForCharacteristic = this.handleUpdateValueForCharacteristic.bind(
      this
    );
    this.handleDisconnectedPeripheral = this.handleDisconnectedPeripheral.bind(
      this
    );
    this.handleAppStateChange = this.handleAppStateChange.bind(this);
  }

  componentDidMount() {
    this.initialStage();
    this.startScan();
  }

  initialStage = () => {
    AppState.addEventListener("change", this.handleAppStateChange);

    BleManager.start({
      showAlert: false
      // forceLegacy: false
    });

    this.handlerDiscover = bleManagerEmitter.addListener(
      "BleManagerDiscoverPeripheral",
      this.handleDiscoverPeripheral
    );
    this.handlerStop = bleManagerEmitter.addListener(
      "BleManagerStopScan",
      this.handleStopScan
    );
    this.handlerDisconnect = bleManagerEmitter.addListener(
      "BleManagerDisconnectPeripheral",
      this.handleDisconnectedPeripheral
    );
    this.handlerUpdate = bleManagerEmitter.addListener(
      "BleManagerDidUpdateValueForCharacteristic",
      this.handleUpdateValueForCharacteristic
    );

    if (Platform.OS === "android" && Platform.Version >= 23) {
      PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
      ).then(result => {
        if (result) {
          console.log("Permission is OK");
        } else {
          PermissionsAndroid.requestPermission(
            PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
          ).then(result => {
            if (result) {
              console.log("User accept");
            } else {
              console.log("User refuse");
            }
          });
        }
      });
    }
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
    this.handlerDiscover.remove();
    this.handlerStop.remove();
    this.handlerDisconnect.remove();
    this.handlerUpdate.remove();
  }

  handleDisconnectedPeripheral(data) {
    let peripherals = this.state.peripherals;
    console.log(peripherals, "disconnect");


    let peripheral = peripherals.get(data.peripheral);

    console.log(peripheral, "disconnect>>>>>>");
    if (peripheral) {
      peripheral.connected = false;
      peripherals.set(peripheral.id, peripheral);
      this.setState({ peripherals });
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

  handleStopScan() {
    console.log("Scan is stopped");
    this.setState({ scanning: false });
  }

  startScan() {
    console.log("start scan")
    BleManager.enableBluetooth();
    if (!this.state.scanning) {
      this.setState({ peripherals: new Map() });
      BleManager.scan([], 5, false, scanOptions = { scanMode: 1, matchMode: 2 }).then(results => {
        console.log("Scanning...");
        this.setState({ scanning: true });
      });
    }
  }

  handleDiscoverPeripheral(peripheral) {
    var peripherals = this.state.peripherals;
    if (!peripherals.has(peripheral.id)) {
      console.log("Got ble peripheral", peripheral);
      peripherals.set(peripheral.id, peripheral);
      this.setState({ peripherals });
    }
  }

  setdevice = () => {
    let { device } = this.state;
    let service = device.characteristics[4].service;
    let characteristic = device.characteristics[4].characteristic;

    let val = "set";
    let data = stringToBytes(val);

    BleManager.write(device.id, service, characteristic, data)
      .then(() => {
        // Success code
        console.log("Write: " + data);

        BleManager.read(device.id, service, characteristic)
          .then(readData => {
            // Success code
            // console.log('Read: ' + readData);

            let buffer = new Uint8Array(readData);

            arraybuffer(buffer);
            console.log("setdevice data ==", arraybuffer(buffer));
          })
          .catch(error => {
            // Failure code
            console.log("dataaa", error);
          });
      })
      .catch(error => {
        // Failure code
        console.log(error);
      });
  };

  calculate = () => {
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

  };

  togle = () => {
    this.setState({ toggle: !this.state.toggle });
  };

  test(peripheral) {
    if (peripheral) {

      if (peripheral.connected) {
        BleManager.disconnect(peripheral.id);
        this.setState({ connected: false });
      } else {
        BleManager.connect(peripheral.id)
          .then(async () => {
            let peripherals = this.state.peripherals;
            let p = peripherals.get(peripheral.id);
            if (p) {
              p.connected = true;
              peripherals.set(peripheral.id, p);
              this.setState({ peripherals });
            }
            console.log("Connected to " + peripheral.id);
            // console.log(peripheral,"peripheral dataaaaaaaaaaaaaaa");
            // 
            setTimeout(async () => {
              BleManager.retrieveServices(peripheral.id)
                .then(peripheralInfo => {
                  console.log(peripheralInfo, "<<");

                  var service = peripheralInfo.characteristics[4].service;
                  var characteristic =
                    peripheralInfo.characteristics[4].characteristic;
                  console.log("id >", peripheralInfo);
                  let updatedData = [peripheralInfo, p]
                  this.setState({ device: peripheralInfo, connected: true }, () =>
                    this.props.navigation.navigate("BluetoothConnect", { item: JSON.stringify(updatedData) }));

                  BleManager.read(peripheral.id, service, characteristic)
                    .then(readData => {
                      let buffer = new Uint8Array(readData);

                      let data2 = arraybuffer(buffer);
                      console.log("data ==", arraybuffer(buffer));
                      if (data2) {
                        this.setState({
                          finalHeight: data2
                        });
                      }
                    })
                    .catch(error => {
                      // Failure code
                      console.log(error);
                    });

                })
                .catch(err => console.log(err));
            }, 200);
          })
          .catch(error => {
            console.log("Connection error", error);
          });
      }
    }
  }

  render() {
    const list = Array.from(this.state.peripherals.values());
    const dataSource = ds.cloneWithRows(list);
    let scan = this.state.scanning ? "#8addd5" : "#ff92be";

    return (
      <View style={styles.container}>
        <View style={styles.logo}>
          <Image style={{ height: 81, width: 150, paddingTop: 10 }} source={require("../assets/logo.png")} />
        </View>
        <View style={styles.list}>
          {!this.state.scanning ? (
            <ScrollView style={styles.scroll}>
              {list.length == 0 && (
                <View style={{ flex: 1, margin: 20 }}>
                  <Text style={{ textAlign: "center" }}>No peripherals</Text>
                </View>
              )}
              <ListView
                enableEmptySections={true}
                dataSource={dataSource}
                renderRow={item => {
                  const color = item.connected ? "#a0ffbe" : "#fff";
                  return (
                    <View>
                      <View
                        style={{
                          backgroundColor: color,
                          borderRadius: 10,
                          margin: 5,
                          elevation: 7
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignContent: "center"
                          }}
                        >
                          <View style={{ flexDirection: "row" }}>
                            <Text
                              style={{
                                fontSize: 15,
                                color: "#333333",
                                padding: 10
                              }}
                            >
                              {item.name != null ? item.name : "n/a"}
                            </Text>
                          </View>
                          <TouchableHighlight
                            underlayColor="green"
                            // style={{ padding: 10, color: "green" }}
                            onPress={() => this.test(item)}
                          >
                            <View
                              style={{
                                backgroundColor: "green",
                                padding: 5,
                                borderRadius: 50,
                                width: 90
                              }}
                            >
                              <Text
                                style={{ color: "white", textAlign: "center" }}
                              >
                                {item.connected ? "Disconnect" : "Connect"}
                              </Text>
                            </View>
                          </TouchableHighlight>
                        </View>
                        <Text
                          style={{ fontSize: 8, color: "#333333", padding: 10 }}
                        >
                          {item.id}
                        </Text>
                      </View>
                    </View>
                  );
                }}
              />
            </ScrollView>
          ) : (
              <View style={styles.scroll}>
                <View style={{ flex: 1, margin: 20 }}>
                  <Text style={{ textAlign: "center" }}>Scanning...</Text>
                </View>
              </View>
            )}
        </View>
        <View style={{ flexDirection: "row", margin: 10 }}>
          <TouchableHighlight
            underlayColor="#8addd5"
            style={{
              padding: 20,
              backgroundColor: scan,
              width: "100%"
            }}
            onPress={() => this.startScan()}
          >
            <Text style={{ textAlign: "center", color: "white" }}>
              {this.state.scanning ? "Scanning..." : "Scan "}
            </Text>
          </TouchableHighlight>
        </View>


      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    width: window.width,
    height: window.height
  },
  logo: {
    justifyContent: "flex-start",
    alignContent: "center",
    alignItems: "center",
    paddingTop: 10
  },
  scroll: {
    flex: 1
  },
  row: {
    margin: 10
  },
  circle: {
    borderRadius: 50,
    width: 30,
    height: 30,
    padding: 5,
    alignSelf: "center",
    marginLeft: 5
  },
  buttons: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around"
  },
  button: {
    width: 50
  },
  list: {
    flex: 1,
    marginVertical: 5
  }
});
