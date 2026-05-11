# KMB ETA Dashboard

A simple, lightweight, and customizable dashboard to view Estimated Time of Arrival (ETA) for Kowloon Motor Bus (KMB) routes in Hong Kong. 

## Features

* **Multi-Language Support (i18n):** Supports Traditional Chinese, Simplified Chinese, and English. Language preference is persisted in the URL and local storage.
* **Live ETA Updates:** Automatically fetches and refreshes ETA data every 10 seconds.
* **Individual Stop Cards:** Each added bus stop is displayed as its own card with the stop code included in the title for clarity.
* **Route Filtering:** Redesigned collapsible filter with tag chips to display only the specific routes you care about for each stop.
* **Subsequent Stops:** Click on a route tag (e.g., `290A`) to view the remaining stops on its journey. Click on any stop name in the list to reveal its unique bus stop code.
* **URL-based Configuration:** Save and share your dashboard by bookmarking the URL. All settings (stops, routes, title, and language) are encoded in the query parameters.
* **Dark/Light Theme:** Responsive design that adapts to your system preferences or can be toggled manually.

## Usage

You can search for stops and configure your dashboard through the web interface in the "Setup & Help" section (ℹ️ icon). The dashboard provides two search modes:
1. **Search by Route:** Find a specific bus route and select stops along its path.
2. **Search by Stop:** Search for stops directly by name or code.

### URL Configuration Examples

* **Add multiple stops:** Use the `stops=` parameter.
  ```text
  ?stops=KT108&stops=KT193
  ```
* **Filter specific routes:** Add `:` after the stop code, followed by routes separated by `+`.
  ```text
  ?stops=KT108:290A+290X
  ```
* **Set Language:** Use the `lang=` parameter (`tc`, `sc`, or `en`).
  ```text
  ?lang=en&stops=KT108:290A
  ```
* **Custom Title:** Use the `title=` parameter.
  ```text
  ?title=My+Commute&stops=KT108:290A
  ```

## Deployment (GitHub Pages)

This project is a static single-page application. **It is deployed directly from the `main` branch using GitHub Pages.**

To set this up in GitHub:
1. Go to your repository **Settings**.
2. Navigate to **Pages** in the left sidebar.
3. Under "Build and deployment", set the source to **Deploy from a branch**.
4. Select the **`main`** branch and the **`/ (root)`** folder.
5. Save, and your site will be published!

## Tech Stack

* [Alpine.js](https://alpinejs.dev/) - For lightweight reactive UI behavior.
* [Bulma CSS](https://bulma.io/) - For responsive styling.
* [Data.gov.hk KMB API](https://data.etabus.gov.hk/) - For live ETA and route data.
