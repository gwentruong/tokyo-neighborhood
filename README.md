# Tokyo-neighborhood
## Geospatial assessment

### Setup

```
npm install
npm start
```

### Libraries and tech used

* create-react-app
* mapboxgl
* mapbox-gl-draw
* react-chart.js
* turf.js

### Answers to tasks

1. The web app utilizes MapboxGL and React. The boundary of the map is Chiyoda neighborhood, Tokyo. User can use drawing tool to draw a polygon to select an area. Bounding box from this polygon would be created and used to query OSM features through Overpass API (buildings polygon and amenities points). The results are processed to display some buildings-related overview of the selected area.

2. From my personal experience, the performance of spatial data is best stored in PostgreSQL database, which could be hosted on AWS RDS as an example. If the daily amount of data is large like bus history or sattelite images, the better place to store these data is AWS D3. However, the indexing and performance in manipulating directly from this source is not as good as PostgreSQL. 

Depending on the type of data storing and frequency of source update, the update of data in the cloud would be performed. With entire country related data, the data should be updated quarterly or at least annually. 
One large things to consider when doing automation of updating country data from offical source is that the format of files, APIs, structures of pages would be changed, that causes complications in running scheduled scrips. Licenses of data source, data format, size of data and request speed are some of other things to consider as well.

3. I added a donut chart to show statistics of all point-of-interests in selected area.

4. The queried building results were also reused to displayed queried buildings polygon, more info of the property can be seen by clicking on the building. User might wonder which buildings are selected, where they are and how they look like on the map. It is useful to see the highlight of buildings in selected area and some of their details, good for user interaction :) .
