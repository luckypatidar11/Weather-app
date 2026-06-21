import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";

function App() {

    const [search, setSearch] = useState('');
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [suggestions, setSuggestions] = useState([]);

    async function fetchSuggestions(query) {
        try {
            const response = await fetch(`https://api.weatherapi.com/v1/search.json?key=d04876ad4f7a4e03a96125057262505&q=${encodeURIComponent(query)}`);
            const result = await response.json();

            if (Array.isArray(result)) {
                setSuggestions(result);
            } else {
                setSuggestions([]);
            }
        } catch (error) {
            setSuggestions([]);
        }
    }

    useEffect(() => {
        if (!search.trim()) {
            setSuggestions([]);
            return;
        }

        const timer = setTimeout(() => {
            fetchSuggestions(search.trim());
        }, 250);

        return () => clearTimeout(timer);
    }, [search]);

    async function weatherinfo() {
        const query = search.trim();

        if (!query) {
            setError('Please enter a location');
            setData(null);
            return;
        }

        const match = suggestions.find((item) => item.name.toLowerCase() === query.toLowerCase());
        if (!match) {
            setError('Please select a full location from the suggestions.');
            setData(null);
            return;
        }

        setError('');

        try {
            const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=d04876ad4f7a4e03a96125057262505&q=${encodeURIComponent(query)}&aqi=no`);
            const result = await response.json();

            if (!response.ok || result.error) {
                setError('Location does not exist');
                setData(null);
                return;
            }

            setData(result);
            setSuggestions([]);
        } catch (error) {
            console.log(error);
            setError('Unable to load weather data.');
            setData(null);
        }
    }

    function handleSelectSuggestion(name) {
        setSearch(name);
        setSuggestions([]);
        setError('');
    }

    return (
        <div className="header">
            <h1>Weather App</h1>

            <div className="search-box">
                <input
                    type="text"
                    placeholder="Search location"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button onClick={weatherinfo}>Search</button>
            </div>

            {suggestions.length > 0 && (
                <ul className="suggestions">
                    {suggestions.map((item) => (
                        <li key={item.id ?? item.name} onClick={() => handleSelectSuggestion(item.name)}>
                            {item.name}{item.region ? `, ${item.region}` : ''}{item.country ? `, ${item.country}` : ''}
                        </li>
                    ))}
                </ul>
            )}

            {error ? (
                <div className="card empty">
                    <p>{error}</p>
                </div>
            ) : data?.location ? (
                <div className="card">
                    <div className="location">
                        <div>
                            <h2>{data.location.name}, {data.location.region}</h2>
                            <p>{data.location.country}</p>
                        </div>
                        <div className="local-time">{data.location.localtime}</div>
                    </div>

                    <div className="weather-main">
                        <img
                            src={data.current.condition.icon}
                            alt={data.current.condition.text}
                        />
                        <div>
                            <p className="temp">{data.current.temp_c}°C</p>
                            <p className="condition">{data.current.condition.text}</p>
                        </div>
                    </div>

                    <div className="weather-details">
                        <div>
                            <span>Feels like</span>
                            <strong>{data.current.feelslike_c}°C</strong>
                        </div>
                        <div>
                            <span>Humidity</span>
                            <strong>{data.current.humidity}%</strong>
                        </div>
                        <div>
                            <span>Wind</span>
                            <strong>{data.current.wind_kph} kph {data.current.wind_dir}</strong>
                        </div>
                        <div>
                            <span>Pressure</span>
                            <strong>{data.current.pressure_mb} mb</strong>
                        </div>
                        <div>
                            <span>Precipitation</span>
                            <strong>{data.current.precip_mm} mm</strong>
                        </div>
                        <div>
                            <span>Visibility</span>
                            <strong>{data.current.vis_km} km</strong>
                        </div>
                        <div>
                            <span>UV index</span>
                            <strong>{data.current.uv}</strong>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="card empty">
                    <p>Type a location and click Search to get the latest weather details.</p>
                </div>
            )}
        </div>
    );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);