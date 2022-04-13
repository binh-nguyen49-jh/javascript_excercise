import MapboxAPI from "./api.js";

export const LocationPopup = (locationData) => {
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
                                ${locationData.images?.map((imgURL) => `
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

export const LocationList = (places)  => {
    return places.map(place => `
    <li>
        <svg xmlns="http://www.w3.org/2000/svg" width="19" height="22" viewBox="0 0 19 22" fill="none">
            <path d="M9.5 0C4.71175 0 0.830078 3.71288 0.830078 8.29297C0.830078 9.82467 1.14351 11.4067 2.04296 12.5469L9.5 22L16.957 12.5469C17.774 11.5112 18.1699 9.68035 18.1699 8.29297C18.1699 3.71288 14.2883 0 9.5 0ZM9.5 4.80309C11.5147 4.80309 13.1485 6.36585 13.1485 8.29295C13.1485 10.2201 11.5147 11.7828 9.5 11.7828C7.48528 11.7828 5.85151 10.2201 5.85151 8.29297C5.85151 6.36585 7.48528 4.80309 9.5 4.80309Z" fill="#F24E1E"/>
        </svg>
        <h4>${place.place_name}</h4>
    </li>
    `).join('');
}

export function LocationSearchComponent({
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
            this.currentMarker = new mapboxgl.Marker(
                this.markerStyle
            ).setLngLat(this.searchedLocations[idx].center);
            this.currentMarker.addTo(this.map);
            this.map.panTo(this.searchedLocations[idx].center);
        }
    }
    
    this.searchPlaces = async (searchText) => {
        const locationRes = await MapboxAPI.getPlacesAPI(searchText);
        return locationRes.features;
    }

    this.handleSearch = async () => {
        this.clearMarkers();
        try {
            this.searchedLocations = await this.searchPlaces(this.locationSearchInput.value);
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