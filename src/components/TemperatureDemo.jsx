import React from 'react';
import TemperatureInput from './TemperatureInput';

function toCelsius(fahrenheit) {
    return (fahrenheit - 32) * 5 / 9;
}
  
function toFahrenheit(celsius) {
    return (celsius * 9 / 5) + 32;
}

function tryConvert(temperature, convert) {
    const input = parseFloat(temperature);
    if (Number.isNaN(input)) {
      return '';
    }
    const output = convert(input);
    const rounded = Math.round(output * 1000) / 1000;
    return rounded.toString();
}

class TemperatureDemo extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            temperature:'',
            scale:'c'
        }
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(type){
        this.setState({
            scale:type,
            temperature
        });
    }

    render(){
        //const {scale,temperature} = this.state;
        const scale = this.state.scale;
        const temperature = this.state.temperature;
        const celsius = scale === 'f' ? tryConvert(temperature,toCelsius):temperature;
        const fahrenheit = scale === 'c' ? tryConvert(temperature,toFahrenheit):temperature;
        console.log(this.state,scale,"---",temperature);
        return (
            <div>
                <span>Miracle Temperature Demo</span>
                <TemperatureInput scale="c" temperature={celsius} onTemperatureChange={this.handleChange("c")} />
                <TemperatureInput scale="f" temperature={fahrenheit} onTemperatureChange={this.handleChange("f")} />
            </div>
        )
    }
}

export default TemperatureDemo;