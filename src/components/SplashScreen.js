import React from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    Image
} from "react-native";


class SplashScreen extends React.Component {
    state = {}

    componentDidMount() {
        setTimeout(() => {
            this.props.navigation.navigate("Homepage")
        }, 2000)
    }

    render() {
        return (
            <View style={styles.container} >
                <Image style={styles.logo} source={require("../assets/logo.png")} />
            </View>
        );
    }
}

export default SplashScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignContent: "center",
        justifyContent: "center",
        alignItems: "center",
    },
    logo: {
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
        height: 108,
        width: 200
    },
});