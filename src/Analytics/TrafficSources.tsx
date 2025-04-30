import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Assuming axios is used for API requests

interface TrafficSource {
    id: number;
    source_type: string;
    source_detail: string;
    visit_count: number;
}

const TrafficSources = () => {
    const [trafficData, setTrafficData] = useState<TrafficSource[]>([]);

    useEffect(() => {
        const fetchTrafficData = async () => {
            try {
                const { data } = await axios.get<TrafficSource[]>('/api/traffic-sources');
                setTrafficData(data);
            } catch (error) {
                console.error('Error fetching traffic data:', error);
            }
        };

        fetchTrafficData();
    }, []);

    return (
        <div>
            <h2>Traffic Sources</h2>
            {trafficData.length > 0 ? (
                <ul>
                    {trafficData.map((source) => (
                        <li key={source.id}>
                            {source.source_type}: {source.source_detail} ({source.visit_count} visits)
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No data available.</p>
            )}
        </div>
    );
};

export default TrafficSources;
