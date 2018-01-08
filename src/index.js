import React from 'react';
import ReactDOM from 'react-dom';

import TemperatureInput from './components/TemperatureInput';

ReactDOM.render(
    (
        <div>
            <span>Miracle</span>
            <TemperatureInput/>
            <TemperatureInput/>
        </div>
    )
    ,document.getElementById("app"));