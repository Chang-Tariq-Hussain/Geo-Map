import fs from 'fs';

const continents = ['Asia', 'Africa', 'North America', 'South America', 'Antarctica', 'Europe', 'Australia'];
const categories = ['Mountains', 'Rivers', 'Lakes', 'Glaciers', 'Deserts', 'Plateaus', 'Dams', 'Passes', 'Wetlands', 'Forests'];
const baseFeatures = [
  { id: 1, continent: 'Asia', category: 'Mountains', name: 'Mount Everest', coordinates: [27.9881, 86.9250], details: 'Highest peak in the world (8,848m), located in the Himalayas, Nepal/China border.' },
  // Include the 20 entries from above
  // ... (copy the 20 entries from features.json here)
];

// Continent coordinate ranges
const continentRanges = {
  Asia: { lat: [0, 60], lon: [40, 180] },
  Africa: { lat: [-40, 40], lon: [-20, 60] },
  'North America': { lat: [10, 80], lon: [-170, -50] },
  'South America': { lat: [-60, 10], lon: [-90, -30] },
  Antarctica: { lat: [-90, -60], lon: [-180, 180] },
  Europe: { lat: [35, 70], lon: [-10, 60] },
  Australia: { lat: [-50, -10], lon: [110, 160] },
};

// Generate random coordinates
function getRandomCoordinates(continent) {
  const range = continentRanges[continent];
  const lat = Math.random() * (range.lat[1] - range.lat[0]) + range.lat[0];
  const lon = Math.random() * (range.lon[1] - range.lon[0]) + range.lon[0];
  return [lat, lon];
}

// Sample details for variety
const sampleDetails = {
  Mountains: ['Peak with elevation {elevation}m, located in {location}.', 'Known for its challenging climb in {location}.'],
  Rivers: ['Flows {length}km through {countries}.', 'Major river in {region}, supports agriculture.'],
  Lakes: ['Covers {area} km², located in {location}.', 'Important for biodiversity in {region}.'],
  Glaciers: ['Extends {length}km in {region}.', 'One of the largest glaciers in {continent}.'],
  Deserts: ['Spans {area} km² in {region}.', 'Known for its arid conditions in {location}.'],
  Plateaus: ['Average elevation {elevation}m, spans {region}.', 'Rich in minerals in {location}.'],
  Dams: ['Hydroelectric dam in {location}, powers {capacity} MW.', 'Key infrastructure in {region}.'],
  Passes: ['Trade route connecting {location1} to {location2}.', 'Historic pass in {region}.'],
  Wetlands: ['Ramsar site in {location}, supports migratory birds.', 'Vital ecosystem in {region}.'],
  Forests: ['Covers {area} km², known for {species} in {region}.', 'Protected forest in {location}.'],
};

// Generate 1,000+ features
const features = [...baseFeatures];
for (let i = baseFeatures.length + 1; i <= 1000; i++) {
  const continent = continents[Math.floor(Math.random() * continents.length)];
  const category = categories[Math.floor(Math.random() * categories.length)];
  const coordinates = getRandomCoordinates(continent);
  const detailTemplate = sampleDetails[category][Math.floor(Math.random() * sampleDetails[category].length)];
  const details = detailTemplate
    .replace('{elevation}', Math.floor(Math.random() * 8000 + 1000))
    .replace('{length}', Math.floor(Math.random() * 5000 + 100))
    .replace('{area}', Math.floor(Math.random() * 100000 + 1000))
    .replace('{capacity}', Math.floor(Math.random() * 5000 + 500))
    .replace('{location}', `${continent} region`)
    .replace('{location1}', `${continent} city`)
    .replace('{location2}', `nearby region`)
    .replace('{countries}', `${continent} countries`)
    .replace('{region}', continent)
    .replace('{continent}', continent)
    .replace('{species}', 'unique species');

  features.push({
    id: i,
    continent,
    category,
    name: `${category} ${i}`,
    coordinates,
    details,
  });
}

// Save to file
fs.writeFileSync('src/data/features.json', JSON.stringify(features, null, 2));
console.log('Generated 1000+ features in src/data/features.json');