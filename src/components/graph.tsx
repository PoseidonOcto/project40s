import React, { useEffect, useState } from 'react';
import "./graph.css"
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { WebsiteInteractionEntry, APIResponse } from '../types';
import { fetchFromAPI } from '../utils';
import { getOAuthToken } from '../background';

// Register the necessary components for Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const BarGraph = () => {
    const [interactions, setInteractions] = useState<WebsiteInteractionEntry[] | undefined>(undefined);
    const [sites, setSites] = useState<string[]>([]);
    const [siteUrl, setSiteUrl] = useState<string>("https://www.bbc.com/");
    const [startDate, setStartDate] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();

    const currentDate = new Date().toISOString().split('T')[0];

    // TODO add loading symbol
    // Update the list of unique sites from data
    useEffect(() => {
        (async () => {
            const response = await fetchInteractionData();
            if (response.status === 'error') {
                console.error(response);
                return;
            }

            for (const entry of table1) {
                response.data.push(entry);
            }

            const sortedData = response.data.sort((a, b) => a.date - b.date);
            const uniqueSites = Array.from(new Set(sortedData.map(entry => entry.url)));
            setInteractions(sortedData);
            setSites(uniqueSites);
        })();
    }, []);

    // const getWebsiteName = (url: string) => {
    //     try {
    //         return new URL(url).hostname;
    //     } catch (error) {
    //         console.error("Invalid URL:", url);
    //         return url;
    //     }
    // };

    // Handle site button click to change the site URL
    const handleSiteClick = (url: string) => {
        setSiteUrl(url);
    };

    // Convert the timestamps to a readable format (e.g., DD/MM/YYYY)
    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    // Helper function to aggregate data by date for the selected site and date range
    const aggregateDataByDate = (data: WebsiteInteractionEntry[], siteUrl: string) => {
        const filteredData = data.filter(entry => entry.url === siteUrl);

        const aggregatedData: { [key: string]: number } = {};

        filteredData.forEach(entry => {
            const formattedDate = formatDate(entry.date);

            if (aggregatedData[formattedDate]) {
                aggregatedData[formattedDate] += entry.duration;
            } else {
                aggregatedData[formattedDate] = entry.duration;
            }
        });

        return aggregatedData;
    };

    // Function to dynamically include missing dates with 0 values
    const getProcessedData = (siteUrl: string) => {
        if (interactions === undefined) {
            return [];
        }

        const aggregatedData = aggregateDataByDate(interactions, siteUrl);
        const processedData: { date: string, totalDuration: number }[] = [];
        let defaultStartDate = new Date();
        defaultStartDate.setDate(defaultStartDate.getDate() - 7);
        
        let currentDate = startDate ? new Date(startDate) : defaultStartDate;
        const end = endDate ? new Date(endDate) : new Date();

        while (currentDate <= end) {
            const formattedDate = formatDate(currentDate.getTime());
            processedData.push({
                date: formattedDate,
                totalDuration: aggregatedData[formattedDate] || 0
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return processedData;
    };

    const chartData = {
        labels: getProcessedData(siteUrl).map(entry => entry.date), // X-axis: Dates
        datasets: [
            {
                label: 'Duration Spent (min)',
                data: getProcessedData(siteUrl).map(entry => entry.totalDuration / 60000), // Y-axis: Durations in minutes
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const, 
            },
            title: {
                display: true,
                text: 'Duration Spent on Website',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    return (
        <div id="graph-container">
            <h3>Bar Chart of Website Interaction</h3>
            <br/>
            <div id="date-container">
                <label>
                    FROM: &nbsp;
                    <input
                        className="date-select-input"
                        type="date"
                        value={startDate ? startDate.toISOString().split('T')[0] : ''}
                        max={currentDate}
                        onChange={(e) => setStartDate(new Date(e.target.value))}
                    />&nbsp;
                </label>
                <label>
                    TO: &nbsp;
                    <input
                        className="date-select-input"
                        type="date"
                        value={endDate ? endDate.toISOString().split('T')[0] : ''}
                        max={currentDate}
                        onChange={(e) => setEndDate(new Date(e.target.value))}
                    />&nbsp;
                </label>
            </div>
            <br/>
            <div id="graph">
                <Bar data={chartData} options={options} />
            </div>

            <div id="graph-buttons-container">
                {sites.map((site, index) => (
                    <button
                        className={site === siteUrl ? "selected-graph-button" : "graph-button"}
                        key={index}
                        onClick={() => handleSiteClick(site)}
                    >
                        {site}
                    </button>
                ))}
            </div>

        </div>
    );
};

const fetchInteractionData = async (): Promise<APIResponse<WebsiteInteractionEntry[]>> => {
    return await fetchFromAPI("user_interaction/get", {
        oauth_token: await getOAuthToken(),
    });
}


// Sample data for website interactions
const table1: WebsiteInteractionEntry[] = [
    {
        url: "https://www.bbc.com/",
        duration: 100000,
        date: 1727839283207, // Example timestamp
        clicks: 5
    },
    {
        url: "https://www.bbc.com/",
        duration: 50000,
        date: 1727839283207, 
        clicks: 3
    },
    {
        url: "https://www.bbc.com/",
        duration: 200000,
        date: 1727704800000, 
        clicks: 10
    },
    {
        url: "https://edition.cnn.com/",
        duration: 150000,
        date: 1727839283207,
        clicks: 8
    },
    {
        url: "https://edition.cnn.com/",
        duration: 250000,
        date: 1727704800000,
        clicks: 12
    },
    {
        url: "https://edition.cnn.com/",
        duration: 300000,
        date: 1727618400000,
        clicks: 15
    },
    {
        url: "https://www.news.com.au/",
        duration: 180000,
        date: 1727839283207,
        clicks: 7
    },
    {
        url: "https://www.news.com.au/",
        duration: 220000,
        date: 1727704800000,
        clicks: 9
    },
    {
        url: "https://www.news.com.au/",
        duration: 270000,
        date: 1727618400000,
        clicks: 11
    },
    {
        url: "https://www.9news.com.au/",
        duration: 120000,
        date: 1727839283207,
        clicks: 6
    },
    {
        url: "https://www.9news.com.au/",
        duration: 160000,
        date: 1727704800000,
        clicks: 8
    },
    {
        url: "https://www.9news.com.au/",
        duration: 280000,
        date: 1727618400000,
        clicks: 13
    }
];

export default BarGraph;
