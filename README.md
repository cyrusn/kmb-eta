# KMB ETA Dashboard

A simple, lightweight, and customizable dashboard to view Estimated Time of Arrival (ETA) for Kowloon Motor Bus (KMB) routes in Hong Kong. 

## Features

* **Live ETA Updates:** Automatically fetches and refreshes ETA data.
* **Stop Grouping:** Organizes ETAs by bus stop locations for a cleaner view.
* **Route Filtering:** Filter and display only the specific routes you care about for each stop.
* **Subsequent Stops:** Click on a route's tag to view the remaining stops on its journey (click on the stop name to toggle its bus stop code).
* **URL-based Configuration:** Save and share your specific stops and filters easily by bookmarking the URL.
* **Dark/Light Theme:** Automatically adapts to your system preferences.

## Usage

You can search for stops and configure your dashboard directly through the web interface using the "🔍 Find & Add Bus Stops" section. Alternatively, you can configure your dashboard directly via URL parameters.

### URL Configuration Examples:

* **Add multiple stops:** Use the `stops=` parameter.
  ```text
  ?stops=KT108&stops=KT193
  ```
* **Filter specific routes:** Add `:` after the stop code, followed by routes separated by `+`.
  ```text
  ?stops=KT108:290A+290X
  ```
* **Combine them:** 
  ```text
  ?stops=KT108:290A&stops=KT193:290A+290X
  ```

## Deployment (GitHub Pages)

This project is a static single-page application consisting primarily of an `index.html` file.

**It is deployed directly from the `main` branch using GitHub Pages.** You do not need to maintain or push to a separate `gh-pages` branch.

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
