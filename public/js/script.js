var map = L.map('map').setView([20, 0], 2);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

fetch("https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson")

      .then(res => res.json())
      .then(geoData => {
        L.geoJSON(geoData, {
          style: {
            color: "#ccc",
            weight: 1,
            fillOpacity: 0.1
          },
          onEachFeature: function (feature, layer) {
            layer.on('click', function () {
              console.log(feature.properties)
              const countryName = feature.properties.name;
              const countryCode = feature.properties["ISO3166-1-Alpha-3"] || feature.properties["ISO3166-1-Alpha-2"];
              console.log(`Clicked on: ${countryName} [${countryCode}]`);
              // Later: fetch(`/country/${countryCode}`);
            });
          }
        }).addTo(map);
      })
      .catch(err => console.error("GeoJSON load error:", err));
