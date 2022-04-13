const ROUTE_ID = 'route';
const API_URL = 'https://api.mapbox.com';

export default class MapboxAPI {  
    static API_ACCESS_TOKEN = 'pk.eyJ1IjoiaHV1YmluaDQ5IiwiYSI6ImNsMWoxMWZyMTBmbGIzam4xM2Rmbm9iaDEifQ.4CVg-6-qcEBIIsGN1JiGpg';
    static getPlacesAPI = async (searchText, type='mapbox.places') => {
        try {
            const response = await fetch(`${API_URL}/geocoding/v5/${type}/${searchText}.json?access_token=${MapboxAPI.API_ACCESS_TOKEN}&limit=10`);
            const locationRes = await response.json();
            if (
                !locationRes ||
                !locationRes ||
                !locationRes.features ||
                !locationRes.features.length
            ) {
                throw new Error('Failed to fetch resource');
            }
            return locationRes;
        } catch (error) {
            console.error(error);
        }
    }
    
    static reverseGeocoding = async (longitude, latitude, type='mapbox.places') => {
        try {
            const response = await fetch(`${API_URL}/geocoding/v5/${type}/${longitude},${latitude}.json?access_token=${MapboxAPI.API_ACCESS_TOKEN}`);
            const locationRes = await response.json();
            if (
                !locationRes ||
                !locationRes ||
                !locationRes.features ||
                !locationRes.features.length
            ) {
                throw new Error('Failed to fetch resource');
            }
            return locationRes;
        } catch (error) {
            console.error(error);
        }
    }
    static getPathAPI = async (coordinates, type='driving') => {
        try {
            const response = await fetch(`${API_URL}/optimized-trips/v1/mapbox/${type}/${coordinates.map(coor => coor.join(',')).join(';')}?access_token=${MapboxAPI.API_ACCESS_TOKEN}&geometries=geojson`);
            const pathRes = await response.json();
            if (pathRes.message) {
                throw new Error(pathRes.message);
            }
            const route = pathRes.trips[0];
            return route.geometry.coordinates;
        } catch (error) {
            console.error(error);
            throw new Error(error.message);
        }
    }

        
    static addMarkerToMap = (markerData, map, markerStyle, PopupHTML) => {
        // Add marker with custom popup
        const marker = new mapboxgl.Marker(markerStyle)
        .setLngLat(markerData.coordinates)
        .setPopup(new mapboxgl.Popup({
            offset: {
                'top': [0, 0],
                'top-left': [0, 0],
                'top-right': [0, 0],
            },
            className: 'modal'
        }).setHTML(PopupHTML(markerData))) // add popup
        .addTo(map);
        return marker;
    }

    static addRouteToMap(map, coordinates) {
        const geojson = {
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates: coordinates
            }
        };
        // if the route already exists on the map, we'll reset it using setData
        if (map.getSource(ROUTE_ID)) {
            map.getSource(ROUTE_ID).setData(geojson);
        }
        // otherwise, we'll make a new request
        else {
            map.addLayer({
                id: ROUTE_ID,
                type: 'line',
                source: {
                type: 'geojson',
                data: geojson
                },
                layout: {
                'line-join': 'round',
                'line-cap': 'round'
                },
                paint: {
                'line-color': '#3887be',
                'line-width': 5,
                'line-opacity': 0.75
                }
            });
        }
    }
};