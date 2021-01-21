import React from 'react';

const InfoOverview = ({data}) => {
    return (
        <table>
            <tbody>
                <tr>
                    <th>Number of unique buildings</th>
                    <td>{data.totalBuildings}</td>
                </tr>
                <tr>
                    <th>Average building area</th>
                    <td>{data.avgBuildingArea} m<sup>2</sup></td>
                </tr>
                <tr>
                    <th>Total buildings area</th>
                    <td>{data.sumBuildingArea} m<sup>2</sup></td>
                </tr>
                <tr>
                    <th>Landuse Area</th>
                    <td>{data.landuseArea} m<sup>2</sup></td>
                </tr>
                <tr>
                    <th>Building : Landuse Ratio</th>
                    <td>{data.fractionArea}</td>
                </tr>
            </tbody>
        </table>
    )
}

export default InfoOverview;