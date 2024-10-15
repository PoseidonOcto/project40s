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

const fetchInteractionData = async (): Promise<
  APIResponse<WebsiteInteractionEntry[]>
> => {
  return await fetchFromAPI("user_interaction/get", {
    oauth_token: await getOAuthToken(),
  });
};

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

  // TODO add loading symbol
  // Update the list of unique sites from data
  useEffect(() => {
    (async () => {
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
      setDataSet(processData(sortedData, startDate, endDate));
    })();
  }, [startDate, endDate]);

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
    // Make sure times are normalised
    const start = new Date(startDate.setHours(0, 0, 0, 0));
    const end = new Date(endDate.setHours(0, 0, 0, 0));
    // Generate all dates between startDate and endDate
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

          acc[dateKey].consumption.set(url, duration / 60000); // Store duration in minutes
          acc[dateKey].political_leanings.set(url, leaning || "UNKNOWN");
        }
        return acc;
      },
      {}
    );

    // Now ensure every date is included, even if empty
    allDates.forEach((date) => {
      const dateKey = date.getTime();
      if (!processedData[dateKey]) {
        processedData[dateKey] = {
          date: dateKey,
          consumption: new Map(), // Empty map for dates without data
          political_leanings: new Map(),
        };
      }
    });

    // Sort the data by date (ascending order)
    const sortedData = Object.values(processedData).sort(
      (a, b) => a.date - b.date
    );

    return sortedData;
  };

  // Convert the timestamps to a readable format (e.g., DD/MM/YYYY)
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  // Generate chart data based on the current mode
  const getStackedBarChartData = () => {
    if (!dataSet) return { labels: [], datasets: [] };

    if (mode === "Website") {
      // Collect all unique website URLs across the dataSet
      const uniqueWebsites = new Set<string>();
      dataSet.forEach((entry) => {
        entry.consumption.forEach((_, url) => {
          uniqueWebsites.add(url);
        });
      });

      // Create datasets for each website
      const datasets = Array.from(uniqueWebsites).map((website) => {
        return {
          label: website, // The website URL will be used as the label
          data: dataSet.map((entry) => entry.consumption.get(website) || 0), // For each entry, get the duration for this website or 0 if it's not present
          backgroundColor: getRandomColor(), // Assign a random color for each website
          borderColor: "rgba(0, 0, 0, 0.1)",
          borderWidth: 1,
        };
      });

      // Labels will be the formatted dates
      const labels = dataSet.map((entry) => formatDate(entry.date));

      return {
        labels,
        datasets,
      };
    } else {
      // Mode: Bias (Political Leaning)
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

      // Create datasets for each political leaning
      const datasets = politicalLeanings.map((leaning) => {
        return {
          label: leaning,
          data: dataSet.map((entry) => {
            // Sum the durations for the given political leaning on that date
            let totalDuration = 0;
            entry.political_leanings.forEach((entryLeaning, url) => {
              if (entryLeaning === leaning) {
                totalDuration += entry.consumption.get(url) || 0;
              }
            });
            return totalDuration;
          }),
          backgroundColor: getRandomColor(), // Assign a random color for each leaning
          borderColor: "rgba(0, 0, 0, 0.1)",
          borderWidth: 1,
        };
      });

      // Labels will be the formatted dates
      const labels = dataSet.map((entry) => formatDate(entry.date));

      return {
        labels,
        datasets,
      };
    }
  };

  // Function to generate random colors for the bars
  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Consumption History",
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem: any) {
            const datasetLabel = tooltipItem.dataset.label.toLowerCase() || "";
            const value = tooltipItem.raw;

            const formattedValue = `${Math.round(value * 100) / 100} minutes`;

            return [`${mode}: ${datasetLabel}`, formattedValue];
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Date",
        },
        stacked: true, // Enable stacking on the x-axis
      },
      y: {
        title: {
          display: true,
          text: "Duration (mins)",
        },
        stacked: true, // Enable stacking on the y-axis
        beginAtZero: true,
      },
    },
  };

  const handleDateChange = (event: Event, newVal: any) => {
    setStartDate(new Date(newVal[0]));
    setEndDate(new Date(newVal[1]));
  };

  return (
    <div id="graph-container">
      {/* Apple-style switch to toggle between Website Mode and Bias Mode */}
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
          <Typography>Start date: {formatDate(startDate.getTime())}</Typography>
          <Typography>End date: {formatDate(endDate.getTime())}</Typography>
        </div>
        <Slider
          value={[startDate.getTime(), endDate.getTime()]}
          onChange={(event, newVal) => handleDateChange(event, newVal)}
          valueLabelDisplay="auto"
          min={minDate}
          step={86400000}
          max={new Date(new Date().setHours(0, 0, 0, 0)).getTime()}
          valueLabelFormat={(val) => formatDate(val)}
        />
      </div>
    </div>
  );
};

// Sample data for website interactions
const table1: WebsiteInteractionEntry[] = [
  {
    url: "https://www.bbc.com/",
    duration: 100000,
    date: 1727839283207, // Example timestamp
    clicks: 5,
    leaning: "LEFT",
  },
  {
    url: "https://www.bbc.com/",
    duration: 50000,
    date: 1727839283207,
    clicks: 3,
    leaning: "LEFT",
  },
  {
    url: "https://www.bbc.com/",
    duration: 200000,
    date: 1727704800000,
    clicks: 10,
    leaning: "LEFT",
  },
  {
    url: "https://edition.cnn.com/",
    duration: 150000,
    date: 1727839283207,
    clicks: 8,
    leaning: "EXTREME-LEFT",
  },
  {
    url: "https://edition.cnn.com/",
    duration: 250000,
    date: 1727704800000,
    clicks: 12,
    leaning: "EXTREME-LEFT",
  },
  {
    url: "https://edition.cnn.com/",
    duration: 300000,
    date: 1727618400000,
    clicks: 15,
    leaning: "EXTREME-LEFT",
  },
  {
    url: "https://www.news.com.au/",
    duration: 180000,
    date: 1727839283207,
    clicks: 7,
    leaning: "CONSPIRACY",
  },
  {
    url: "https://www.news.com.au/",
    duration: 220000,
    date: 1727704800000,
    clicks: 9,
    leaning: "CONSPIRACY",
  },
  {
    url: "https://www.news.com.au/",
    duration: 270000,
    date: 1727618400000,
    clicks: 11,
    leaning: "CONSPIRACY",
  },
  {
    url: "https://www.9news.com.au/",
    duration: 120000,
    date: 1727839283207,
    clicks: 6,
    leaning: "RIGHT-CENTER",
  },
  {
    url: "https://www.9news.com.au/",
    duration: 160000,
    date: 1727704800000,
    clicks: 8,
    leaning: "RIGHT-CENTER",
  },
  {
    url: "https://www.9news.com.au/",
    duration: 280000,
    date: 1727618400000,
    clicks: 13,
    leaning: "RIGHT-CENTER",
  },
];

export default BarGraph;
