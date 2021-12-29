const API_URL = "https://37x2topwpe.execute-api.us-east-1.amazonaws.com/default/btc-analyzer-java/";
const API_KEY = "06hXaHNdZs6ZZqaVsFdmt2xFGH0E983J9itZlyeC";

const ROW_LENGTH = 3;

const HOUR_MILLIS = 60 * 60 * 1000;
const DAY_MILLIS = HOUR_MILLIS * 24;

const invokeLambda = async (method, input = {}) => {
    const rawResponse = await fetch(`${API_URL}${method}`, {
        headers: {
            Accept: "application/json",
            "x-api-key": API_KEY,
        },
        method: "POST",
        mode: "cors",
        body: JSON.stringify(input),
    });

    return rawResponse.json();
};

const resultElements = [];
const moduleElements = [];

const buildView = (moduleContainer, modules) => {
    resultElements.length = 0; // clear array

    // delete old module elements
    moduleElements.forEach((moduleElement) => moduleElement.remove());
    moduleElements.length = 0; // clear array

    modules.forEach((module) => {
        // append to the last row if it isn't full, otherwise create a new row
        let rowElement;

        const rowCount = moduleContainer.children.length;
        if (rowCount === 0
            || moduleContainer.children[rowCount - 1].children.length >= ROW_LENGTH) {
            // create new row
            rowElement = document.createElement("div");
            rowElement.classList.add("grid");

            moduleContainer.appendChild(rowElement);
        } else {
            // use existing row
            rowElement = moduleContainer.children[rowCount - 1];
        }

        const moduleElement = document.createElement("div");
        moduleElement.innerHTML = `
                <hgroup>
                    <h4>${module.title}</h4>
                    <h5>${module.description}</h5>
                </hgroup>
            `;

        moduleElements.push(moduleElement);

        const resultElement = document.createElement("div");
        moduleElement.appendChild(resultElement);

        rowElement.appendChild(moduleElement);
        resultElements.push(resultElement);
    });
};

let moduleHash = null;
window.addEventListener("load", async () => {
    const moduleContainer = document.getElementById("module-container");
    const statusText = document.getElementById("status-text");

    let modulesResponse;
    try {
        modulesResponse = await invokeLambda("GetModules");
    } catch (e) {
        alert("Error: Server connection failed. Please try reloading the page.");

        return;
    }

    moduleHash = modulesResponse.hash;

    buildView(moduleContainer, modulesResponse.results.map(
        (resultEntry) => resultEntry.module,
    ));

    moduleContainer.style.display = "block";
    statusText.style.display = "none";

    /*
        Setup form
    */
    const startDateInput = document.getElementById("start-date");
    const endDateInput = document.getElementById("end-date");

    // assign default values if missing (startDate = today - 6 days, endDate = today)
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

        resultElements.forEach((resultElement) => {
            resultElement.innerHTML = `
                <p aria-busy="true">Loading...</p>
            `;
        });

        setTimeout(async () => {
            const response = await invokeLambda("RunAnalysis", {
                coin: "bitcoin",
                currency: "eur",
                from: startDateSeconds,
                to: endDateSeconds,
            });

            if (response.error || !response.results) {
                if (response.error) {
                    alert(`Error: ${response.error}`);
                } else {
                    alert("Error: api error");
                }

                resultElements.forEach((resultElement) => {
                    resultElement.innerHTML = "";
                });
            } else {
                // rebuild view if response modules have changed
                if (response.hash !== moduleHash) {
                    moduleHash = response.hash;

                    buildView(moduleContainer, response.results.map(
                        (resultEntry) => resultEntry.module,
                    ));
                }

                response.results.forEach((resultEntry, index) => {
                    resultElements[index].innerHTML = resultEntry.htmlResult;
                });
            }

            searchButton.setAttribute("aria-busy", "false");
            searchButton.innerText = "Run";
        }, 500);
    };
});
