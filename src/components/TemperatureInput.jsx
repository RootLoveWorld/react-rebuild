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
        console.log(this.props,e.target.value);
        this.props.onTemperatureChange(e.target.value);
    }
    render(){
        console.log("@@==",this.props);
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