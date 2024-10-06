import React, { useEffect, useState } from 'react';
import "./graph.css"
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { WebsiteInteractionEntry } from '../types';

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
    // Sample data for website interactions
    const table1: WebsiteInteractionEntry[] = [
        {
            user_id: 1,
            url: "https://www.bbc.com/",
            duration: 100000,
            date: 1727839283207, // Example timestamp
            clicks: 5
        },
        {
            user_id: 1,
            url: "https://www.bbc.com/",
            duration: 50000,
            date: 1727839283207, 
            clicks: 3
        },
        {
            user_id: 1,
            url: "https://www.bbc.com/",
            duration: 200000,
            date: 1727704800000, 
            clicks: 10
        },
        {
            user_id: 1,
            url: "https://edition.cnn.com/",
            duration: 150000,
            date: 1727839283207,
            clicks: 8
        },
        {
            user_id: 1,
            url: "https://edition.cnn.com/",
            duration: 250000,
            date: 1727704800000,
            clicks: 12
        },
        {
            user_id: 1,
            url: "https://edition.cnn.com/",
            duration: 300000,
            date: 1727618400000,
            clicks: 15
        },
        {
            user_id: 1,
            url: "https://www.news.com.au/",
            duration: 180000,
            date: 1727839283207,
            clicks: 7
        },
        {
            user_id: 1,
            url: "https://www.news.com.au/",
            duration: 220000,
            date: 1727704800000,
            clicks: 9
        },
        {
            user_id: 1,
            url: "https://www.news.com.au/",
            duration: 270000,
            date: 1727618400000,
            clicks: 11
        },
        {
            user_id: 1,
            url: "https://www.9news.com.au/",
            duration: 120000,
            date: 1727839283207,
            clicks: 6
        },
        {
            user_id: 1,
            url: "https://www.9news.com.au/",
            duration: 160000,
            date: 1727704800000,
            clicks: 8
        },
        {
            user_id: 1,
            url: "https://www.9news.com.au/",
            duration: 280000,
            date: 1727618400000,
            clicks: 13
        }
    ];

    const [data, setData] = useState(table1);
    const [sites, setSites] = useState<string[]>([]);
    const [siteUrl, setSiteUrl] = useState<string>("https://www.bbc.com/");
    const [startDate, setStartDate] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();

    const currentDate = new Date().toISOString().split('T')[0];

    // Update the list of unique sites from data
    useEffect(() => {
        const sortedData = data.sort((a, b) => a.date - b.date);
        setData(sortedData);

        const uniqueSites = Array.from(new Set(data.map(entry => entry.url)));
        setSites(uniqueSites);
    }, [data]);

    const getWebsiteName = (url: string) => {
        try {
            return new URL(url).hostname;
        } catch (error) {
            console.error("Invalid URL:", url);
            return url;
        }
    };

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
    const aggregateDataByDate = (siteUrl: string) => {
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
        const aggregatedData = aggregateDataByDate(siteUrl);
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
        <div>
            <h2>Bar Chart of Website Interaction</h2>

            <div>
                {sites.map((site, index) => (
                    <button
                        className="graph-button"
                        key={index}
                        onClick={() => handleSiteClick(site)}
                        style={{
                            backgroundColor: site === siteUrl ? 'blue' : 'gray',
                        }}
                    >
                        {getWebsiteName(site)}
                    </button>
                ))}
            </div>
            <br/>
            <div>
                <label>
                    Start Date:&nbsp;
                    <input
                        className="date-select-input"
                        type="date"
                        value={startDate ? startDate.toISOString().split('T')[0] : ''}
                        max={currentDate}
                        onChange={(e) => setStartDate(new Date(e.target.value))}
                    />&nbsp;
                </label>
                <label>
                    End Date:&nbsp;
                    <input
                        className="date-select-input"
                        type="date"
                        value={endDate ? endDate.toISOString().split('T')[0] : ''}
                        max={currentDate}
                        onChange={(e) => setEndDate(new Date(e.target.value))}
                    />&nbsp;
                </label>
            </div>

            <div style={{ width: '600px', height: '400px', margin: '0 auto' }}>
                <Bar data={chartData} options={options} />
            </div>
        </div>
    );
};

export default BarGraph;
