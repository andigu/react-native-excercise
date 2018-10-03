import React from 'react';
import {Animated, Dimensions, StyleSheet, View} from "react-native";
import {Color, Font} from "./constants";


const timeChoiceHeight = 40;
const {width: windowWidth} = Dimensions.get('window');

export default ({times, animatedValues: {native, nonNative}, onChange}) => {
    const [inputRange, outputRange] = generateInterpolateRanges(times, timeChoiceHeight);
    const highlightBackground = nonNative.interpolate({
        inputRange,
        outputRange,
        extrapolate: 'clamp'
    });
    return (
        <Animated.ScrollView showsVerticalScrollIndicator={false}
                             onMomentumScrollEnd={({nativeEvent: {contentOffset: {y}}}) => {
                                 onChange(Math.round(y / timeChoiceHeight));
                             }}
                             snapToInterval={timeChoiceHeight}
                             decelerationRate="fast"
                             bounces={false}
                             onScroll={Animated.event([{nativeEvent: {contentOffset: {y: native}}}], {useNativeDriver: true})}
                             scrollEventThrottle={1}>
            <Animated.View
                style={[Styles.timeHighlightContainer, {transform: [{translateY: native}]}]}
                pointerEvents='none'>
                <Animated.View style={{flex: 1, backgroundColor: highlightBackground}}/>
            </Animated.View>
            <View style={Styles.timeContainer}/>
            {times.map(({time, disabled}, j) => (
                <View key={j} style={Styles.timeContainer}>
                    <Animated.Text
                        style={[Styles.timeText, disabled ? Styles.disabledTimeText : {
                            color: nonNative.interpolate({
                                inputRange: [(j - 0.5) * 40, j * 40, (j + 0.5) * 40],
                                outputRange: ['#fff', Color.primaryDarker, '#fff']
                            })
                        }]}>
                        {time}
                    </Animated.Text>
                </View>
            ))}
            <View style={{height: 107.5}}/>
        </Animated.ScrollView>
    )
}

function generateInterpolateRanges(times, heightMultiple) {
    const input = [];
    const output = [];
    for (let i = 0; i < times.length; i++) {
        if (!times[i].disabled) {
            input.push(i * heightMultiple);
            output.push(Color.action)
        } else {
            input.push((i - 0.75) * heightMultiple);
            output.push(Color.action);
            input.push(i * heightMultiple);
            output.push('rgba(0,0,0,0.25)');
            if (!(i === times.length - 1) && !times[i + 1].disabled) {
                input.push((i + 0.75) * heightMultiple);
                output.push(Color.action);
            }
        }
    }
    return [input, output]
}


const Styles = StyleSheet.create({
    timeContainer: {
        height: 40,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    },
    timeText: {
        ...Font.medium,
        fontSize: 15,
        color: "#fff",
    },
    disabledTimeText: {
        color: Color.primaryLight
    },
    timeHighlightContainer: {
        height: timeChoiceHeight,
        width: windowWidth,
        position: 'absolute',
        top: timeChoiceHeight,
    },
});