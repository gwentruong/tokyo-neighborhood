import React, { useState, useRef, useEffect } from 'react';
import mapboxgl from "mapbox-gl";

import './App.css';
import "mapbox-gl/dist/mapbox-gl.css";

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
  
  mapboxgl.accessToken = 'pk.eyJ1IjoidXllbnRydW9uZyIsImEiOiJjanVjcGN0b3IwaG5xNDNwZHJ3czRlNmJhIn0.u7o0VUuXY5f-rs4hcrwihA';

  const initializeMap = ({ setMap, mapContainer }) => {

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [139.757714, 35.682746],
      maxBounds: [[139.730135,35.66863], [139.782844,35.705231]],
      zoom: 15
    });

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

    map.on("load", () => {
      setMap(map);
      map.resize();
    });
  };

  useEffect(() => {
    !map && initializeMap({ setMap, mapContainer });
  }, [map]);

  return <div ref={el => (mapContainer.current = el)} style={styles} />;
};

export default App;
