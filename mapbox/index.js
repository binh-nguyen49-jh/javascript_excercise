const API_URL = 'https://api.mapbox.com';
const API_ACCESS_TOKEN = 'pk.eyJ1IjoiaHV1YmluaDQ5IiwiYSI6ImNsMWoxMWZyMTBmbGIzam4xM2Rmbm9iaDEifQ.4CVg-6-qcEBIIsGN1JiGpg'
const ROUTE_ID = 'route';
mapboxgl.accessToken = API_ACCESS_TOKEN;

const getPlacesAPI = async (searchText, type='mapbox.places') => {
    try {
        const response = await fetch(`${API_URL}/geocoding/v5/${type}/${searchText}.json?access_token=${API_ACCESS_TOKEN}&limit=10`);
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

const getPathAPI = async (coordinates, type='driving') => {
    try {
        const response = await fetch(`${API_URL}/optimized-trips/v1/mapbox/${type}/${coordinates.map(coor => coor.join(',')).join(';')}?access_token=${API_ACCESS_TOKEN}&geometries=geojson`);
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

const searchPlaces = async (searchText) => {
    const locationRes = await getPlacesAPI(searchText);
    return locationRes.features;
}

const getAutocompleteList = async (searchText) => {
    const locationRes = await getPlacesAPI(searchText);
    return locationRes.features.map(location => location.place_name);
}

const LocationPopup = (locationData) => {
    return `
    <!-- Modal -->
        <div class="modal__container">
            <div class="modal__header">
                <h5 class="modal__title">Thông tin địa điểm</h5>
            </div>
            <div class="modal__body">
                <div class="container">
                    <h3>${locationData.name}</h3>
                    <div class="modal__images">
                        <h4>Ảnh</h4>
                        <div class="images__container">
                            <ul>
                                ${locationData.images.map((imgURL) => `
                                    <li style="
                                        background-image: url('${imgURL}')
                                    ">
                                    </li>
                                    `).join('')
                                }
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal__footer">
            </div>
        </div>
    `;
}

const LocationList = (places)  => {
    return places.map(place => `
    <li>
        <svg xmlns="http://www.w3.org/2000/svg" width="19" height="22" viewBox="0 0 19 22" fill="none">
            <path d="M9.5 0C4.71175 0 0.830078 3.71288 0.830078 8.29297C0.830078 9.82467 1.14351 11.4067 2.04296 12.5469L9.5 22L16.957 12.5469C17.774 11.5112 18.1699 9.68035 18.1699 8.29297C18.1699 3.71288 14.2883 0 9.5 0ZM9.5 4.80309C11.5147 4.80309 13.1485 6.36585 13.1485 8.29295C13.1485 10.2201 11.5147 11.7828 9.5 11.7828C7.48528 11.7828 5.85151 10.2201 5.85151 8.29297C5.85151 6.36585 7.48528 4.80309 9.5 4.80309Z" fill="#F24E1E"/>
        </svg>
        <h4>${place.place_name}</h4>
    </li>
    `).join('');
}

const AutocompleteInput = (locationComponent, getAutocompleteList) => {
    const input = locationComponent.locationSearchInput;
    let debounceTimeout = null;
    input.addEventListener("input", (event) => {
        if(debounceTimeout) {
            clearTimeout(debounceTimeout);
        }
        debounceTimeout = setTimeout(autocomplete, 1000);
    })

    async function autocomplete () {
        const value = input.value;
        closeAutocompleteList();
        locationComponent.clearMarkers();
        if (!value) { 
            return false;
        }

        const autocompleteList = document.createElement("DIV");
        autocompleteList.setAttribute("class", "autocomplete__items");
        input.parentNode.appendChild(autocompleteList);

        const autocompletePlaces = await getAutocompleteList(value);
        autocompletePlaces.forEach((item, idx) => {
            
            const autocompleteItem = document.createElement("DIV");
            /*make the matching letters bold:*/
            if (item.substr(0, value.length).toLowerCase() == value.toLowerCase()) {
                autocompleteItem.innerHTML = "<strong>" + item.substr(0, value.length) + "</strong>";
                autocompleteItem.innerHTML += item.substr(value.length);
            } else {
                autocompleteItem.innerHTML += item;
            }
            /*insert a input field that will hold the current array item's value:*/
            autocompleteItem.innerHTML += "<input type='hidden' value='" + item + "'>";
            autocompleteItem.addEventListener("click", event => {
                /*insert the value for the autocomplete text field:*/
                input.value = autocompleteItem.getElementsByTagName("input")[0].value;
                /*close the list of autocompleted values,
                (or any other open lists of autocompleted values:*/
                locationComponent.handleSearch();
                locationComponent.clearMarkers();
            });
            autocompleteList.appendChild(autocompleteItem);
        })
        document.onclick = () => {
            closeAutocompleteList();
        }
    }
    function closeAutocompleteList(element) {
        const autocompleteList = document.getElementsByClassName("autocomplete__items");
        for (let i = 0; i < autocompleteList.length; i++) {
            if (element != autocompleteList[i] && element != input) {
                autocompleteList[i].parentNode.removeChild(autocompleteList[i]);
            }
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const map = new mapboxgl.Map({
        container: 'map', // container ID
        style: 'mapbox://styles/mapbox/outdoors-v11', // style URL
        center: [106.7834812, 10.8416345], // starting position [lng, lat]
        zoom: 10 // starting zoom
    });

    map.addControl(new mapboxgl.FullscreenControl({ container: document.querySelector('.main .map') }));
    map.addControl(new mapboxgl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
    }));
    const nav = new mapboxgl.NavigationControl();
    map.addControl(nav, 'top-right');

    // Add marker with custom popup
    const marker = new mapboxgl.Marker()
    .setLngLat([106.7834812, 10.8416345])
    .setPopup(new mapboxgl.Popup({
        offset: {
            'top': [0, 0],
            'top-left': [0, 0],
            'top-right': [0, 0],
        },
        className: 'modal'
    }).setHTML(LocationPopup({
        name: 'Nhà thờ Đức Bà',
        images: [
            'https://media-cdn-v2.laodong.vn/Storage/NewsPortal/2020/3/1/787823/89Ed9078d6332d6d7422.jpg',
            'https://image.thanhnien.vn/1200x630/Uploaded/2022/cqjwqcqdh/2020_05_23/4_xshh.jpg',
            'https://media-cdn-v2.laodong.vn/Storage/NewsPortal/2020/3/1/787823/89Ed9078d6332d6d7422.jpg',
            'https://image.thanhnien.vn/1200x630/Uploaded/2022/cqjwqcqdh/2020_05_23/4_xshh.jpg',
            'https://media-cdn-v2.laodong.vn/Storage/NewsPortal/2020/3/1/787823/89Ed9078d6332d6d7422.jpg',
            'https://image.thanhnien.vn/1200x630/Uploaded/2022/cqjwqcqdh/2020_05_23/4_xshh.jpg',
            'https://media-cdn-v2.laodong.vn/Storage/NewsPortal/2020/3/1/787823/89Ed9078d6332d6d7422.jpg',
            'https://image.thanhnien.vn/1200x630/Uploaded/2022/cqjwqcqdh/2020_05_23/4_xshh.jpg'
        ]
    }))) // add popup
    .addTo(map);

    const targetLocationSearch = new LocationSearchComponenent({
        locationSearchButton: '.search.--dest .search__icon', 
        locationSearchInput: '.search.--dest .search__input',
        locationContainer: '.panel__location ul'

    });
    targetLocationSearch.withMap(map);

    const sourceLocationSearch = new LocationSearchComponenent({
        locationSearchButton: '.search.--source .search__icon',
        locationSearchInput: '.search.--source .search__input'
    })
    sourceLocationSearch.withMap(map).withMarkerStyle({
        color: 'blue'
    });

    AutocompleteInput(targetLocationSearch, getAutocompleteList);
    AutocompleteInput(sourceLocationSearch, getAutocompleteList);

    const goButton = document.querySelector('.go-btn');
    goButton.onclick = async () => {
        const sourceCoordinate = sourceLocationSearch.getCurrentCoordinates();
        const targetCoordinate = targetLocationSearch.getCurrentCoordinates();
        
        if(sourceCoordinate && targetCoordinate) {
            try { 
                const coordinates = await getPathAPI([sourceCoordinate, targetCoordinate]);
                if (coordinates) {
                    addRouteToMap(map, coordinates);
                }   
            } catch (error) {
                alert(error.message)
            }
        }
    }
})

function addRouteToMap(map, coordinates) {
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

function LocationSearchComponenent({
    locationSearchButton, 
    locationSearchInput, 
    locationContainer
}) {
    
    this.searchedLocations = []
    this.currentMarker = null;
    this.locationSearchButton = document.querySelector(locationSearchButton);
    if (this.locationSearchButton) {
        this.locationSearchButton.onclick = (e) => {
            e.preventDefault();
            this.handleSearch();
        };
    }
    this.locationSearchInput = document.querySelector(locationSearchInput);
    this.locationContainer = document.querySelector(locationContainer);

    this.map = null;
    this.markerStyle = {
        color: 'red'
    };

    this.withMap = (map) => {
        this.map = map;
        return this;
    }

    this.withMarkerStyle = (markerStyle) => {
        this.markerStyle = markerStyle;
        return this;
    }

    this.clearMarkers = () => {
        if (this.currentMarker) {
            this.currentMarker.remove();
            delete this.currentMarker;
        }
    }

    this.handleLocationItemClick = (idx) => {
        this.clearMarkers();
        if (this.map){
            console.log(this.searchedLocations)
            this.currentMarker = new mapboxgl.Marker(
                this.markerStyle
            ).setLngLat(this.searchedLocations[idx].center);
            this.currentMarker.addTo(this.map);
            this.map.panTo(this.searchedLocations[idx].center);
        }
    }
    
    this.handleSearch = async () => {
        this.clearMarkers();
        try {
            this.searchedLocations = await searchPlaces(this.locationSearchInput.value);
            if (this.locationContainer) {
                this.locationContainer.innerHTML = LocationList(this.searchedLocations);
                const locationItems = document.querySelectorAll('.panel__container .panel__location li');
                locationItems.forEach((locationItem, idx) => {
                    locationItem.onclick = () => {
                        this.handleLocationItemClick(idx);
                    };
                })
            } else {
                this.handleLocationItemClick(0);
            }
        } catch (error) {
            this.searchedLocations = []
        }
    }

    this.getCurrentCoordinates = () => {
        if (this.currentMarker) {
            return [this.currentMarker.getLngLat().lng, this.currentMarker.getLngLat().lat];
        }
        else {
            return null;
        }       
    }
}