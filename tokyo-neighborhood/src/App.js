import React, { useState, useRef, useEffect } from 'react';
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import * as turf from '@turf/turf';
import axios from 'axios';
import osmtogeojson from 'osmtogeojson';

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

const App = () => {
  const [map, setMap] = useState(null);
  const mapContainer = useRef(null);
  const [selectedBbox, setSelectedBbox] = useState(null);
  const [OSMData, setOSMData] = useState(null);

  mapboxgl.accessToken = 'pk.eyJ1IjoidXllbnRydW9uZyIsImEiOiJjanVjcGN0b3IwaG5xNDNwZHJ3czRlNmJhIn0.u7o0VUuXY5f-rs4hcrwihA';

  const processOSMdata = () => {
    if (OSMData) {
      console.log(OSMData, selectedBbox)
      console.log('tt', turf.bboxPolygon(selectedBbox))
      let landuseArea = turf.area(turf.bboxPolygon(selectedBbox));
      console.log('landuseArea', landuseArea)

      let totalBuildings = OSMData.features.length
      let buildingAreas = OSMData.features.map(building => turf.area(building))
      let sumBuildingAreas = buildingAreas.reduce((a,b) => a + b, 0)
      let fractionArea = Math.round(sumBuildingAreas / landuseArea, 3)
      console.log('count', totalBuildings, 'sum', sumBuildingAreas, 'frac', fractionArea)
    } 
  }

  const fetchOSM = (type, bbox) => {
    const set = type === 'building' ? 'way' : 'node';
    const osmBbox = [bbox[1], bbox[0], bbox[3], bbox[2]]
    const url = 'https://lz4.overpass-api.de/api/interpreter';
    let dataReq = '[out:json];(' + set + '[' + type + '](' + osmBbox.join(',') + '););out tags geom;';

    axios.get(url + '?data=' + dataReq)
      .then(res => {
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

      // Event when polygon created
      map.on('draw.create', e => {
        let plg = e.features[0];
        // s,w,n,e
        let bbox = turf.bbox(plg)
        setSelectedBbox(bbox)
        fetchOSM('building', bbox);

      })
    });
  };

  useEffect(() => {
    !map && initializeMap({ setMap, mapContainer });
  }, [map]);

  useEffect(() => {
    processOSMdata()
  }, [OSMData]);
  return <div ref={el => (mapContainer.current = el)} style={styles} />;
};

export default App;
