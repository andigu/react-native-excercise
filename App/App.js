import * as React from "react";
import {SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import data from "./data"

import {Color, Font} from "./constants";
import ScheduleSelector from "./ScheduleSelector";

const Button = ({onPress, children, ...props}) => {
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.9} {...props}>
            <SafeAreaView style={Styles.ButtonRoot}>
                <View style={Styles.ButtonInner}>
                    <Text style={Styles.ButtonLabel}>{children}</Text>
                </View>
            </SafeAreaView>
        </TouchableOpacity>
    );
};

class App extends React.Component {
    state = {
        dateIndex: 0,
        timeIndex: 0
    };

    render() {
        return (
            <View style={Styles.Container}>
                <StatusBar barStyle="light-content"/>
                <View style={Styles.Header}>
                    <Text style={Styles.HeaderText}>
                        <Text>{`You have selected ${data.slots[this.state.dateIndex].date}, ${data.slots[this.state.dateIndex].times[this.state.timeIndex].time}`}</Text>
                    </Text>
                </View>
                <View style={Styles.Body}>
                    <ScheduleSelector slots={data.slots} onChange={({date: dateIndex, time: timeIndex}) => {
                        console.log(dateIndex, timeIndex);
                        this.setState({dateIndex, timeIndex})
                    }}/>
                </View>
                <View style={Styles.Footer}>
                    <Button style={Styles.Button}>Next</Button>
                </View>
            </View>
        );
    }
}

const Styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: Color.primary
    },
    Header: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    },
    Footer: {},
    Body: {
        height: 248,
        backgroundColor: "red",
        alignItems: "center",
        justifyContent: "center"
    },
    HeaderText: {
        ...Font.regular,
        color: "#fff",
        textAlign: "center",
        maxWidth: 320
    },
    ButtonRoot: {
        backgroundColor: Color.action
    },
    ButtonInner: {
        height: 56,
        alignItems: "center",
        justifyContent: "center"
    },
    ButtonLabel: {
        ...Font.medium,
        color: Color.primary,
        fontSize: 18
    }
});

export default App;
