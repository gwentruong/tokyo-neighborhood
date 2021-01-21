import React, { useState, useRef, useEffect, Fragment } from 'react';
import ReactDOM from 'react-dom';
import { Doughnut } from '@reactchartjs/react-chart.js';
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import * as turf from '@turf/turf';
import axios from 'axios';
import osmtogeojson from 'osmtogeojson';
import InfoOverview from './components/InfoOverview';

import './App.css';
import "mapbox-gl/dist/mapbox-gl.css";
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'

const styles = {
  top: "0",
  bottom: "0",
  right: "0",
  left: "0",
  position: "absolute"
};

const colorPallette = ["#54478c","#2c699a","#048ba8","#0db39e","#16db93","#83e377","#b9e769","#efea5a","#f1c453","#f29e4c"]

const App = () => {
  const [map, setMap] = useState(null);
  const mapContainer = useRef(null);
  const [selectedBbox, setSelectedBbox] = useState(null);
  const [OSMData, setOSMData] = useState(null);
  const [overview, setOverview] = useState({})
  const [amenityFeat, setAmenityFeat] = useState([]);
  const [chartData, setChartData] = useState({});
  const doughnut = useRef();

  mapboxgl.accessToken = 'pk.eyJ1IjoidXllbnRydW9uZyIsImEiOiJjanVjcGN0b3IwaG5xNDNwZHJ3czRlNmJhIn0.u7o0VUuXY5f-rs4hcrwihA';

  const extractFeatures = (features) => {
    let labels = Object.keys(features);
    let values = labels.map(l => features[l]);
    let colors = colorPallette.slice(0, labels.length)

    const data = {
        labels: labels,
        datasets: [
            {
                label: 'Amenities',
                data: values,
                backgroundColor: colors
            },
        ],
    }
    setChartData(data);
}

  const processOSMdata = () => {
    if (OSMData) {
      if (OSMData.features[0].id.includes('way')) {
        let landuseArea = Math.round(turf.area(turf.bboxPolygon(selectedBbox)) * 100)/ 100;
        let totalBuildings = OSMData.features.length
        let buildingArea = OSMData.features.map(building => turf.area(building))
        let sumBuildingArea = Math.round(buildingArea.reduce((a,b) => a + b, 0) * 100) / 100;
        let avgBuildingArea = Math.round(sumBuildingArea * 100 /totalBuildings) / 100;
        let fractionArea = Math.round(sumBuildingArea * 100/ landuseArea) / 100;
        
        if (map) {
          map.getSource('buildings').setData(OSMData)
        }
        setOverview({
          totalBuildings: totalBuildings,
          avgBuildingArea: avgBuildingArea,
          sumBuildingArea: sumBuildingArea,
          landuseArea: landuseArea,
          fractionArea: fractionArea
        })
      } else {
        let features = OSMData.features;
        let keys = [];
        let amenities = {};
        features.forEach(f => {
          let amenity = f.properties.amenity;
          if (!keys.includes(amenity)) {
            keys.push(amenity);
            amenities[amenity] = 1;
          } else {
            amenities[amenity] += 1;
          }
        });
        setAmenityFeat(amenities);
      }     
    } 
  }

  const fetchOSM = (type, bbox) => {
    const set = type === 'building' ? 'way' : 'node';
    const osmBbox = [bbox[1], bbox[0], bbox[3], bbox[2]]
    const url = 'https://lz4.overpass-api.de/api/interpreter';
    let dataReq = '[out:json];(' + set + '[' + type + '](' + osmBbox.join(',') + '););out tags geom;';

    axios.get(url + '?data=' + dataReq)
      .then(res => {
        console.log('dataReq', dataReq)
        setOSMData(osmtogeojson(res.data))
      },
      err => {
        console.log('Error');
      })
  }

  const initializeMap = ({ setMap, mapContainer }) => {
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [139.757714, 35.682746],
      maxBounds: [[139.730135,35.66863], [139.782844,35.705231]], // Chiyoda bbox
      zoom: 15
    });

    // Scale control
    const scale = new mapboxgl.ScaleControl({
      maxWidth: 80,
      unit: 'metric'
    });
    map.addControl(scale, 'bottom-right');

    // Full screen control
    map.addControl(new mapboxgl.FullscreenControl(), 'bottom-right');

    // Add navigation control
    const nav = new mapboxgl.NavigationControl();
    map.addControl(nav, 'bottom-right');

    // Draw control
    var Draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        "polygon": true,
        "trash": true
      }
    })
    map.addControl(Draw, 'top-right');

    map.on("load", () => {
      setMap(map);
      map.resize();

      // Add buildings source and layers
      map.addSource('buildings', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        },
        generateId: true
      })

      map.addLayer({
        id: 'buildings-fill',
        type: 'fill',
        source: 'buildings',
        paint: {
          "fill-color": '#b2c3ae',
          "fill-outline-color": '#000',
          "fill-opacity": 0.5
        }
      });

      let buildingPopup = new mapboxgl.Popup({
        closeOnMove: true,
        closeOnClick: true
      });

      // Event when polygon created
      map.on('draw.create', e => {
        let plg = e.features[0];
        // s,w,n,e
        let bbox = turf.bbox(plg)
        setSelectedBbox(bbox)
        fetchOSM('building', bbox);
        fetchOSM('amenity', bbox);
      })

      map.on('click', 'buildings-fill', e => {
        let props = e.features[0].properties
        let keys = Object.keys(props)

        let buildingInfoComponent = <table>
          <tbody>
            {keys.map((key, index) => 
              <tr key={index}>
                <th>{key}</th>
                <td>{props[key]}</td>
              </tr>
            )}
          </tbody>
        </table>

        var div = document.createElement("div", "popup")
        ReactDOM.render(buildingInfoComponent, div)

        buildingPopup
            .setLngLat(e.lngLat)
            .setDOMContent(div)
            .addTo(map);
      })
    });
  };

  useEffect(() => {
    !map && initializeMap({ setMap, mapContainer });
  }, [map]);


  useEffect(() => {
    amenityFeat && extractFeatures(amenityFeat);
  }, [amenityFeat]);

  useEffect(() => {
    OSMData && OSMData.features && processOSMdata()
  }, [OSMData]);
  return (
    <Fragment>
      <div ref={el => (mapContainer.current = el)} style={styles} />;
      <div className="overlay" style={{margin:2, top: 5,  background: "#fff", height: "100%",  position: "absolute"}} >
        <div className="overlay-col sidebar" style={{padding: "10px"}}>
          <div className="overlay-content" style={{height: "100%", width: "100%"}}>
            <h2>Area overview</h2>
            {overview ? <InfoOverview data={overview} /> : null}
            <h2>Amenties</h2>
            {amenityFeat 
              ? <div styles={{width: "500px"}}><Doughnut 
                        ref={el => doughnut.current = el} 
                        data={chartData} 
                        width={200}
                        height={400}
                        options={{ maintainAspectRatio: false }}/></div>
              : null}
          </div>
        </div>
      </div>
    </Fragment>
  )
    
};

export default App;
