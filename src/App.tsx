import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap, ZoomControl } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import features from './data/features.json'; // Fallback to local JSON
import continents from './data/continents.json';
import { HiOutlineChevronDoubleLeft, HiOutlineChevronDoubleRight } from "react-icons/hi";
import { IoSearch, IoStatsChartSharp } from 'react-icons/io5';
import type { SelectProps } from './components/ThemeSelect';
import ThemeSelect from './components/ThemeSelect';
import { LuListFilter } from "react-icons/lu";
import logoImage from '../public/logo2.avif';
import { SiFreelancermap } from 'react-icons/si';
import './App.css';
// Fix Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
});

// Category-specific marker colors
const categoryStyles = {
  Mountains: { color: '#EF4444' }, // Red
  Rivers: { color: '#3B82F6' }, // Blue
  Lakes: { color: '#06B6D4' }, // Cyan
  Glaciers: { color: '#D1D5DB' }, // Light Gray
  Deserts: { color: '#FBBF24' }, // Yellow
  Plateaus: { color: '#8B5CF6' }, // Purple
  Dams: { color: '#34D399' }, // Green
  Passes: { color: '#F97316' }, // Orange
  Wetlands: { color: '#10B981' }, // Emerald
  Forests: { color: '#15803D' }, // Dark Green
};

// Component to handle map updates
function MapUpdater({ selectedContinent}:{selectedContinent: string}) {
  const map = useMap();

  useEffect(() => {
    const bounds = zoomToContinent(selectedContinent);
    // Ensure bounds is in the correct format for fitBounds
    // Leaflet expects LatLngBoundsExpression: LatLngBounds | LatLngTuple[] | LatLngTuple
    // If bounds is number[][], cast as [number, number][]
    map.fitBounds(bounds as [number, number][], { padding: [50, 50] });
  }, [selectedContinent, map]);

  return null;
}

// Options for Select components
const continentOptions: SelectProps[] = [
  { value: 'All', label: 'All Continents' },
  { value: 'Asia', label: 'Asia' },
  { value: 'Africa', label: 'Africa' },
  { value: 'North America', label: 'North America' },
  { value: 'South America', label: 'South America' },
  { value: 'Antarctica', label: 'Antarctica' },
  { value: 'Europe', label: 'Europe' },
  { value: 'Australia', label: 'Australia' },
];


// OPtions for Map SElect
const mapStyles = ["Aquarelle", "Backdrop", "Basic", "Bright", "Dataviz", "Landscape", "Ocean", "OpenStreetMap", "Outdoor", "Satellite", "Streets", "Toner", "Topo", "Winter"]
const mapOptions: SelectProps[] = mapStyles.map((it) => ({
  value: it.toLowerCase(),
  label: it,
}));

// Options for Category
const categoryOptions: SelectProps[] = [
  { value: 'All', label: 'All Features' },
  { value: 'Mountains', label: 'Mountains' },
  { value: 'Rivers', label: 'Rivers' },
  { value: 'Lakes', label: 'Lakes' },
  { value: 'Glaciers', label: 'Glaciers' },
  { value: 'Deserts', label: 'Deserts' },
  { value: 'Plateaus', label: 'Plateaus' },
  { value: 'Dams', label: 'Dams' },
  { value: 'Passes', label: 'Passes' },
  { value: 'Wetlands', label: 'Wetlands' },
  { value: 'Forests', label: 'Forests' },
];

function App() {
  const [selectedCategory, setSelectedCategory] = useState(() => localStorage.getItem('category') || 'All');
  const [selectedMap, setSelectedMap] = useState(() => localStorage.getItem('map') || 'outdoor');
  const [selectedContinent, setSelectedContinent] = useState(() => localStorage.getItem('continent') || 'All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [tileError, setTileError] = useState<String>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  // const [features, setFeatures] = useState([]); // Uncomment for JSONBin.io

  // Client-side rendering and data fetch
  useEffect(() => {
    setIsMounted(true);
  
    // Optional: Fetch from JSONBin.io
    // fetch('https://api.jsonbin.io/v3/b/<BIN_ID>', {
    //   headers: { 'X-Master-Key': '<YOUR_API_KEY>' }
    // })
    //   .then(res => res.json())
    //   .then(data => setFeatures(data.record))
    //   .catch(err => console.error('Failed to fetch features:', err));
  }, []);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('category', selectedCategory);
    localStorage.setItem('continent', selectedContinent);
    localStorage.setItem('map', selectedMap);
    if(window.innerWidth < 990){
      setIsSidebarOpen(false);
    }
  }, [selectedCategory, selectedContinent, selectedMap]);

  // Handle tile loading errors
  const handleTileError = (error:unknown) => {
    console.error('Tile loading error:', error);
    setTileError('Failed to load map tiles. Check your internet connection.');
  };

  // Filter features
  const filteredFeatures = features.filter(feature => {
    
    const matchesCategory = selectedCategory === 'All' || feature.category === selectedCategory;
    const matchesContinent = selectedContinent === 'All' || feature.continent === selectedContinent;
    const matchesSearch = searchQuery
      ? feature.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feature.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feature.continent.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

      if (searchQuery) {
        return matchesSearch;
      }
      return matchesCategory && matchesContinent && matchesSearch;
  });

  // Autocomplete suggestions
  const suggestions = searchQuery
    ? features
        .filter(feature =>
          feature.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          feature.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          feature.continent.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5)
        .map(feature => feature.name)
    : [];

  // Zoom to continent
  const zoomToContinent = (continent: string) => {
    const bounds = {
      Asia: [[0, 40], [60, 180]],
      Africa: [[-40, -20], [40, 60]],
      'North America': [[10, -170], [80, -50]],
      'South America': [[-60, -90], [10, -30]],
      Antarctica: [[-90, -180], [-60, 180]],
      Europe: [[35, -10], [70, 60]],
      Australia: [[-50, 110], [-10, 160]],
    } as const;
    if ((continent as keyof typeof bounds) in bounds) {
      return bounds[continent as keyof typeof bounds];
    }
    return [[-90, -180], [90, 180]];
  };


  return (
    <div className="min-h-screen w-[100vw] bg-gray-100 text-white font-sans">
      {/* Header */}
      <header className="header flex flex-col sm:flex-row bg-white text-black bg-opacity-90 px-5 py-2 flex items-center gap-2 shadow-lg">
        <div className="logo flex items-center gap-2">
        <img src={logoImage} alt="" className='h-12 object-contain'/>
        <h1 className="text-xl font-md">SnapMap</h1>
        </div>
        {/* Search Bar */}
        <div className="relative w-[30rem] max-w-full mx-auto">
            <input
              type="text"
              className="w-full py-2 px-4 bg-gray-200 text-gray-800 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:bg-white focus:ring-gray-900 transition-all duration-200"
              placeholder="Search (e.g., Nile, Asia)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <IoSearch size={24} className='absolute right-0 top-0 my-2 mx-3 text-gray-500'/>
            {suggestions.length > 0 && (
              <ul style={{zIndex:10}} className="absolute w-full bg-white shadow shadow-lg border-t rounded-lg mt-1 shadow-lg">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="p-2 hover:bg-gray-300 cursor-pointer border-t"
                    onClick={() => setSearchQuery(suggestion)}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>
        {/* <button
          className="p-2 text-2xl transition-all duration-300"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <HiOutlineX /> : <HiMenu/>}
        </button> */}
      </header> 

      <div className="flex lg:flex-row gap-3 py-2 relative">
        {/* Sidebar */}
        <div className={`sidebar sticky flex flex-col top-[72px] left-0 lg:w-1/3 bg-white shadow shadow-gray-300 rounded-md bg-opacity-80 p-6 transition-all duration-300 ${isSidebarOpen ? 'lg:flex-[30%] w-fit' : 'lg:w-16'}`}>
        <div className="flex items-center justify-between lg:mb-4">
            <h2 className={`text-lg font-semibold text-black ${isSidebarOpen ? 'block' : 'hidden'}`}>
              Explore the World
            </h2>
        <button
          className="bg-transparent text-black transition-all duration-300"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <HiOutlineChevronDoubleLeft size={24}/> : <HiOutlineChevronDoubleRight  size={24}/>}
        </button>
          
        </div>

        <div className={`${isSidebarOpen ? 'flex flex-col' : 'hidden'}`}>
          {/* Maps Filter */}
          <div className="flex items-center gap-2 my-2 border-b py-2">
            <SiFreelancermap size={20} className='text-black'/>
            <p className='text-gray-900 text-lg mb-0'>Maps</p>
          </div>
          <ThemeSelect
              options={mapOptions}
              value={selectedMap}
              onChange={(e) => setSelectedMap(e.target.value)}
              // label="Select Continent"
              // className="w-full p-3 mb-4 bg-white border text-black rounded-lg ring-0 focus:outline-none"
            />

          {/* Continent Filter */}
          <div className="flex items-center gap-2 my-2 border-b py-2">
            <LuListFilter size={20} className='text-black'/>
            <p className='text-gray-900 text-lg mb-0'>Filter</p>
          </div>
          <ThemeSelect
              options={continentOptions}
              value={selectedContinent}
              onChange={(e) => setSelectedContinent(e.target.value)}
              // label="Select Continent"
              // className="w-full p-3 mb-4 bg-white border text-black rounded-lg ring-0 focus:outline-none"
            />
          {/* Category Filter */}
          <ThemeSelect
              options={categoryOptions}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              // label="Select Category"
              // className="w-full p-3 mb-4 bg-white border text-black rounded-lg ring-0 focus:outline-none"
            />
          {/* Zoom Buttons */}
          {/* <div className="grid grid-cols-2 gap-2 mb-4">
            {['Asia', 'Africa', 'North America', 'South America', 'Antarctica', 'Europe', 'Australia'].map(continent => (
              <button
                key={continent}
                className="px-2 py-2 bg-gray-800 text-white text-sm rounded-full hover:bg-gray-900 transform hover:scale-105 transition-all duration-200 hover:bg-gray-900"
                onClick={() => setSelectedContinent(continent)}
              >
                {continent}
              </button>
            ))}
          </div> */}
          {/* Feature Details */}
          {/* {selectedFeature && (
            <div className="mt-6 p-4 bg-gray-800 rounded-lg">
              <h3 className="font-bold text-lg">{selectedFeature.name}</h3>
              <p className="text-sm text-gray-300">{selectedFeature.continent} - {selectedFeature.category}</p>
              <p className="text-sm">{selectedFeature.details}</p>
            </div>
          )} */}
          {/* Stats */}
          <div className="flex items-center gap-2 my-2 border-b py-2">
            <IoStatsChartSharp size={20} className='text-black'/>
            <p className='text-gray-900 text-lg '>Stats</p>
          </div>
          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4 text-center mt-2 text-gray-900 rounded-lg">
            <div className="features">
              <p className="text-md text-gray-600">Features</p>
              <p className='text-3xl'>{filteredFeatures.length}</p>
            </div>
            <div className="continents border-r border-l">
              <p className="text-md text-gray-600">Continents</p>
              <p className='text-3xl'> {[...new Set(features.map(f => f.continent))].length}</p>
            </div>
            <div className="categories">
              <p className="text-md text-gray-600">Categories</p>
              <p className='text-3xl'> {[...new Set(features.map(f => f.category))].length}</p>
            </div>
          </div>
        </div>    
      </div>

        {/* Map Container */}
        <div className="w-full overflow-auto">

        <div className="flex lg:w-[90%] h-[calc(100vh-100px)] min-h-[400px] bg-gray-800 rounded-xl shadow-2xl relative">
          {tileError && (
            <div className="absolute top-4 left-4 p-4 bg-red-600 text-white rounded-lg z-[1000]">
              {tileError}
            </div>
          )}
          {isMounted && (
            <MapContainer
              center={[0, 0]} // Global view
              zoom={2}
              style={{ height: '100%', width: '100%', zIndex:0 }}
              className="rounded-xl"
              zoomControl={false}
              bounds={selectedContinent !== 'All' ? (zoomToContinent(selectedContinent) as [number, number][]) : undefined}
            >
              <TileLayer
                url={`https://api.maptiler.com/maps/${selectedMap}/{z}/{x}/{y}.png?key=8kVRKh6zOwdP96UzpEYg`}
                // attribution='© <a href="https://www.maptiler.com/copyright/">MapTiler</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                eventHandlers={{ tileerror: handleTileError }}
              />
              <ZoomControl position="topright" />
              <GeoJSON
                data={continents as GeoJSON.FeatureCollection}
                style={(feature) => ({
                  fillColor: feature?.properties?.color ?? '#ccc',
                  fillOpacity: 0.4,
                  weight: 2,
                  color: '#fff',
                  opacity: 0.7,
                })}
              />
              <MarkerClusterGroup>
                {filteredFeatures.map(feature => (
                  <Marker
                    key={feature.id}
                    position={feature.coordinates as [number, number]}
                    icon={L.divIcon({
                      className: 'custom-icon animate-pulse',
                      html: `<div style="background-color: ${(categoryStyles as Record<string, { color: string }>)[feature.category]?.color || '#000'}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 8px ${(categoryStyles as Record<string, { color: string }>)[feature.category]?.color || '#000'};"></div>`,
                    })}
                    eventHandlers={{
                      // click: () => setSelectedFeature(feature as any),
                      mouseover: (e) => e.target.openPopup(),
                      mouseout: (e) => e.target.closePopup(),
                    }}
                  >
                    <Popup>
                      <h3 className="font-bold">{feature.name}</h3>
                      <p>{feature.continent} - {feature.category}</p>
                      <p>{feature.details}</p>
                    </Popup>
                  </Marker>
                ))}
              </MarkerClusterGroup>
              <MapUpdater selectedContinent={selectedContinent} />
            </MapContainer>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}

// Zoom to continent bounds
function zoomToContinent(continent: string) {
  const bounds = {
    Asia: [[0, 40], [60, 180]],
    Africa: [[-40, -20], [40, 60]],
    'North America': [[10, -170], [80, -50]],
    'South America': [[-60, -90], [10, -30]],
    Antarctica: [[-90, -180], [-60, 180]],
    Europe: [[35, -10], [70, 60]],
    Australia: [[-50, 110], [-10, 160]],
  };
  return bounds[continent as keyof typeof bounds] || [[-90, -180], [90, 180]];
}

export default App;