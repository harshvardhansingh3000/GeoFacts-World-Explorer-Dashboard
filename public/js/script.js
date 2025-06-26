var map = L.map('map').setView([20, 0], 2.5);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// User login state from data attribute
const userIsLoggedIn = document.body.dataset.loggedIn === 'true';
let currentCountryCode = null; // Track selected country code
let visitedCountries = new Set(); // Track visited countries
let wishlistCountries = new Set(); // Track wishlist countries
let geoJsonLayer = null; // Store the GeoJSON layer for updating colors

// FAB logic
const fabContainer = document.getElementById('fab-container');
if (fabContainer) fabContainer.classList.add('hidden'); // Hide FAB on load

// Load user's visited and wishlist countries if logged in
async function loadUserData() {
    if (!userIsLoggedIn) return;
    
    try {
        // Load visited countries
        const visitedResponse = await fetch('/country/visited');
        const visitedData = await visitedResponse.json();
        visitedCountries = new Set(visitedData.visitedCountries);
        
        // Load wishlist countries
        const wishlistResponse = await fetch('/country/wishlist');
        const wishlistData = await wishlistResponse.json();
        wishlistCountries = new Set(wishlistData.wishlistCountries);
        
        console.log('Loaded visited countries:', visitedCountries);
        console.log('Loaded wishlist countries:', wishlistCountries);
        
        // Update map colors after loading data
        if (geoJsonLayer) {
            updateMapColors();
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

// Function to get country color based on status
function getCountryColor(countryCode) {
    if (visitedCountries.has(countryCode)) {
        return '#10B981'; // Green for visited
    } else if (wishlistCountries.has(countryCode)) {
        return '#F59E0B'; // Yellow for wishlist
    } else {
        return '#ccc'; // Default gray
    }
}

// Function to update map colors
function updateMapColors() {
    if (!geoJsonLayer) return;
    
    geoJsonLayer.eachLayer(layer => {
        const countryCode = layer.feature.properties["ISO3166-1-Alpha-2"];
        if (countryCode) {
            layer.setStyle({
                color: getCountryColor(countryCode),
                weight: 1,
                fillOpacity: visitedCountries.has(countryCode) ? 0.6 : 
                           wishlistCountries.has(countryCode) ? 0.4 : 0.1
            });
        }
    });
}

// Function to update a specific country's color
function updateCountryColor(countryCode) {
    if (!geoJsonLayer) return;
    
    geoJsonLayer.eachLayer(layer => {
        const layerCountryCode = layer.feature.properties["ISO3166-1-Alpha-2"];
        if (layerCountryCode === countryCode) {
            layer.setStyle({
                color: getCountryColor(countryCode),
                weight: 1,
                fillOpacity: visitedCountries.has(countryCode) ? 0.6 : 
                           wishlistCountries.has(countryCode) ? 0.4 : 0.1
            });
        }
    });
}

// GeoJSON
fetch("https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson")
  .then(res => res.json())
  .then(geoData => {
    geoJsonLayer = L.geoJSON(geoData, {
      style: function(feature) {
        const countryCode = feature.properties["ISO3166-1-Alpha-2"];
        return {
          color: getCountryColor(countryCode),
          weight: 1,
          fillOpacity: visitedCountries.has(countryCode) ? 0.6 : 
                     wishlistCountries.has(countryCode) ? 0.4 : 0.1
        };
      },
      onEachFeature: function (feature, layer) {
        layer.on('click', function () {
          console.log(feature.properties);
          const countryName = feature.properties.name;
          const code = feature.properties["ISO3166-1-Alpha-2"]; // Use Alpha-2 for compatibility

          if (!code) {
            console.warn("Country code not found for:", countryName);
            return;
          }

          console.log(`Clicked on: ${countryName} [${code}]`);
          console.log('Setting currentCountryCode:', code);
          currentCountryCode = code; // Set the selected country code
          if (fabContainer) fabContainer.classList.remove('hidden'); // Show FAB

          // Update FAB button states based on current country status
          updateFABButtonStates(code);

          // Fetch from REST Countries
          fetch(`https://restcountries.com/v3.1/alpha/${code}`)
            .then(res => res.json())
            .then(data => {
              const country = data[0]; // REST API returns an array
              if (!country) {
                console.error("No data found for", code);
                return;
              }

              // Inject data into the panel
              document.getElementById('country-flag').src = country.flags.svg;
              document.getElementById('country-name').textContent = country.name.common;
              document.getElementById('country-capital').textContent = `Capital: ${country.capital ? country.capital[0] : 'N/A'}`;
              document.getElementById('country-region').textContent = `Region: ${country.region}`;
              document.getElementById('country-population').textContent = `Population: ${country.population.toLocaleString()}`;
              document.getElementById('country-area').textContent = `Area: ${country.area.toLocaleString()} km²`;
              
              const languages = country.languages ? Object.values(country.languages).join(', ') : 'N/A';
              document.getElementById('country-languages').textContent = `Languages: ${languages}`;

              const currencies = country.currencies
                ? Object.values(country.currencies).map(c => `${c.name} (${c.symbol})`).join(', ')
                : 'N/A';
              document.getElementById('country-currency').textContent = `Currency: ${currencies}`;

              // Show the panel
              showPanel();

              // Fetch weather data for the capital's coordinates
              if (country.capitalInfo && country.capitalInfo.latlng) {
                const [lat, lon] = country.capitalInfo.latlng;
                fetchWeather(lat, lon)
                  .then(weatherData => {
                    displayWeather(weatherData);
                  })
                  .catch(err => {
                    console.error('Weather fetch error:', err);
                    displayWeather(null);
                  });
                fetchAQI(lat, lon)
                  .then(aqiData => {
                    displayAQI(aqiData);
                  })
                  .catch(err => {
                    console.error('AQI fetch error:', err);
                    displayAQI(null);
                  });
              } else {
                console.log('No capital coordinates found for weather data');
                displayWeather(null);
                displayAQI(null);
              }
            })
            .catch(err => console.error("REST Countries API error:", err));
        });
      }
    }).addTo(map);
    
    // Load user data after map is created
    loadUserData();
  })
  .catch(err => console.error("GeoJSON load error:", err));

// Function to update FAB button states and text
function updateFABButtonStates(countryCode) {
    if (!userIsLoggedIn) return;
    
    const isVisited = visitedCountries.has(countryCode);
    const isInWishlist = wishlistCountries.has(countryCode);
    
    const fabVisited = document.getElementById('fab-visited');
    const fabWishlist = document.getElementById('fab-wishlist');
    
    if (fabVisited) {
        fabVisited.textContent = isVisited ? '✓ Visited' : '○ Mark Visited';
        fabVisited.className = isVisited ? 
            'fab-button bg-green-600 hover:bg-green-700' : 
            'fab-button bg-gray-600 hover:bg-gray-700';
    }
    
    if (fabWishlist) {
        fabWishlist.textContent = isInWishlist ? '★ In Wishlist' : '☆ Add to Wishlist';
        fabWishlist.className = isInWishlist ? 
            'fab-button bg-yellow-600 hover:bg-yellow-700' : 
            'fab-button bg-gray-600 hover:bg-gray-700';
    }
}

// Weather fetching function using OpenWeatherMap API with lat/lon
async function fetchWeather(lat, lon) {
  const apiKey = '7f830f7670f29cbeccab44d3bd9f14ac';
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Weather API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Weather fetch error:', error);
    return null;
  }
}

// Function to display weather in the panel
function displayWeather(weatherData) {
  if (!weatherData) {
    document.getElementById('weather-temp').textContent = 'N/A';
    document.getElementById('weather-description').textContent = 'Weather data unavailable';
    document.getElementById('weather-humidity').textContent = '';
    document.getElementById('weather-wind').textContent = '';
    document.getElementById('weather-icon').src = '';
    return;
  }

  // Display weather info
  document.getElementById('weather-temp').textContent = `${Math.round(weatherData.main.temp)}°C`;
  document.getElementById('weather-description').textContent = weatherData.weather[0].description;
  document.getElementById('weather-humidity').textContent = `Humidity: ${weatherData.main.humidity}%`;
  document.getElementById('weather-wind').textContent = `Wind: ${Math.round(weatherData.wind.speed)} m/s`;
  
  // Weather icon
  const iconCode = weatherData.weather[0].icon;
  document.getElementById('weather-icon').src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

// Show the side panel
function showPanel() {
    console.log("Showing panel");
  document.getElementById('side-panel').classList.remove('translate-x-full');
}

// Hide the side panel
function hidePanel() {
  document.getElementById('side-panel').classList.add('translate-x-full');
}

// Close button event
document.getElementById('close-panel').addEventListener('click', hidePanel);

async function fetchAQI(lat, lon) {
  const apiKey = '7f830f7670f29cbeccab44d3bd9f14ac';
  const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`AQI API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('AQI fetch error:', error);
    return null;
  }
}

function displayAQI(aqiData) {
  if (!aqiData || !aqiData.list || !aqiData.list[0]) {
    document.getElementById('aqi-value').textContent = 'N/A';
    document.getElementById('aqi-status').textContent = '';
    document.getElementById('pm25').textContent = '';
    document.getElementById('pm10').textContent = '';
    document.getElementById('aqi-health').textContent = 'AQI data unavailable';
    return;
  }

  const aqiIndex = aqiData.list[0].main.aqi;
  const pm25 = aqiData.list[0].components.pm2_5;
  const pm10 = aqiData.list[0].components.pm10;

  // AQI status and health suggestion
  const aqiLevels = [
    { status: 'Good', color: 'text-green-600', health: 'Air quality is good. Enjoy your outdoor activities!' },
    { status: 'Fair', color: 'text-lime-600', health: 'Air quality is fair. Sensitive individuals should take care.' },
    { status: 'Moderate', color: 'text-yellow-600', health: 'Air quality is moderate. Consider limiting prolonged outdoor exertion.' },
    { status: 'Poor', color: 'text-orange-600', health: 'Air quality is poor. Wear a mask and avoid outdoor exercise.' },
    { status: 'Very Poor', color: 'text-red-600', health: 'Air quality is very poor. Stay indoors and use air purifiers.' }
  ];
  const level = aqiLevels[aqiIndex - 1] || { status: 'Unknown', color: '', health: '' };

  document.getElementById('aqi-value').textContent = `AQI: ${aqiIndex}`;
  document.getElementById('aqi-status').textContent = level.status;
  document.getElementById('aqi-status').className = `ml-3 text-lg ${level.color}`;
  document.getElementById('pm25').textContent = `PM2.5: ${pm25}`;
  document.getElementById('pm10').textContent = `PM10: ${pm10}`;
  document.getElementById('aqi-health').textContent = level.health;
}

// FAB button event listeners (only if elements exist)
const fabMain = document.getElementById('fab-main');
const fabVisited = document.getElementById('fab-visited');
const fabWishlist = document.getElementById('fab-wishlist');
const fabNote = document.getElementById('fab-note');
const noteModal = document.getElementById('note-modal');
const noteText = document.getElementById('note-text');
const noteCancel = document.getElementById('note-cancel');
const noteSave = document.getElementById('note-save');

let fabOpen = false;
if (fabMain) {
  fabMain.onclick = () => {
    fabOpen = !fabOpen;
    [fabVisited, fabWishlist, fabNote].forEach(btn => btn && btn.classList.toggle('hidden', !fabOpen));
    fabMain.textContent = fabOpen ? '×' : '+';
  };
}

if (fabVisited) {
  fabVisited.onclick = function() {
    console.log('Visited button clicked');
    console.log('currentCountryCode when clicking FAB:', currentCountryCode);
    if (!currentCountryCode) {
      showToast('Please select a country first.', 'bg-red-600');
      return;
    }
    
    const isVisited = visitedCountries.has(currentCountryCode);
    const method = isVisited ? 'DELETE' : 'POST';
    const url = isVisited ? `/country/visited/${currentCountryCode}` : '/country/visited';
    
    fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: method === 'POST' ? JSON.stringify({ country_code: currentCountryCode }) : undefined
    })
    .then(res => res.json())
    .then(data => {
      if (isVisited) {
        visitedCountries.delete(currentCountryCode);
        showToast(data.message || 'Removed from visited!', 'bg-blue-600');
      } else {
        visitedCountries.add(currentCountryCode);
        showToast(data.message || 'Marked as visited!', 'bg-green-600');
      }
      updateCountryColor(currentCountryCode);
      updateFABButtonStates(currentCountryCode);
    })
    .catch(() => showToast('Error updating visited status', 'bg-red-600'));
    
    if (fabMain) fabMain.click();
  };
}

if (fabWishlist) {
  fabWishlist.onclick = function() {
    console.log('Wishlist button clicked');
    console.log('currentCountryCode when clicking FAB:', currentCountryCode);
    if (!currentCountryCode) {
      showToast('Please select a country first.', 'bg-red-600');
      return;
    }
    
    const isInWishlist = wishlistCountries.has(currentCountryCode);
    const method = isInWishlist ? 'DELETE' : 'POST';
    const url = isInWishlist ? `/country/wishlist/${currentCountryCode}` : '/country/wishlist';
    
    fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: method === 'POST' ? JSON.stringify({ country_code: currentCountryCode }) : undefined
    })
    .then(res => res.json())
    .then(data => {
      if (isInWishlist) {
        wishlistCountries.delete(currentCountryCode);
        showToast(data.message || 'Removed from wishlist!', 'bg-blue-600');
      } else {
        wishlistCountries.add(currentCountryCode);
        showToast(data.message || 'Added to wishlist!', 'bg-yellow-500');
      }
      updateCountryColor(currentCountryCode);
      updateFABButtonStates(currentCountryCode);
    })
    .catch(() => showToast('Error updating wishlist status', 'bg-red-600'));
    
    if (fabMain) fabMain.click();
  };
}

if (fabNote && noteModal && noteText && noteCancel && noteSave) {
  fabNote.onclick = () => {
    noteModal.classList.remove('hidden');
    if (fabMain) fabMain.click();
  };
  noteCancel.onclick = () => {
    noteModal.classList.add('hidden');
    noteText.value = '';
  };
  noteSave.onclick = () => {
    console.log('Note save clicked');
    console.log('currentCountryCode when clicking FAB:', currentCountryCode);
    if (!currentCountryCode) {
      showToast('Please select a country first.', 'bg-red-600');
      return;
    }
    fetch('/country/note', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country_code: currentCountryCode, note: noteText.value })
    })
    .then(res => res.json())
    .then(data => showToast(data.message || 'Note saved!', 'bg-blue-600'))
    .catch(() => showToast('Error saving note', 'bg-red-600'));
    noteModal.classList.add('hidden');
    noteText.value = '';
  };
}

// Toast function
function showToast(message, color = 'bg-blue-600') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `fixed bottom-6 left-1/2 transform -translate-x-1/2 ${color} text-white px-6 py-3 rounded shadow-lg z-[200] transition`;
  toast.classList.remove('hidden');
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 2500);
}