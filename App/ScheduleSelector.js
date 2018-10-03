import React from 'react';
import {Animated, Dimensions, StyleSheet, View} from 'react-native';
import {Color} from "./constants";
import ScheduleTimes from "./ScheduleTimes";
import ScheduleDates from "./ScheduleDates";

const {width: windowWidth} = Dimensions.get('window');

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
        const {slots} = this.props;
        return (
            <View style={Styles.container}>
                <View style={Styles.divider}/>
                <Animated.ScrollView horizontal
                                     pagingEnabled
                                     onMomentumScrollEnd={({nativeEvent: {contentOffset: {x}}}) => {
                                         this.selectedDate = Math.round(x / windowWidth);
                                         this.dateTimeChange()
                                     }}
                                     style={Styles.horizontalScrollContainer}
                                     showsHorizontalScrollIndicator={false}
                                     bounces={false}
                                     ref={this.scrollRef}
                                     onScroll={Animated.event([{nativeEvent: {contentOffset: {x: this.nScrollX}}}], {useNativeDriver: true})}
                                     scrollEventThrottle={1}>
                    <View>
                        <ScheduleDates dates={slots.map(({header, date}) => ({header, date}))}
                                       animatedValues={{native: this.nScrollX, nonNative: this.scrollX}}
                                       scrollTo={(x) => this.scrollRef.current._component.scrollTo({
                                           x,
                                           y: 0,
                                           animated: true
                                       })}/>
                        <View style={Styles.timesContainer}>
                            {slots.map(({times}, i) =>
                                <View style={{width: windowWidth}} key={i}>
                                    <ScheduleTimes times={times}
                                                   animatedValues={{
                                                       native: this.nScrollYs[i],
                                                       nonNative: this.scrollYs[i]
                                                   }}
                                                   onChange={(timeIndex) => {
                                                       this.selectedTimes[this.selectedDate] = timeIndex;
                                                       this.dateTimeChange();
                                                   }}/>
                                </View>)}
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


const Styles = StyleSheet.create({
    divider: {width: windowWidth, backgroundColor: Color.primaryDark, height: StyleSheet.hairlineWidth},
    horizontalScrollContainer: {flex: 1, backgroundColor: Color.primaryDarker},
    container: {maxWidth: windowWidth, backgroundColor: Color.primary},
    dateUnderline: {
        height: 5,
        width: 0.35 * windowWidth,
        backgroundColor: Color.action,
        position: 'absolute',
        top: 55,
        alignSelf: 'center'
    },
    timesContainer: {flexDirection: 'row', flex: 1}
});


export default ScheduleSelector;