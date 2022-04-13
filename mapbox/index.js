import {
    LocationPopup,
    LocationSearchComponent
} from "./componentsUI.js";
import MapboxAPI from "./api.js";

mapboxgl.accessToken = MapboxAPI.API_ACCESS_TOKEN;

const getAutocompleteList = async (searchText) => {
    const locationRes = await MapboxAPI.getPlacesAPI(searchText);
    return locationRes.features.map(location => location.place_name);
}

const AutocompleteInput = (locationComponent, getAutocompleteList) => {
    const input = locationComponent.locationSearchInput;
    let debounceTimeout = null;
    input.addEventListener("input", (event) => {
        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }
        debounceTimeout = setTimeout(autocomplete, 1000);
    })

    async function autocomplete() {
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

// function CurrentPositionButton(currentButtonQuery, map) {
//     const currentLocation = document.querySelector(currentButtonQuery);
//     this.currentMarker = null;
//     currentLocation.onclick = () => {
//         navigator.geolocation.getCurrentPosition((pos) => {
//             const crd = pos.coords;
//             map.panTo([crd.longitude, crd.latitude])
//             if (this.currentMarker) {
//                 this.currentMarker.remove();
//             }
//             this.currentMarker = MapboxAPI.addMarkerToMap({
//                 name: 'Current Position',
//                 coordinates: [crd.longitude, crd.latitude]
//             }, map, {
//                 color: "green"
//             }, LocationPopup);
//         });
//         // 
//     }
//     return this;
// }


const showPlaces = () => {
    const placeMarkers = [];
    let currentPopup = null;
    const createMarker = (markerElement, coordinates, map) => {
        const marker = new mapboxgl.Marker(markerElement).setLngLat(coordinates).addTo(map);
        return marker;
    }
    return async (longitude, latitude, map) => {
        if (placeMarkers.length) {
            placeMarkers.forEach((marker) => marker.remove());
        }
        placeMarkers.length = 0;
        const result = await MapboxAPI.reverseGeocoding(longitude, latitude);

        for (let feature of result.features) {
            const markerElement = document.createElement('div');
            markerElement.className = 'marker';
            markerElement.style.height = '20px';
            markerElement.style.width = '20px';
            markerElement.style.backgroundImage = 'url(https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png)';
            markerElement.style.backgroundSize = "contain";
            markerElement.style.backgroundRepeat = 'no-repeat'

            markerElement.addEventListener('click', function (e) {
                // Prevent the `map.on('click')` from being triggered
                e.stopPropagation();
                if (currentPopup) {
                    currentPopup.remove();
                }
                currentPopup = new mapboxgl.Popup({
                    offset: {
                        'top': [0, 0],
                        'top-left': [0, 0],
                        'top-right': [0, 0],
                    },
                    className: 'modal'
                }).setLngLat(feature.center).setHTML(LocationPopup({
                    name: feature.place_name,
                    images: []
                })).addTo(map);
            });
            placeMarkers.push(
                createMarker(markerElement, feature.center, map)
            );
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

    map.addControl(new mapboxgl.FullscreenControl({
        container: document.querySelector('.main .map')
    }));
    map.addControl(new mapboxgl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
    }));
    const nav = new mapboxgl.NavigationControl();
    const showPlacesFunc = showPlaces();
    
    map.on('load', (event) => {
        map.addControl(nav, 'top-right');
        map.on("click", async (event) => {
            showPlacesFunc(event.lngLat.lng, event.lngLat.lat, map);

        })
    })

    const targetLocationSearch = new LocationSearchComponent({
        locationSearchButton: '.search.--dest .search__icon',
        locationSearchInput: '.search.--dest .search__input',
        locationContainer: '.panel__location ul'

    });
    targetLocationSearch.withMap(map);

    const sourceLocationSearch = new LocationSearchComponent({
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
        const type = document.querySelector(".panel__container input[name='matching-type']:checked").value;
        const sourceCoordinate = sourceLocationSearch.getCurrentCoordinates();
        const targetCoordinate = targetLocationSearch.getCurrentCoordinates();

        if (sourceCoordinate && targetCoordinate) {
            try {
                const coordinates = await MapboxAPI.getPathAPI([sourceCoordinate, targetCoordinate], type);
                if (coordinates) {
                    MapboxAPI.addRouteToMap(map, coordinates);
                }
            } catch (error) {
                alert(error.message)
            }
        }
    }

    const toggleControl = new CurrentPositionButton({});
    map.addControl(toggleControl, 'bottom-right');

    const closePanelButton = document.querySelector(".close-panel");
    const openPanelButton = document.querySelector(".open-panel");
    const panel = document.querySelector(".panel");
    closePanelButton.onclick = () => {
        panel.classList.add("close");
        openPanelButton.classList.add("show");
    }

    openPanelButton.onclick = () => {
        panel.classList.remove("close");
        openPanelButton.classList.remove("show");
    }
})

class CurrentPositionButton extends mapboxgl.GeolocateControl {

    // _onSuccess(position) {
       
    // }

    onAdd(map, cs) {
        this.map = map;
        this.container = document.createElement('div');
        this.container.className = `mapboxgl-ctrl`;
        const button = this._createButton('cur-loc');
        this.container.appendChild(button);
        this.currentMarker = null;
        return this.container;
    }

    _createButton(className) {
        const el = window.document.createElement('div')
        el.className = className;
        el.innerHTML  = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M176 256C176 211.8 211.8 176 256 176C300.2 176 336 211.8 336 256C336 300.2 300.2 336 256 336C211.8 336 176 300.2 176 256zM256 0C273.7 0 288 14.33 288 32V66.65C368.4 80.14 431.9 143.6 445.3 224H480C497.7 224 512 238.3 512 256C512 273.7 497.7 288 480 288H445.3C431.9 368.4 368.4 431.9 288 445.3V480C288 497.7 273.7 512 256 512C238.3 512 224 497.7 224 480V445.3C143.6 431.9 80.14 368.4 66.65 288H32C14.33 288 0 273.7 0 256C0 238.3 14.33 224 32 224H66.65C80.14 143.6 143.6 80.14 224 66.65V32C224 14.33 238.3 0 256 0zM128 256C128 326.7 185.3 384 256 384C326.7 384 384 326.7 384 256C384 185.3 326.7 128 256 128C185.3 128 128 185.3 128 256z"/></svg>';
        
        el.addEventListener('click', () => {
            this.trigger();
            navigator.geolocation.getCurrentPosition((pos) => {
                const crd = pos.coords;
                this.map.panTo([crd.longitude, crd.latitude])
                if (this.currentMarker) {
                    this.currentMarker.remove();
                }
                this.currentMarker = MapboxAPI.addMarkerToMap({
                    name: 'Current Position',
                    coordinates: [crd.longitude, crd.latitude]
                },this.map, {
                    color: "green"
                }, LocationPopup);
            });
        });
        this._setup = true;
        return el;
    }
}