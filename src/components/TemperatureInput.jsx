import React from 'react';

const scaleNames = {
    c: 'Celsius',
    f: 'Fahrenheit'
  };

class TemperatureInput extends React.Component {
    constructor(props){
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }
    handleChange(e){
        this.props.onTemperatureChange(e.target.value);
    }
    render(){
        const {temperature,scale} = this.props;
        return (
            <div>
                <label>Please input in {scaleNames[scale]}: </label>
                <input value={temperature} onChange={this.handleChange}/>
            </div>
        )
    }
}

export default TemperatureInput;