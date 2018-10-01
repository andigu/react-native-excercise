import React from 'react';
import {Animated, Dimensions, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Color, Font} from "./constants";

const {width: windowWidth} = Dimensions.get('window');
const dateWidthRatio = 9 / 25;
const timeChoiceHeight = 40;

class ScheduleSelector extends React.Component {
    constructor(props) {
        super(props);
        this.nScrollX = new Animated.Value(0);
        this.scrollX = createNonNativeAnimated(this.nScrollX);
        this.nScrollYs = [];
        this.scrollYs = [];
        for (let i = 0; i < props.slots.length; i++) {
            this.nScrollYs.push(new Animated.Value(0));
            this.scrollYs.push(createNonNativeAnimated(this.nScrollYs[i]));
        }
        this.scrollRef = React.createRef();
        // Array of selected times, selectedTimes[i] holds the time selected on date[i]. Should NOT be in this.state (UI does not need to update on change)
        this.selectedTimes = new Array(props.slots.length).fill(0);
        // The index of of the currently selected date (i.e. today is 0, tomorrow is 1, etc.). Again no need to put this in this.state
        this.selectedDate = 0
    }

    dateTimeChange() {
        this.props.onChange({date: this.selectedDate, time: this.selectedTimes[this.selectedDate]})
    }

    render() {
        return (
            <View style={Styles.container}>
                <View style={Styles.divider}/>
                <Animated.ScrollView horizontal
                                     pagingEnabled
                                     onMomentumScrollEnd={e => {
                                         this.selectedDate = Math.round(e.nativeEvent.contentOffset.x/windowWidth);
                                         this.dateTimeChange()
                                     }}
                                     style={Styles.horizontalScrollContainer}
                                     showsHorizontalScrollIndicator={false}
                                     bounces={false}
                                     ref={this.scrollRef}
                                     onScroll={Animated.event([{nativeEvent: {contentOffset: {x: this.nScrollX}}}], {useNativeDriver: true})}
                                     scrollEventThrottle={1}>
                    <View>
                        <Animated.View
                            style={[Styles.dates, {transform: [{translateX: Animated.multiply(this.nScrollX, 1 - dateWidthRatio)}]}]}>
                            <View style={{width: (1 - dateWidthRatio) / 2 * windowWidth}}/>
                            {this.props.slots.map(({header, date}, i) => {
                                    const textColor = this.scrollX.interpolate({
                                        inputRange: [(i - 1) * windowWidth, i * windowWidth, (i + 1) * windowWidth],
                                        outputRange: ['#fff', Color.action, '#fff']
                                    });
                                    const scrollToDate = () => {
                                        this.scrollRef.current._component.scrollTo({
                                            x: i * windowWidth,
                                            y: 0,
                                            animated: true
                                        })
                                    };
                                    return <TouchableOpacity style={Styles.dateContainer} key={i} onPress={scrollToDate}>
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
                        <View style={{flexDirection: 'row', flex: 1}}>
                            {this.props.slots.map(({times}, i) => {
                                const [inputRange, outputRange] = generateInterpolateRanges(times, timeChoiceHeight);
                                const highlightBackground = this.scrollYs[i].interpolate({
                                    inputRange,
                                    outputRange,
                                    extrapolate: 'clamp'
                                });
                                return (
                                    <View style={{width: windowWidth}} key={i}>
                                        <Animated.ScrollView showsVerticalScrollIndicator={false}
                                                             onMomentumScrollEnd={e => {
                                                                 this.selectedTimes[this.selectedDate] = Math.round(e.nativeEvent.contentOffset.y/timeChoiceHeight);
                                                                 this.dateTimeChange();
                                                             }}
                                                             snapToInterval={timeChoiceHeight}
                                                             decelerationRate="fast"
                                                             bounces={false}
                                                             onScroll={Animated.event([{nativeEvent: {contentOffset: {y: this.nScrollYs[i]}}}], {useNativeDriver: true})}
                                                             scrollEventThrottle={1}>
                                            <Animated.View
                                                style={[Styles.timeHighlightContainer, {transform: [{translateY: this.nScrollYs[i]}]}]}
                                                pointerEvents='none'>
                                                <Animated.View style={{flex: 1, backgroundColor: highlightBackground}}/>
                                            </Animated.View>
                                            <View style={Styles.timeContainer}/>
                                            {times.map(({time, disabled}, j) => (
                                                <View key={j} style={Styles.timeContainer}>
                                                    <Animated.Text
                                                        style={[Styles.timeText, disabled ? Styles.disabledTimeText : {
                                                            color: this.scrollYs[i].interpolate({
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
                                    </View>
                                )
                            })}
                        </View>
                    </View>
                </Animated.ScrollView>
                <Animated.View style={Styles.dateUnderline} pointerEvents='none'/>

            </View>
        )
    }
}

function createNonNativeAnimated(animatedValue, init = 0) {
    const nonNative = new Animated.Value(init);
    animatedValue.addListener(Animated.event([{value: nonNative}], {useNativeDriver: false}));
    return nonNative;
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
    divider: {width: windowWidth, backgroundColor: Color.primaryDark, height: StyleSheet.hairlineWidth},
    horizontalScrollContainer: {flex: 1, backgroundColor: Color.primaryDarker},
    container: {maxWidth: windowWidth, backgroundColor: Color.primary},
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
    timeContainer: {
        height: 40,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    },
    timeChoicesContainer: {},
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
    dateUnderline: {
        height: 5,
        width: 0.35 * windowWidth,
        backgroundColor: Color.action,
        position: 'absolute',
        top: 55,
        alignSelf: 'center'
    }
});


export default ScheduleSelector;