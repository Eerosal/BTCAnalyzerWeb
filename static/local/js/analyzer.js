const getMidnight = (date) => {
    const clone = new Date(date.getTime());

    clone.setUTCHours(0, 0, 0, 0);

    return clone;
};

const fetchCoinGeckoMarketChart = async (coin, currency, start, end) => {
    // 7.5s timeout
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => timeoutController.abort(), 7500);

    let rawResponse;
    try {
        rawResponse = await fetch(
            `https://api.coingecko.com/api/v3/coins/${coin}/market_chart/range`
            + `?vs_currency=${currency}&from=${start}&to=${end}`,
            {
                signal: timeoutController.signal,
            },
        );
    } finally {
        clearInterval(timeoutId);
    }

    const response = await rawResponse.json();

    // convert response to better format (arrays -> objects, timestamps -> date objects)
    let valid = true;
    Object.keys(response).forEach((key) => {
        if (!Array.isArray(response[key]) || response[key].length === 0) {
            valid = false;

            return;
        }

        response[key] = response[key].map( // unix millis timestamps -> date objects at 00:00 UTC
            (entry) => (
                {
                    timestamp: getMidnight(new Date(entry[0])),
                    value: entry[1],
                }
            ),
        ).filter( // remove duplicates. Dates are in ascending order => first one is the closest to 00:00
            (entry, index, arr) => {
                if (index === 0) return true;

                const current = entry.timestamp.getTime();
                const previous = arr[index - 1].timestamp.getTime();

                return current !== previous;
            },
        );
    });

    response.metadata = {
        coin: coin.toUpperCase(),
        currency: currency.toUpperCase(),
        start,
        end,
        valid,
    };

    return response;
};

export default class Analyzer {
    #moduleContainer;

    #rowLength;

    #modules = [];

    constructor(moduleContainer, rowLength) {
        this.#moduleContainer = moduleContainer;
        this.#rowLength = rowLength;
    }

    addModule = (title, description, resultCallback) => {
        // append to the last row if it isn't full, otherwise create a new row
        let rowElement;

        const rowCount = this.#moduleContainer.children.length;
        if (rowCount === 0
            || this.#moduleContainer.children[rowCount - 1].children.length >= this.#rowLength) {
            // create new row
            rowElement = document.createElement("div");
            rowElement.classList.add("grid");

            this.#moduleContainer.appendChild(rowElement);
        } else {
            // use existing row
            rowElement = this.#moduleContainer.children[rowCount - 1];
        }

        const moduleElement = document.createElement("div");
        moduleElement.innerHTML = `
            <hgroup>
                <h4>${title}</h4>
                <h5>${description}</h5>
            </hgroup>
        `;

        const resultElement = document.createElement("div");
        moduleElement.appendChild(resultElement);

        rowElement.appendChild(moduleElement);

        this.#modules.push({
            element: resultElement,
            resultCallback,
        });
    };

    #setAllResults = (result) => {
        this.#modules.forEach((module) => {
            module.element.innerHTML = result;
        });
    };

    run = async (coin, currency, from, to) => {
        // show loading animation on all modules
        this.#setAllResults(`
                <p aria-busy="true">Loading...</p>
        `);

        let data;
        try {
            data = await fetchCoinGeckoMarketChart(coin, currency, from, to);
        } catch (e) {
            // clear loading animation
            this.#setAllResults("");

            return {
                error: e,
            };
        }

        if (!data.metadata.valid) {
            this.#setAllResults("");

            return {
                error: "API returned incomplete data",
            };
        }

        this.#modules.forEach((module) => {
            module.element.innerHTML = module.resultCallback(data);
        });

        return {
            success: true,
        };
    };
}
