import React, {useState, useEffect, useRef} from 'react';
import { Doughnut } from '@reactchartjs/react-chart.js';

const colorPallette = ["54478c","2c699a","048ba8","0db39e","16db93","83e377","b9e769","efea5a","f1c453","f29e4c"]

const Chart = ({features}) => {
    const [chartData, setChartData] = useState([]);
    const [legends, setLegends] = useState([]);
    const doughnut = useRef();

    useEffect(() => {
        console.log('feat', features);
    }, [features]);

    return (
      <div>Placement</div>  
    );
}

export default Chart;