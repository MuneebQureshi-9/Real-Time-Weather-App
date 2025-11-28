import React, { useState, useEffect, useCallback } from 'react';
import './index.css';

function App() {
    const [city, setCity] = useState('');
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [suggestions, setSuggestions] = useState([]);

    // Debounce search for suggestions
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (city.length < 2) {
                setSuggestions([]);
                return;
            }

            // Only fetch suggestions if we aren't already showing a weather result matching the input
            // (Simple check to avoid re-searching when user just clicked a suggestion)
            if (weather && weather.cityName === city) return;

            try {
                const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=5&language=en&format=json`);
                const data = await res.json();
                if (data.results) {
                    setSuggestions(data.results);
                } else {
                    setSuggestions([]);
                }
            } catch (err) {
                console.error("Suggestion fetch error:", err);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [city, weather]);

    const fetchWeather = async (lat, lon, cityName, country) => {
        setLoading(true);
        setError('');
        setSuggestions([]); // Clear suggestions on selection

        try {
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`);

            if (!res.ok) throw new Error('Failed to fetch weather data');

            const data = await res.json();
            setWeather({
                cityName,
                country,
                current: data.current,
                daily: data.daily,
                units: data.current_units
            });
        } catch (err) {
            setError('Could not retrieve weather data. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        if (!city) return;

        setLoading(true);
        setError('');
        setSuggestions([]);

        try {
            // 1. Geocode
            const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
            const geoData = await geoRes.json();

            if (!geoData.results || geoData.results.length === 0) {
                setError('City not found. Please check the spelling.');
                setLoading(false);
                return;
            }

            const { latitude, longitude, name, country } = geoData.results[0];

            // 2. Fetch Weather
            await fetchWeather(latitude, longitude, name, country);

            // Update input to match found name
            setCity(name);

        } catch (err) {
            setError('An error occurred while searching.');
            setLoading(false);
        }
    };

    const handleSuggestionClick = (place) => {
        setCity(place.name);
        fetchWeather(place.latitude, place.longitude, place.name, place.country);
    };

    // Helper to get weather icon/description based on WMO code
    const getWeatherInfo = (code) => {
        // Simplified WMO code mapping
        const codes = {
            0: { desc: 'Clear Sky', icon: '☀️' },
            1: { desc: 'Mainly Clear', icon: '🌤️' },
            2: { desc: 'Partly Cloudy', icon: '⛅' },
            3: { desc: 'Overcast', icon: '☁️' },
            45: { desc: 'Fog', icon: '🌫️' },
            48: { desc: 'Depositing Rime Fog', icon: '🌫️' },
            51: { desc: 'Light Drizzle', icon: '🌦️' },
            53: { desc: 'Moderate Drizzle', icon: '🌦️' },
            55: { desc: 'Dense Drizzle', icon: '🌧️' },
            61: { desc: 'Slight Rain', icon: '🌦️' },
            63: { desc: 'Moderate Rain', icon: '🌧️' },
            65: { desc: 'Heavy Rain', icon: '⛈️' },
            71: { desc: 'Slight Snow', icon: '🌨️' },
            73: { desc: 'Moderate Snow', icon: '🌨️' },
            75: { desc: 'Heavy Snow', icon: '❄️' },
            95: { desc: 'Thunderstorm', icon: '⚡' },
        };
        return codes[code] || { desc: 'Unknown', icon: '❓' };
    };

    return (
        <div className="app-container">
            <main className="weather-card">
                <h1 className="title">Weather Checker</h1>

                <form onSubmit={handleSearchSubmit} className="search-form">
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="Enter city name..."
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="search-input"
                        />
                        <button type="submit" className="search-btn" disabled={loading}>
                            {loading ? '...' : '🔍'}
                        </button>
                    </div>

                    {suggestions.length > 0 && (
                        <ul className="suggestions-dropdown">
                            {suggestions.map((place) => (
                                <li key={place.id} onClick={() => handleSuggestionClick(place)}>
                                    {place.name}, {place.admin1 ? `${place.admin1}, ` : ''}{place.country}
                                </li>
                            ))}
                        </ul>
                    )}
                </form>

                {error && <div className="error-message">{error}</div>}

                {weather && !loading && (
                    <div className="weather-result fade-in">
                        <div className="header-section">
                            <h2>{weather.cityName}</h2>
                            <p className="country">{weather.country}</p>
                            <div className="main-icon">
                                {getWeatherInfo(weather.current.weather_code).icon}
                            </div>
                            <p className="condition">{getWeatherInfo(weather.current.weather_code).desc}</p>
                        </div>

                        <div className="temp-section">
                            <span className="temp-value">
                                {Math.round(weather.current.temperature_2m)}
                                <span className="unit">{weather.units.temperature_2m}</span>
                            </span>
                        </div>

                        <div className="details-grid">
                            <div className="detail-item">
                                <span className="label">Wind</span>
                                <span className="value">{weather.current.wind_speed_10m} {weather.units.wind_speed_10m}</span>
                            </div>
                            <div className="detail-item">
                                <span className="label">Humidity</span>
                                <span className="value">{weather.current.relative_humidity_2m}{weather.units.relative_humidity_2m}</span>
                            </div>
                            <div className="detail-item">
                                <span className="label">Feels Like</span>
                                <span className="value">{Math.round(weather.current.apparent_temperature)}{weather.units.temperature_2m}</span>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;
