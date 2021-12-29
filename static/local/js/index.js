import Analyzer from "./analyzer.js";

const HOUR_MILLIS = 60 * 60 * 1000;
const DAY_MILLIS = HOUR_MILLIS * 24;

const minValueReducer = (prev, curr) => (prev.value < curr.value ? prev : curr);
const maxValueReducer = (prev, curr) => (prev.value > curr.value ? prev : curr);

window.addEventListener("load", () => {
    const moduleContainer = document.getElementById("module-container");
    const analyzer = new Analyzer(moduleContainer, 3);

    /*
        Register modules
     */
    analyzer.addModule(
        "Downward trend finder",
        "Find the longest period of consecutive bearish days",
        (data) => {
            const { prices } = data;

            let trendStart = -1;
            let trendLength = 0;

            let longestTrendStart = -1;
            let longestTrendLength = -1;

            for (let i = 1; i < prices.length; i += 1) {
                const bearish = prices[i].value < prices[i - 1].value;

                if (bearish) {
                    if (trendLength === 0) {
                        trendStart = i;
                    }

                    trendLength += 1;
                    if (trendLength > longestTrendLength) {
                        longestTrendLength = trendLength;
                        longestTrendStart = trendStart;
                    }
                } else {
                    trendLength = 0;
                }
            }

            let result;
            if (longestTrendLength <= 0) {
                result = "No bearish days on selected range";
            } else {
                const startDateStr = prices[longestTrendStart].timestamp.toLocaleDateString();
                const endDateStr = prices[longestTrendStart + longestTrendLength - 1].timestamp.toLocaleDateString();

                result = `
                        ${longestTrendLength} ${longestTrendLength === 1 ? "day" : "days"}
                        <span class="no-break">
                            (${startDateStr} - ${endDateStr})
                        </span>
                    `;
            }

            return `
                    <p>${result}</p>
                `;
        },
    );

    analyzer.addModule(
        "Highest trading volume finder",
        "Find the date with the highest trading volume",
        (data) => {
            const { total_volumes: totalVolumes } = data;

            const maxVolumeDate = totalVolumes.reduce(maxValueReducer);

            const maxVolumeDateStr = maxVolumeDate.timestamp.toLocaleDateString();
            const volumeStr = Math.round(maxVolumeDate.value)
                .toLocaleString();

            const result = `
                        ${maxVolumeDateStr}
                        <span class="no-break">
                            (${volumeStr} ${data.metadata.currency})
                        </span>
                    `;

            return `
                    <p>${result}</p>
                `;
        },
    );

    analyzer.addModule(
        "Time Machine",
        "Find the best days to buy and sell bitcoins",
        (data) => {
            const { prices } = data;

            // keep track of the max price on the right side (future)
            const maxPriceArray = Array(prices.length)
                .fill(0);
            for (let i = prices.length - 1; i > 0; i -= 1) {
                maxPriceArray[i - 1] = Math.max(maxPriceArray[i], prices[i].value);
            }

            let maxDelta = 0;
            let buyPrice = 0;
            let sellPrice = 0;
            for (let i = 0; i < prices.length - 1; i += 1) {
                const delta = maxPriceArray[i] - prices[i].value;

                if (delta > maxDelta) {
                    maxDelta = delta;

                    buyPrice = prices[i].value;
                    sellPrice = maxPriceArray[i];
                }
            }

            let result;
            if (maxDelta === 0) {
                result = "No good days to buy/sell found";
            } else {
                let i = 0;
                for (; i < prices.length; i += 1) {
                    if (prices[i].value === buyPrice) {
                        break;
                    }
                }
                const buyIndex = i;

                for (; i < prices.length; i += 1) {
                    if (prices[i].value === sellPrice) {
                        break;
                    }
                }
                const sellIndex = i;

                const buyDateStr = prices[buyIndex].timestamp.toLocaleDateString();
                const sellDateStr = prices[sellIndex].timestamp.toLocaleDateString();

                const formattedDelta = Math.round(maxDelta)
                    .toLocaleString();

                result = `
                        Buy on ${buyDateStr} and sell on ${sellDateStr}
                        <span class="no-break">
                            (change: ${formattedDelta} ${data.metadata.currency})
                        </span>
                    `;
            }

            return `
                    <p>${result}</p>
                `;
        },
    );

    analyzer.addModule(
        "OP Time Machine",
        "Find the best days to buy and sell bitcoins, if the order of the days doesn't matter",
        (data) => {
            const { prices } = data;

            const maxPrice = prices.reduce(maxValueReducer);
            const minPrice = prices.reduce(minValueReducer);

            const delta = maxPrice.value - minPrice.value;

            let result;
            if (delta === 0) {
                result = "No good days to buy/sell found";
            } else {
                const buyDate = minPrice.timestamp.toLocaleDateString();
                const sellDate = maxPrice.timestamp.toLocaleDateString();

                const deltaStr = Math.round(delta)
                    .toLocaleString();

                result = `Buy on ${buyDate} and sell on ${sellDate}
                <span class="no-break">(change: ${deltaStr} ${data.metadata.currency})</span>`;
            }

            return `
                <p>${result}</p>
            `;
        },
    );

    /*
        Setup form
     */
    const startDateInput = document.getElementById("start-date");
    const endDateInput = document.getElementById("end-date");

    // assign default values if empty (startDate = today - 6 days, endDate = today)
    if (!startDateInput.value && !endDateInput.value) {
        const now = new Date();

        startDateInput.valueAsDate = new Date(now.getTime() - DAY_MILLIS * 6);
        endDateInput.valueAsDate = now;
    }

    const searchButton = document.getElementById("search-button");

    searchButton.onclick = async (e) => {
        e.preventDefault();

        if (searchButton.getAttribute("aria-busy") === "true") {
            return;
        }

        // unix millis -> unix seconds
        const startDateSeconds = startDateInput.valueAsDate.getTime() / 1000;
        // add one hour to include the end date
        const endDateSeconds = (endDateInput.valueAsDate.getTime() + HOUR_MILLIS) / 1000;

        if (startDateSeconds > endDateSeconds) {
            alert("Error: Start date can't be after the end date");

            return;
        }

        searchButton.setAttribute("aria-busy", "true");
        searchButton.innerText = "Running";

        setTimeout(async () => {
            const response = await analyzer.run("bitcoin", "eur", startDateSeconds, endDateSeconds);
            if (response.error) {
                alert(`Error: ${response.error}`);
            }

            searchButton.setAttribute("aria-busy", "false");
            searchButton.innerText = "Run";
        }, 500);
    };
});
