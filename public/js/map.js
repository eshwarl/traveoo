// Set Mapbox access token
mapboxgl.accessToken = mapToken; // Correctly set the Mapbox token

// Log the token and coordinates for debugging
console.log('Map Token:', mapToken);
console.log('Coordinates:', coordinates);

// Validate coordinates
let validCoordinates = Array.isArray(coordinates) && coordinates.length === 2
    ? coordinates
    : [77.209, 28.6139]; // Default to Delhi if coordinates are invalid

// Initialize the map
const map = new mapboxgl.Map({
    container: "map", // ID of the container element
    style: "mapbox://styles/mapbox/streets-v12", // Map style
    center: validCoordinates, // Use validated coordinates
    zoom: 9, // Default zoom level
});

// Add navigation controls to the map
map.addControl(new mapboxgl.NavigationControl());

// Add a marker if the coordinates are valid
if (Array.isArray(coordinates) && coordinates.length === 2) {
    new mapboxgl.Marker({color:"red"})
        .setLngLat(coordinates)
        .addTo(map);
} else {
    console.error("Invalid coordinates provided:", coordinates);
}
