import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    Image
} from "react-native";
import { Button } from 'native-base';

class Homepage extends Component {
    constructor() {
        super();

        this.state = {
            peripherals: new Map(),
        };

    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.logo}>
                    <Image style={{
                        height: 260,
                        width: 300
                    }} source={require("../assets/secondscreen.png")} />
                </View>
                <View style={styles.upperTabs}>
                    <Button style={styles.buttonClass} onPress={() => this.props.navigation.navigate("BluetoothList")} >
                        <Text style={styles.recievedData} >Get Started</Text>
                    </Button>
                </View>
            </View>);
    }
}

export default Homepage;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ddf0fd",
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
        marginTop: 10,
        width: 300,
        textAlign: "center",
    },
    recievedData: {
        flex: 1,
        alignItems: "center",
        color: "#fff",
        textAlign: "center"
    },
});