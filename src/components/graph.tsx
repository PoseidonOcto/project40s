import React, { useEffect, useState } from "react";
import Slider from "@mui/material/Slider";
import { Typography, Switch, FormControlLabel } from "@mui/material";
import "./graph.css";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { WebsiteInteractionEntry, APIResponse, GraphEntry } from "../types";
import { fetchFromAPI } from "../utils";
import { getOAuthToken } from "../background";

// Register the necessary components for Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const fetchInteractionData = async (): Promise< APIResponse<WebsiteInteractionEntry[]> > => {
    return await fetchFromAPI("user_interaction/get", {
        oauth_token: await getOAuthToken(),
    });
};

const BarGraph = () => {
    // default start date
    let defaultStartDate = new Date(new Date().setHours(0, 0, 0, 0));
    defaultStartDate.setDate(defaultStartDate.getDate() - 7);

    const [interactions, setInteractions] = useState< WebsiteInteractionEntry[] | undefined >(undefined);
    const [dataSet, setDataSet] = useState<GraphEntry[] | undefined>(undefined);
    const [startDate, setStartDate] = useState<Date>(defaultStartDate);
    const [endDate, setEndDate] = useState<Date>(new Date());
    const [minDate, setMinDate] = useState<number>();
    const [mode, setMode] = useState<"Website" | "Bias">("Website"); // Toggle between website and bias modes
    const [colorMap, setColorMap] = useState<Map<string, string>>(new Map());

    // Fetch and preprocess data, including generating the color map
    useEffect(() => {
        const updateData = async () => {
            const response = await fetchInteractionData();
            if (response.status === "error") {
                console.error(response);
                return;
            }

            for (const entry of dataForDemo) {
                response.data.push(entry);
            }

            const sortedData = response.data.sort((a, b) => a.date - b.date);
            setMinDate(sortedData[0].date);
            setInteractions(sortedData);

            // Generate the color map once when data is fetched
            const newColorMap = generateColorMap(sortedData);
            setColorMap(newColorMap);

            // Process the data for the initial date range
            const processedData = processData(sortedData, startDate, endDate);
            setDataSet(processedData);
        };

        updateData();

        chrome.tabs.onActivated.addListener(() => {
            updateData();
        });

        chrome.storage.onChanged.addListener((changed, type) => {
            if (type === 'session' && changed['data_deleted'] !== undefined) {
                updateData();
            }
        });
    }, []);

    // Update the data set whenever the date range changes, but reuse the color map
    useEffect(() => {
        if (interactions) {
            const processedData = processData(interactions, startDate, endDate);
            setDataSet(processedData);
        }
    }, [startDate, endDate, interactions]);

    // Function to generate a color map based on the websites found in the interactions
    const generateColorMap = (entries: WebsiteInteractionEntry[]) => {
        const newColorMap = new Map<string, string>();

        entries.forEach((entry) => {
            const url = entry.url;
            if (!newColorMap.has(url)) {
                newColorMap.set(url, getColourForWebsite(url) + "DD");
            }
        });

        return newColorMap;
    };

    // Function to generate a color based on a hash of the website URL
    const getColourForWebsite = (url: string) => {
        let hash = 0;
        for (let i = 0; i < url.length; i++) {
            hash = url.charCodeAt(i) + ((hash << 5) - hash);
            hash = hash & hash; // Convert to 32bit integer
        }

        // Convert the hash to a hex color
        const color = `#${((hash >> 24) & 0xff).toString(16).padStart(2, "0")}${
                        ((hash >> 16) & 0xff) .toString(16) .padStart(2, "0")}${
                        ((hash >> 8) & 0xff) .toString(16) .padStart(2, "0")}`;
        return color;
    };

    // Function to generate all dates between two dates
    const getAllDatesInRange = (start: Date, end: Date): Date[] => {
        const dates: Date[] = [];
        let currentDate = new Date(new Date(start).setHours(0, 0, 0, 0));

        while (currentDate <= end) {
            dates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return dates;
    };

    // Process interaction entry into graph dataset using start and end dates
    const processData = (
        entries: WebsiteInteractionEntry[],
        startDate: Date,
        endDate: Date
    ) => {
        // Normalize times
        const start = new Date(startDate.setHours(0, 0, 0, 0));
        const end = new Date(endDate.setHours(0, 0, 0, 0));
        const allDates = getAllDatesInRange(start, end);

        // Reduce the entries into Graph Entry format
        const processedData = entries.reduce<Record<number, GraphEntry>>(
            (acc, entry) => {
                const { date, url, duration, leaning } = entry;
                const entryDate = new Date(new Date(date).setHours(0, 0, 0, 0));

                if (entryDate >= startDate && entryDate <= endDate) {
                    const dateKey = entryDate.getTime();

                    if (!acc[dateKey]) {
                        acc[dateKey] = {
                            date: dateKey,
                            consumption: new Map(),
                            political_leanings: new Map(),
                        };
                    }

                    // Aggregate durations over period
                    const durationInMins = duration / 60;
                    if (acc[dateKey].consumption.get(url) === undefined) {
                        acc[dateKey].consumption.set(url, durationInMins);
                    } else {
                        acc[dateKey].consumption.set(url, durationInMins + acc[dateKey].consumption.get(url)!);
                    }

                    acc[dateKey].political_leanings.set(url, leaning || "UNKNOWN");
                }
                return acc;
            },
            {}
        );

        // Ensure every date is included, even if empty
        allDates.forEach((date) => {
            const dateKey = date.getTime();
            if (!processedData[dateKey]) {
                processedData[dateKey] = {
                    date: dateKey,
                    consumption: new Map(),
                    political_leanings: new Map(),
                };
            }
        });

        return Object.values(processedData).sort((a, b) => a.date - b.date);
    };

    let otherWebsites: string[] = [];

    const getStackedBarChartData = () => {
        if (!dataSet) return { labels: [], datasets: [] };
    
        if (mode === "Website") {
            const datasets: any[] = [];
            const allLabels = dataSet.map((entry) =>
                `${new Date(entry.date).getDate()} ${new Date(entry.date).toLocaleDateString("en-us", { month: "short", })}`
            );
    
            // Create a Map to hold the dataset entries for each website
            const siteData: Record<string, number[]> = {};
            const otherData: number[] = [];
            const otherWebsitesPerDate: Record<number, [string, number][]> = {}; // Store other websites with duration for each date
    
            dataSet.forEach((entry, dateIndex) => {
                // Sort the websites by duration for this specific date
                const sortedWebsites = Array.from(entry.consumption.entries())
                    .sort((a, b) => b[1] - a[1]); // Sort by duration (descending)
    
                // Get the top 4 websites for this date (if more than 5 websites)
                const topWebsites = sortedWebsites.length > 5 ? sortedWebsites.slice(0, 4): sortedWebsites.slice(0, 5);
                const topWebsiteURLs = topWebsites.map(([url]) => url); // Extract just the URLs
    
                // Store the top 4 websites' data
                topWebsites.forEach(([url, duration]) => {
                    if (!siteData[url]) {
                        siteData[url] = new Array(dataSet.length).fill(0); // Create an array filled with 0 for each date
                    }
                    siteData[url][dateIndex] = duration;
                });
    
                // Aggregate the remaining websites into "Other Websites"
                const otherWebsites = sortedWebsites.length > 5 ? sortedWebsites.slice(4): sortedWebsites.slice(5);
                const otherTotal = otherWebsites.reduce((total, [url, duration]) => total + duration, 0);
                otherData[dateIndex] = otherTotal;
    
                // Store the other websites and their durations for this date to be accessed later in the tooltip
                otherWebsitesPerDate[dateIndex] = otherWebsites.map(([url, duration]) => [url, duration]);
            });
    
            // Convert the siteData map into datasets for each website
            Object.entries(siteData).forEach(([url, data]) => {
                datasets.push({
                    label: url !== "" ? url : "Google Chrome Pages",
                    data,
                    backgroundColor: colorMap.get(url) || "#000000DD",
                    borderColor: "rgba(0, 0, 0, 0.1)",
                    borderWidth: 1,
                });
            });
    
            // Add the "Other Websites" dataset
            datasets.push({
                label: "Other Websites",
                data: otherData,
                backgroundColor: "#A9A9A9DD",
                borderColor: "rgba(0, 0, 0, 0.1)",
                borderWidth: 1,
            });
    
            return {
                labels: allLabels,
                datasets,
                otherWebsitesPerDate, // Return this so we can access it in the tooltip
            };
        } else {
            const politicalLeanings = [
                "EXTREME-LEFT",
                "LEFT",
                "LEFT-CENTER",
                "CENTER",
                "RIGHT-CENTER",
                "RIGHT",
                "EXTREME-RIGHT",
                "CONSPIRACY",
                "PRO_SCIENCE",
                "SATIRE",
                "UNKNOWN",
            ];

            const datasets = politicalLeanings.map((leaning) => ({
                label: leaning,
                data: dataSet.map((entry) => {
                    let totalDuration = 0;
                    entry.political_leanings.forEach((entryLeaning, url) => {
                        if (entryLeaning === leaning) {
                            totalDuration += entry.consumption.get(url) || 0;
                        }
                    });
                    return totalDuration;
                }),
                backgroundColor: biasColors[leaning] + "DD",
                borderColor: "rgba(0, 0, 0, 0.1)",
                borderWidth: 1,
            }));

            const labels = dataSet.map((entry) =>
                `${new Date(entry.date).getDate()} ${new Date(entry.date).toLocaleDateString("en-us", { month: "short", })}`
            );

            return { labels, datasets };
        }
    };

    const biasColors: Record<string, string> = {
        "EXTREME-RIGHT": "#800000",
        RIGHT: "#FF0000",
        "RIGHT-CENTER": "#FFB200",
        CENTER: "#FFFFFF",
        "LEFT-CENTER": "#A0DFFF",
        LEFT: "#7FBFFF",
        "EXTREME-LEFT": "#0000FF",
        CONSPIRACY: "#800080",
        PRO_SCIENCE: "#008000",
        SATIRE: "#FF69B4",
        UNKNOWN: "#A9A9A9",
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: "top" as const },
            title: { display: true, text: "Consumption History" },
            tooltip: {
                callbacks: {
                    label: (tooltipItem: any) => {
                        const datasetLabel = tooltipItem.dataset.label || "";
                        const value = tooltipItem.raw;
                        const dateIndex = tooltipItem.dataIndex;
    
                        const formattedValue = `${Math.round(value * 100) / 100} minutes`;
    
                        const chartData = getStackedBarChartData(); // Call the function to get the latest data
                        const otherWebsitesPerDate = chartData.otherWebsitesPerDate;
    
                        if (datasetLabel.toLowerCase() === "other websites" && otherWebsitesPerDate) {
                            // Safely check if otherWebsitesPerDate exists before accessing
                            const otherWebsitesForDate = otherWebsitesPerDate[dateIndex] || [];
    
                            // Map each other website to its duration in minutes
                            const otherWebsitesWithDuration = otherWebsitesForDate.map(([url, duration]) => {
                                const durationInMinutes = `${Math.round(duration * 100) / 100} mins`;
                                return `${url !== "" ? url : "Google Chrome Pages"}: ${durationInMinutes}`;
                            });
    
                            // Return the list of other websites and their duration
                            return [`Other Websites: ${formattedValue}`, '----------------------', ...otherWebsitesWithDuration];
                        }
    
                        return [`${datasetLabel}: ${formattedValue}`];
                    },
                },
            },
        },
        scales: {
            x: { title: { display: true, text: "Date" }, stacked: true },
            y: { title: { display: true, text: "Duration (mins)" }, stacked: true, beginAtZero: true },
        },
    };
    
    
    

    const handleDateChange = (event: Event, newVal: any) => {
        setStartDate(new Date(newVal[0]));
        setEndDate(new Date(newVal[1]));
    };

    return (
        <>
            {dataSet === undefined && <div id="graph-loading-icon" className="loadingIcon"></div>}
            {dataSet !== undefined &&
                <div id="graph-container">
                    <FormControlLabel
                        control={
                            <Switch
                                checked={mode === "Bias"}
                                onChange={() => setMode(mode === "Website" ? "Bias" : "Website")}
                                color="primary"
                            />
                        }
                        label={mode === "Website" ? "Website Mode" : "Bias Mode"}
                    />
                    <br />
                    <div id="graph">
                        <Bar data={getStackedBarChartData()} options={chartOptions} />
                    </div>
                    <div id="date-container">
                        <div id="date-picker">
                            <Typography>Start date: {`${startDate.getDate()} ${startDate.toLocaleDateString("en-us", { month: "short" })}`}</Typography>
                            <Typography>End date: {`${endDate.getDate()} ${endDate.toLocaleDateString("en-us", { month: "short" })}`}</Typography>
                        </div>
                        <Slider
                            value={[startDate.getTime(), endDate.getTime()]}
                            onChange={(event, newVal) => handleDateChange(event, newVal)}
                            valueLabelDisplay="auto"
                            min={minDate}
                            step={86400000}
                            max={new Date(new Date().setHours(0, 0, 0, 0)).getTime()}
                            valueLabelFormat={(val) =>
                                `${new Date(val).getDate()} ${new Date(val).toLocaleDateString("en-us", { month: "short", })}`
                            }
                        />
                    </div>
                </div>
            }
        </>
    );
};

const dataForDemo: WebsiteInteractionEntry[] = [
    {
        url: "foxbusiness.com",
        duration: 167,
        date: 1728927903651,
        clicks: 9,
        leaning: "RIGHT-CENTER",
    },
    {
        url: "billingsgazette.com",
        duration: 310,
        date: 1729086963651,
        clicks: 10,
        leaning: "RIGHT-CENTER",
    },
    {
        url: "foxkansas.com",
        duration: 215,
        date: 1728206463651,
        clicks: 11,
        leaning: "RIGHT-CENTER",
    },
    {
        url: "jacobin.com",
        duration: 320,
        date: 1728607863651,
        clicks: 9,
        leaning: "LEFT",
    },
    {
        url: "michiganadvance.com",
        duration: 386,
        date: 1728460863651,
        clicks: 9,
        leaning: "LEFT",
    },
    {
        url: "fitsnews.com",
        duration: 206,
        date: 1728356463651,
        clicks: 13,
        leaning: "RIGHT-CENTER",
    },
    {
        url: "eclecticobserver.com",
        duration: 364,
        date: 1728412863651,
        clicks: 12,
        leaning: "RIGHT-CENTER",
    },
    {
        url: "guardianlv.com",
        duration: 208,
        date: 1728376863651,
        clicks: 11,
        leaning: "LEFT",
    },
    {
        url: "cnn.com",
        duration: 317,
        date: 1728670863651,
        clicks: 14,
        leaning: "LEFT",
    },
    {
        url: "newrepublic.com",
        duration: 207,
        date: 1728802263651,
        clicks: 8,
        leaning: "LEFT",
    },
    {
        url: "newrepublic.com",
        duration: 360,
        date: 1728369603651,
        clicks: 10,
        leaning: "LEFT",
    },
    {
        url: "foxkansas.com",
        duration: 329,
        date: 1728288663651,
        clicks: 8,
        leaning: "RIGHT-CENTER",
    },
    {
        url: "foxbusiness.com",
        duration: 270,
        date: 1728251163651,
        clicks: 7,
        leaning: "RIGHT-CENTER",
    },
    {
        url: "financialexpress.com",
        duration: 263,
        date: 1728685263651,
        clicks: 13,
        leaning: "RIGHT-CENTER",
    },
    {
        url: "freedomnews.org.uk",
        duration: 254,
        date: 1728710763651,
        clicks: 5,
        leaning: "LEFT",
    },
    {
        url: "breakingdefense.com",
        duration: 390,
        date: 1728642663651,
        clicks: 9,
        leaning: "RIGHT-CENTER",
    },
    {
        url: "justfacts.com",
        duration: 199,
        date: 1728292863651,
        clicks: 8,
        leaning: "RIGHT-CENTER",
    },
    {
        url: "detroitnews.com",
        duration: 152,
        date: 1728322263651,
        clicks: 13,
        leaning: "RIGHT-CENTER",
    },
    {
        url: "michiganadvance.com",
        duration: 380,
        date: 1728213663651,
        clicks: 11,
        leaning: "LEFT",
    },
    {
        url: "guardianlv.com",
        duration: 295,
        date: 1728698463651,
        clicks: 13,
        leaning: "LEFT",
    },
    {
        url: "foxbusiness.com",
        duration: 263,
        date: 1728475263651,
        clicks: 7,
        leaning: "RIGHT-CENTER",
    },
    {
        url: "alternet.org",
        duration: 305,
        date: 1728710763651,
        clicks: 11,
        leaning: "LEFT",
    },
    {
        url: "alternet.org",
        duration: 388,
        date: 1728846663651,
        clicks: 7,
        leaning: "LEFT",
    },
    {
        url: "guardianlv.com",
        duration: 224,
        date: 1728751263651,
        clicks: 6,
        leaning: "LEFT",
    },
    {
        url: "californiaglobe.com",
        duration: 280,
        date: 1728364863651,
        clicks: 8,
        leaning: "RIGHT-CENTER",
    },
    {
        url: "boingboing.net",
        duration: 256,
        date: 1728719863651,
        clicks: 9,
        leaning: "LEFT",
    },
    {
        url: "jacobin.com",
        duration: 319,
        date: 1728252663651,
        clicks: 10,
        leaning: "LEFT",
    },
    {
        url: "foxbusiness.com",
        duration: 232,
        date: 1728472063651,
        clicks: 14,
        leaning: "RIGHT-CENTER",
    },
    {
        url: "foxkansas.com",
        duration: 221,
        date: 1728630663651,
        clicks: 8,
        leaning: "RIGHT-CENTER",
    },
    {
        url: "freedomnews.org.uk",
        duration: 328,
        date: 1728380463651,
        clicks: 13,
        leaning: "LEFT",
    },
    {
        url: "californiaglobe.com",
        duration: 216,
        date: 1728398463651,
        clicks: 9,
        leaning: "RIGHT-CENTER",
    },
    {
        url: "guardianlv.com",
        duration: 338,
        date: 1728306063651,
        clicks: 9,
        leaning: "LEFT",
    },
    {
        url: "justfacts.com",
        duration: 375,
        date: 1728393063651,
        clicks: 7,
        leaning: "RIGHT-CENTER",
    },
    {
        url: "freedomnews.org.uk",
        duration: 312,
        date: 1728714463651,
        clicks: 6,
        leaning: "LEFT",
    },
    {
        url: "jacobin.com",
        duration: 182,
        date: 1728296463651,
        clicks: 12,
        leaning: "LEFT",
    },
    {
        url: "cnn.com",
        duration: 391,
        date: 1728859863651,
        clicks: 9,
        leaning: "LEFT",
    },
    {
        url: "californiaglobe.com",
        duration: 341,
        date: 1728497463651,
        clicks: 10,
        leaning: "RIGHT-CENTER",
    },
    {
        url: "boingboing.net",
        duration: 160,
        date: 1728216063651,
        clicks: 6,
        leaning: "LEFT",
    },
    {
        url: "cnn.com",
        duration: 204,
        date: 1728765663651,
        clicks: 13,
        leaning: "LEFT",
    },
    {
        url: "foxbusiness.com",
        duration: 285,
        date: 1728586263651,
        clicks: 12,
        leaning: "RIGHT-CENTER",
    },
    {
        url: "fitsnews.com",
        duration: 213,
        date: 1728523863651,
        clicks: 9,
        leaning: "RIGHT-CENTER",
    },
    {
        url: "freedomnews.org.uk",
        duration: 154,
        date: 1728490263651,
        clicks: 10,
        leaning: "LEFT",
    },
];


export default BarGraph;
