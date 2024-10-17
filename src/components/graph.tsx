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

const fetchInteractionData = async (): Promise<
APIResponse<WebsiteInteractionEntry[]>
> => {
    return await fetchFromAPI("user_interaction/get", {
        oauth_token: await getOAuthToken(),
    });
};

const BarGraph = () => {
    // default start date
    let defaultStartDate = new Date(new Date().setHours(0, 0, 0, 0));
    defaultStartDate.setDate(defaultStartDate.getDate() - 7);

    const [interactions, setInteractions] = useState<
    WebsiteInteractionEntry[] | undefined
>(undefined);
    const [dataSet, setDataSet] = useState<GraphEntry[] | undefined>();
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

            for (const entry of table1) {
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
            const websiteDurations = new Map<string, number>();
            dataSet.forEach((entry) => {
                entry.consumption.forEach((duration, url) => {
                    websiteDurations.set(url, (websiteDurations.get(url) || 0) + duration);
                });
            });

            const sortedWebsites = Array.from(websiteDurations.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([url]) => url);

            const topWebsites = sortedWebsites.slice(0, 4);
            otherWebsites = sortedWebsites.slice(4);

            const datasets = topWebsites.map((website) => ({
                label: website !== "" ? website : "Google Chrome Pages",
                data: dataSet.map((entry) => entry.consumption.get(website) || 0),
                backgroundColor: colorMap.get(website) || "#000000DD",
                borderColor: "rgba(0, 0, 0, 0.1)",
                borderWidth: 1,
            }));

            const otherDataset = {
                label: "Other Websites",
                data: dataSet.map((entry) => {
                    let otherTotal = 0;
                    entry.consumption.forEach((duration, url) => {
                        if (otherWebsites.includes(url)) {
                            otherTotal += duration;
                        }
                    });
                    return otherTotal;
                }),
                backgroundColor: "#A9A9A9DD",
                borderColor: "rgba(0, 0, 0, 0.1)",
                borderWidth: 1,
            };

            if (otherWebsites.length > 0) {
                datasets.push(otherDataset);
            }

            const labels = dataSet.map((entry) =>
                `${new Date(entry.date).getDate()} ${new Date(entry.date).toLocaleDateString("en-us", { month: "short", })}`
            );

            return { labels, datasets };
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
                        console.assert(datasetLabel !== "");  // Why would this happen?
                        const value = tooltipItem.raw;

                        const formattedValue = `${Math.round(value * 100) / 100} minutes`;

                        if (datasetLabel.toLowerCase() === "other websites" && dataSet) {
                            const dateIndex = tooltipItem.dataIndex;
                            const otherWebsitesForDate =
                            Array.from(dataSet[dateIndex]?.consumption.entries() || [])
                            .filter(([url]) => otherWebsites.includes(url))
                            .map(([url, duration]) => {
                                return `${url !== "" ? url : "Google Chrome Pages"}: ${Math.round(duration * 100) / 100} mins`
                            });

                            return [`Other Websites: ${formattedValue}`, '----------------------', ...otherWebsitesForDate];
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
    );
};

// Sample data for website interactions
const table1: WebsiteInteractionEntry[] = [
    {
        url: "bbc.com",
        duration: 100,
        date: 1727839283207,
        clicks: 5,
        leaning: "LEFT",
    },
    {
        url: "bbc.com",
        duration: 50,
        date: 1727839283207,
        clicks: 3,
        leaning: "LEFT",
    },
    {
        url: "bbc.com",
        duration: 200,
        date: 1727704800000,
        clicks: 10,
        leaning: "LEFT",
    },
    {
        url: "cnn.com",
        duration: 150,
        date: 1727839283207,
        clicks: 8,
        leaning: "EXTREME-LEFT",
    },
    {
        url: "cnn.com",
        duration: 250,
        date: 1727704800000,
        clicks: 12,
        leaning: "EXTREME-LEFT",
    },
    {
        url: "cnn.com",
        duration: 300,
        date: 1727618400000,
        clicks: 15,
        leaning: "EXTREME-LEFT",
    },
    {
        url: "news.com.au",
        duration: 180,
        date: 1727839283207,
        clicks: 7,
        leaning: "CONSPIRACY",
    },
    {
        url: "news.com.au",
        duration: 220,
        date: 1727704800000,
        clicks: 9,
        leaning: "CONSPIRACY",
    },
    {
        url: "news.com.au",
        duration: 270,
        date: 1727618400000,
        clicks: 11,
        leaning: "CONSPIRACY",
    },
    {
        url: "9news.com.au",
        duration: 120,
        date: 1727839283207,
        clicks: 6,
        leaning: "RIGHT-CENTER",
    },
    {
        url: "9news.com.au",
        duration: 160,
        date: 1728624787777,
        clicks: 8,
        leaning: "RIGHT-CENTER",
    },
    {
        url: "9news.com.au",
        duration: 280,
        date: 1727618400000,
        clicks: 13,
        leaning: "RIGHT-CENTER",
    },
    {
        url: "cnn.com",
        duration: 330,
        date: 1728451980000,
        clicks: 9,
        leaning: "EXTREME-LEFT",
    },
    {
        url: "news.com.au",
        duration: 220,
        date: 1728451980000,
        clicks: 9,
        leaning: "CONSPIRACY",
    },
    {
        url: "cnn.com",
        duration: 330,
        date: 1728711180000,
        clicks: 9,
        leaning: "EXTREME-LEFT",
    },
];

export default BarGraph;
