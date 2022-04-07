import { LocationPopup, LocationSearchComponenent } from "./componentsUI.js";
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

    MapboxAPI.addMarkerToMap({
        coordinates: [106.7834812, 10.8416345],
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
    }, map, null, LocationPopup);
    
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
        const type = document.querySelector(".panel__container input[name='matching-type']:checked").value;
        const sourceCoordinate = sourceLocationSearch.getCurrentCoordinates();
        const targetCoordinate = targetLocationSearch.getCurrentCoordinates();
        
        if(sourceCoordinate && targetCoordinate) {
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
})

