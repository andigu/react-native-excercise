import React from 'react';
import {Animated, Dimensions, StyleSheet, TouchableOpacity, View} from "react-native";
import {Color, Font} from "./constants";


const dateWidthRatio = 9 / 25;
const {width: windowWidth} = Dimensions.get('window');

export default ({dates, animatedValues: {native, nonNative}, scrollTo}) => {
    return (
        <Animated.View
            style={[Styles.dates, {transform: [{translateX: Animated.multiply(native, 1 - dateWidthRatio)}]}]}>
            <View style={{width: (1 - dateWidthRatio) / 2 * windowWidth}}/>
            {dates.map(({header, date}, i) => {
                    const textColor = nonNative.interpolate({
                        inputRange: [(i - 1) * windowWidth, i * windowWidth, (i + 1) * windowWidth],
                        outputRange: ['#fff', Color.action, '#fff']
                    });
                    return <TouchableOpacity style={Styles.dateContainer} key={i}
                                             onPress={() => scrollTo(i * windowWidth)}>
                        <Animated.Text style={[Styles.dateHeader, {color: textColor}]}>
                            {header}
                        </Animated.Text>
                        <Animated.Text style={[Styles.dateText, {color: textColor}]}>
                            {date}
                        </Animated.Text>
                    </TouchableOpacity>
                }
            )}
        </Animated.View>
    )
}


const Styles = StyleSheet.create({
    datesContainer: {flexDirection: 'row'},
    dateContainer: {
        width: dateWidthRatio * windowWidth,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 5,
        paddingBottom: 15
    },
    dates: {
        flexDirection: 'row', backgroundColor: Color.primary
    },
    dateHeader: {
        ...Font.medium,
        fontSize: 18,
        color: "#fff"
    },
    dateText: {
        ...Font.regular,
        color: "#fff",
        fontSize: 12
    },
});
