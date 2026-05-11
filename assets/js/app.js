        function busApp() {
            return {
                selectedUser: null,
                newStopCode: '',
                stopSearchQuery: '',
                routeSearchQuery: '',
                selectedSearchStops: [],
                selectedRoute: null,
                selectedRouteStops: [],
                showManual: false,
                searchMode: 'route',
                allStopsList: [],
                allRoutesList: [],
                routeStops: {},
                expandedRouteKey: null,
                urlRouteFilter: [],
                etaData: {},
                stopNames: {},
                lastUpdated: '-',
                countdown: 10,
                timer: null,
                refreshInterval: null,
                dashboardTitle: 'KMB Bus ETA',
                dashboardTitleInput: '',
                theme: localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),

                async init() {
                    document.documentElement.setAttribute('data-theme', this.theme);
                    const urlParams = new URLSearchParams(window.location.search);
                    
                    const urlTitle = urlParams.get('title');
                    if (urlTitle) {
                        this.dashboardTitle = urlTitle;
                        this.dashboardTitleInput = urlTitle;
                        document.title = urlTitle + ' - KMB Bus ETA';
                    }

                    try {
                        // 1. Fetch all stops to build code -> id mapping
                        const stopsResp = await fetch('https://data.etabus.gov.hk/v1/transport/kmb/stop/');
                        const stopsJson = await stopsResp.json();
                        this.allStopsList = stopsJson.data;
                        this.stopIdMap = {}; // code -> id
                        this.stopDataMap = {}; // id -> full data
                        
                        this.allStopsList.forEach(s => {
                            this.stopDataMap[s.stop] = s;
                            // Extract code from name_en or name_tc, e.g. "NAME (CODE)" or "NAME（CODE）"
                            const match = (s.name_en || s.name_tc).match(/[\(（](.*?)[\)）]\s*$/);
                            if (match) {
                                const code = match[1].trim();
                                this.stopIdMap[code] = s.stop;
                            }
                        });

                        // 2. Fetch all routes for quick bound lookup later
                        const routesResp = await fetch('https://data.etabus.gov.hk/v1/transport/kmb/route/');
                        const routesJson = await routesResp.json();
                        this.allRoutesList = routesJson.data;

                        // Parse multiple 'stops=' parameters
                        // e.g. ?stops=KT193:290A+290X&stops=KT108:290A
                        const urlStops = [];
                        const stopsParams = urlParams.getAll('stops');
                        
                        stopsParams.forEach(stopParam => {
                            const parts = stopParam.split(':');
                            const code = parts[0].trim().toUpperCase();
                            const routesStr = parts[1] || '';
                            const routes = routesStr ? routesStr.split(' ').map(r => r.trim().toUpperCase()) : [];
                            if (code) {
                                urlStops.push({ code, routes });
                            }
                        });

                        if (urlStops.length > 0) {
                            this.selectedUser = {
                                stops: urlStops
                            };
                            this.refreshAll();
                            this.startTimers();
                        }
                    } catch (e) {
                        console.error('Failed to load data', e);
                    }
                },

                toggleTheme() {
                    this.theme = this.theme === 'light' ? 'dark' : 'light';
                    localStorage.setItem('theme', this.theme);
                    document.documentElement.setAttribute('data-theme', this.theme);
                },

                getStopId(stop) {
                    if (stop.id) return stop.id;
                    if (stop.code) return this.stopIdMap[stop.code];
                    return null;
                },

                getStopCode(s) {
                    const match = (s.name_en || s.name_tc).match(/[\(（](.*?)[\)）]\s*$/);
                    return match ? match[1].trim() : null;
                },

                getFilteredStops() {
                    const query = this.stopSearchQuery.trim().toLowerCase();
                    if (!query || query.length < 2) return [];
                    
                    return this.allStopsList.filter(s => {
                        const code = (this.getStopCode(s) || '').toLowerCase();
                        return (s.name_tc && s.name_tc.toLowerCase().includes(query)) ||
                               (s.name_en && s.name_en.toLowerCase().includes(query)) ||
                               (s.name_sc && s.name_sc.toLowerCase().includes(query)) ||
                               code.includes(query);
                    }).slice(0, 10); // Limit to top 10 results for performance
                },

                getFilteredRoutes() {
                    const query = this.routeSearchQuery.trim().toLowerCase();
                    if (!query || query.length < 1) return [];

                    const seen = new Set();
                    return this.allRoutesList.filter(r => {
                        const key = `${r.route}_${r.bound}_${r.service_type}`;
                        if (seen.has(key)) return false;
                        if (r.route.toLowerCase().includes(query)) {
                            seen.add(key);
                            return true;
                        }
                        return false;
                    }).slice(0, 15);
                },

                async selectRoute(route) {
                    this.selectedRoute = route;
                    this.selectedRouteStops = [];
                    const direction = route.bound === 'O' ? 'outbound' : 'inbound';
                    try {
                        const resp = await fetch(`https://data.etabus.gov.hk/v1/transport/kmb/route-stop/${route.route}/${direction}/${route.service_type}`);
                        const json = await resp.json();
                        this.selectedRouteStops = json.data.map(s => {
                            const fullStopData = this.stopDataMap[s.stop];
                            return {
                                ...s,
                                name_tc: fullStopData ? fullStopData.name_tc : 'Unknown',
                                code: this.getStopCode(fullStopData || {})
                            };
                        });
                    } catch (e) {
                        console.error('Failed to fetch route stops', e);
                    }
                },

                toggleRouteStopSelection(stop) {
                    const stopCode = stop.code;
                    if (!stopCode) return;
                    const route = this.selectedRoute.route;

                    const existing = this.selectedSearchStops.find(s => s.code === stopCode && s.route === route);
                    
                    if (existing) {
                        this.selectedSearchStops = this.selectedSearchStops.filter(s => s !== existing);
                    } else {
                        this.selectedSearchStops.push({
                            code: stopCode,
                            fullName: stop.name_tc,
                            route: route
                        });
                    }
                },

                isRouteStopSelected(stop) {
                    if (!this.selectedRoute) return false;
                    return this.selectedSearchStops.some(s => s.code === stop.code && s.route === this.selectedRoute.route);
                },

                getAvailableRoutesForStop(stop) {
                    const routes = new Set();
                    const stopId = this.getStopId(stop);
                    if (!stopId) return [];
                    const data = this.etaData[stopId] || [];
                    data.forEach(item => {
                        routes.add(item.route);
                    });
                    return Array.from(routes).sort((a, b) => a.localeCompare(b, undefined, {numeric: true, sensitivity: 'base'}));
                },

                isRouteActiveForStop(route, stop) {
                    if (!stop.routes || stop.routes.length === 0) return true;
                    return stop.routes.includes(route.toUpperCase());
                },

                toggleRouteFilterForStop(route, stop) {
                    const r = route.toUpperCase();
                    if (!stop.routes) stop.routes = [];
                    if (stop.routes.includes(r)) {
                        stop.routes = stop.routes.filter(item => item !== r);
                    } else {
                        stop.routes.push(r);
                    }
                    this.updateUrl();
                },

                getAvailableRoutesForGroup(stopGroup) {
                    // Deprecated: Template now uses per-stop filtering
                    return [];
                },

                isRouteActive(route, stopGroup) {
                    // Deprecated: Template now uses per-stop filtering
                    return true;
                },

                toggleRouteFilter(route, stopGroup) {
                    // Deprecated: Template now uses per-stop filtering
                },

                updateUrl() {
                    if (!this.selectedUser) return;
                    const url = new URL(window.location.origin + window.location.pathname);
                    
                    // Clear old indexed params (just in case they exist)
                    for (let key of Array.from(url.searchParams.keys())) {
                        if (key.startsWith('bus_stop[') || key.startsWith('routes[')) {
                            url.searchParams.delete(key);
                        }
                    }
                    url.searchParams.delete('bus_stops');
                    url.searchParams.delete('routes');
                    url.searchParams.delete('stops'); // Clear existing 'stops' to rebuild
                    url.searchParams.delete('user'); // Clean up old user params
                    url.searchParams.delete('title');

                    if (this.dashboardTitle !== 'KMB Bus ETA') {
                        url.searchParams.set('title', this.dashboardTitle);
                    }

                    // Set new multiple 'stops' params
                    this.selectedUser.stops.forEach((stop) => {
                        let stopParam = stop.code || stop.id;
                        if (stop.routes && stop.routes.length > 0) {
                            stopParam += ':' + stop.routes.join('+');
                        }
                        url.searchParams.append('stops', stopParam);
                    });
                    
                    // Manually decode the URL to keep it readable for the user (decode %3A to : and %2B to +)
                    let finalUrlStr = url.toString().replace(/%3A/g, ':').replace(/%2B/g, '+');
                    window.history.pushState(null, '', finalUrlStr);
                },

                scrollToStop(code) {
                    this.$nextTick(() => {
                        const stopId = this.stopIdMap[code.toUpperCase()];
                        if (!stopId) return;
                        
                        const cards = document.querySelectorAll('.card');
                        for (const card of cards) {
                            if (card.id.split('-').includes(stopId)) {
                                card.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                card.classList.add('is-focused');
                                setTimeout(() => card.classList.remove('is-focused'), 2000);
                                break;
                            }
                        }
                    });
                },

                addStop(code) {
                    if (!code) return;
                    const stopCode = code.trim().toUpperCase();
                    if (!this.stopIdMap[stopCode]) {
                        alert('Invalid stop code: ' + stopCode);
                        return;
                    }
                    if (!this.selectedUser) {
                        this.selectedUser = { stops: [] };
                    }
                    
                    // Prevent duplicate stops
                    if (this.selectedUser.stops.some(s => (s.code || s.id) === stopCode)) {
                        this.newStopCode = '';
                        return;
                    }

                    this.selectedUser.stops.push({ code: stopCode, routes: [] });
                    this.newStopCode = '';
                    this.updateUrl();
                    this.refreshAll();
                    this.startTimers();
                },

                openManual() {
                    if (this.selectedUser && this.selectedUser.stops) {
                        const newSelection = [];
                        this.selectedUser.stops.forEach(s => {
                            const stopId = this.getStopId(s);
                            const fullName = this.stopNames[stopId] || s.code || s.id;
                            const code = s.code || s.id;
                            
                            if (s.routes && s.routes.length > 0) {
                                s.routes.forEach(r => {
                                    newSelection.push({ code, fullName, route: r });
                                });
                            } else {
                                newSelection.push({ code, fullName, route: null });
                            }
                        });
                        this.selectedSearchStops = newSelection;
                    } else {
                        this.selectedSearchStops = [];
                    }
                    this.showManual = true;
                    this.selectedRoute = null;
                    this.selectedRouteStops = [];
                    this.routeSearchQuery = '';
                    this.stopSearchQuery = '';
                    this.dashboardTitleInput = this.dashboardTitle === 'KMB Bus ETA' ? '' : this.dashboardTitle;
                },

                createLinkFromSelection() {
                    const groupedStops = {};
                    
                    this.selectedSearchStops.forEach(item => {
                        const code = item.code;
                        const route = item.route;
                        
                        if (!groupedStops[code]) {
                            groupedStops[code] = { code: code, routes: [] };
                        }
                        if (route) {
                            groupedStops[code].routes.push(route);
                        }
                    });
                    
                    const newStops = Object.values(groupedStops).map(s => ({
                        code: s.code,
                        routes: Array.from(new Set(s.routes))
                    }));
                    
                    if (newStops.length > 0) {
                        this.selectedUser = { stops: newStops };
                        this.showManual = false;
                        window.scrollTo({top: 0, behavior: 'smooth'});
                    } else {
                        this.selectedUser = null;
                    }
                    
                    this.dashboardTitle = this.dashboardTitleInput.trim() || 'KMB Bus ETA';
                    document.title = this.dashboardTitle === 'KMB Bus ETA' ? 'KMB Bus ETA Dashboard' : this.dashboardTitle + ' - KMB Bus ETA';

                    this.selectedSearchStops = [];
                    this.stopSearchQuery = '';
                    this.routeSearchQuery = '';
                    this.selectedRoute = null;
                    this.updateUrl();
                    this.refreshAll();
                    this.startTimers();
                },

                moveGroupToTop(stopGroup) {
                    if (!this.selectedUser || !this.selectedUser.stops) return;
                    
                    // Identify the stops in this group
                    const stopsInGroup = stopGroup.stops;
                    
                    // Reorder: Move these stops to the front of the array
                    const otherStops = this.selectedUser.stops.filter(s => !stopsInGroup.includes(s));
                    this.selectedUser.stops = [...stopsInGroup, ...otherStops];
                    
                    // Update the URL to persist the new order
                    this.updateUrl();
                    
                    // Scroll so the header of this card is at the very top of the viewport
                    this.$nextTick(() => {
                        const cardId = stopGroup.originalIds.join('-');
                        const element = document.getElementById(cardId);
                        if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    });
                },

                startTimers() {
                    this.stopTimers();
                    
                    // Countdown timer
                    this.timer = setInterval(() => {
                        if (this.countdown > 1) {
                            this.countdown--;
                        } else {
                            this.countdown = 10;
                        }
                    }, 1000);

                    // Refresh interval
                    this.refreshInterval = setInterval(() => {
                        this.refreshAll();
                    }, 10000);
                },

                stopTimers() {
                    if (this.timer) clearInterval(this.timer);
                    if (this.refreshInterval) clearInterval(this.refreshInterval);
                },

                async refreshAll() {
                    if (!this.selectedUser) return;
                    
                    for (const stop of this.selectedUser.stops) {
                        const stopId = this.getStopId(stop);
                        if (stopId) {
                            this.fetchETA(stopId);
                            this.fetchStopName(stopId);
                        }
                    }
                    this.lastUpdated = new Date().toLocaleTimeString();
                },

                async fetchETA(stopId) {
                    try {
                        const resp = await fetch(`https://data.etabus.gov.hk/v1/transport/kmb/stop-eta/${stopId}`);
                        const json = await resp.json();
                        this.etaData[stopId] = json.data;
                    } catch (e) {
                        console.error(`Error fetching ETA for ${stopId}`, e);
                    }
                },

                async toggleRouteStops(group, currentStopId) {
                    const key = `${group.route}_${group.dest_tc}_${group.service_type}_${currentStopId}`;
                    if (this.expandedRouteKey === key) {
                        this.expandedRouteKey = null;
                        return;
                    }
                    
                    this.expandedRouteKey = key;
                    
                    if (!this.routeStops[key]) {
                        await this.fetchRouteStops(group, currentStopId, key);
                    }
                },

                async fetchRouteStops(group, currentStopId, key) {
                    try {
                        // 1. Find the correct bound (O/I) from the cached routes list
                        if (!this.allRoutesList || this.allRoutesList.length === 0) {
                            // Fallback if not yet loaded
                            const routeResp = await fetch(`https://data.etabus.gov.hk/v1/transport/kmb/route/`);
                            const routeJson = await routeResp.json();
                            this.allRoutesList = routeJson.data;
                        }

                        const boundInfo = this.allRoutesList.find(r => 
                            r.route === group.route &&
                            r.dest_tc === group.dest_tc && 
                            parseInt(r.service_type) === group.service_type
                        );
                        
                        if (!boundInfo) {
                            console.warn("Could not find bound info for", group);
                            return;
                        }
                        
                        const direction = boundInfo.bound === 'O' ? 'outbound' : 'inbound';

                        // 2. Fetch stops for this route variation
                        const stopsResp = await fetch(`https://data.etabus.gov.hk/v1/transport/kmb/route-stop/${group.route}/${direction}/${group.service_type}`);
                        const stopsJson = await stopsResp.json();
                        
                        // 3. Find current stop sequence and filter remaining
                        const stopList = stopsJson.data;
                        const currentIndex = stopList.findIndex(s => s.stop === currentStopId);
                        
                        if (currentIndex !== -1) {
                            this.routeStops[key] = stopList.slice(currentIndex).map(s => {
                                // this.stopDataMap was populated in init() using the full /stop API
                                const fullStopData = this.stopDataMap[s.stop];
                                let name = fullStopData ? fullStopData.name_tc : 'Unknown Stop';
                                // Extract the stop code from name (e.g. "NAME (CODE)")
                                const codeMatch = name.match(/[\(（](.*?)[\)）]\s*$/);
                                const code = codeMatch ? codeMatch[1] : '';
                                // Strip the stop code in parentheses
                                name = name.replace(/[\(（].*?[\)）]\s*$/, '').trim();
                                return {
                                    stop: s.stop,
                                    name: name,
                                    code: code,
                                    showCode: false
                                };
                            });
                        } else {
                            this.routeStops[key] = []; // Current stop not found on this route
                        }
                    } catch (e) {
                        console.error('Failed to fetch route stops', e);
                    }
                },

                async fetchStopName(stopId) {
                    if (this.stopNames[stopId]) return; // Already fetched
                    
                    // First check if we already have it in stopDataMap
                    if (this.stopDataMap[stopId]) {
                        this.stopNames[stopId] = this.stopDataMap[stopId].name_tc;
                        return;
                    }

                    try {
                        const resp = await fetch(`https://data.etabus.gov.hk/v1/transport/kmb/stop/${stopId}`);
                        const json = await resp.json();
                        if (json.data) {
                            this.stopNames[stopId] = json.data.name_tc;
                        }
                    } catch (e) {
                        console.error(`Error fetching stop name for ${stopId}`, e);
                    }
                },

                getGroupedStops() {
                    if (!this.selectedUser) return [];
                    const groups = {};
                    for (const stop of this.selectedUser.stops) {
                        const stopId = this.getStopId(stop);
                        if (!stopId) continue;

                        const rawName = this.stopNames[stopId];
                        let baseName = 'Loading...';
                        let code = '';
                        
                        if (rawName) {
                            const match = rawName.match(/[\(（](.*?)[\)）]/);
                            if (match) {
                                code = match[1].trim();
                            }
                            // Remove any bracketed text to get the base name
                            baseName = rawName.replace(/\s*[\(（].*?[\)）]\s*/g, '').trim();
                        }
                        
                        if (!groups[baseName]) {
                            groups[baseName] = {
                                baseName: baseName,
                                codes: new Set(),
                                originalIds: [],
                                stops: []
                            };
                        }
                        if (code) {
                            groups[baseName].codes.add(code);
                        }
                        groups[baseName].originalIds.push(stopId);
                        groups[baseName].stops.push(stop);
                    }
                    
                    const result = Object.values(groups);
                    result.forEach(group => {
                        if (group.codes.size > 0) {
                            const codesArray = Array.from(group.codes);
                            group.name = `${group.baseName} (${codesArray.join(', ')})`;
                        } else {
                            group.name = group.baseName;
                        }
                    });
                    
                    return result;
                },

                getGroupedETAForStops(stops) {
                    let allFiltered = [];
                    
                    for (const stop of stops) {
                        const stopId = this.getStopId(stop);
                        if (!stopId) continue;
                        const data = this.etaData[stopId] || [];
                        
                        // Filter by specific routes if defined, AND ensure 'eta' exists
                        const filtered = data.filter(item => {
                            let isRequestedRoute = stop.routes && stop.routes.length > 0 
                                ? stop.routes.includes(item.route.toUpperCase()) 
                                : true;
                            
                            // Apply URL route filter if it exists
                            if (this.urlRouteFilter.length > 0) {
                                isRequestedRoute = isRequestedRoute && this.urlRouteFilter.includes(item.route.toUpperCase());
                            }

                            const hasEtaTime = item.eta !== null && item.eta !== '';
                            return isRequestedRoute && hasEtaTime;
                        });
                        allFiltered = allFiltered.concat(filtered);
                    }
                    
                    // Deduplicate by Route + Destination + EXACT ETA time across all stops.
                    // If multiple service types have the exact same ETA, keep only the one with the smallest service_type.
                    const uniqueEtasMap = new Map();
                    
                    allFiltered.forEach(eta => {
                        // Key includes exact timestamp to catch same-time arrivals
                        const uniqueKey = `${eta.route}_${eta.dest_tc}_${eta.eta}`;
                        
                        if (!uniqueEtasMap.has(uniqueKey)) {
                            uniqueEtasMap.set(uniqueKey, eta);
                        } else {
                            const existing = uniqueEtasMap.get(uniqueKey);
                            if (eta.service_type < existing.service_type) {
                                uniqueEtasMap.set(uniqueKey, eta);
                            }
                        }
                    });

                    // Now group the unique ETAs by Route + Destination + Service Type for display
                    const grouped = {};
                    Array.from(uniqueEtasMap.values()).forEach(eta => {
                        const key = `${eta.route}_${eta.dest_tc}_${eta.service_type}`;
                        if (!grouped[key]) {
                            grouped[key] = {
                                route: eta.route,
                                dest_tc: eta.dest_tc,
                                dest_en: eta.dest_en,
                                service_type: eta.service_type,
                                etas: []
                            };
                        }
                        grouped[key].etas.push(eta);
                    });

                    const result = Object.values(grouped);
                    
                    result.forEach(group => {
                        // Sort ETAs within the group chronologically
                        group.etas.sort((a, b) => new Date(a.eta) - new Date(b.eta));
                    });

                    // Sort routes by their earliest ETA
                    result.sort((a, b) => {
                        const timeA = a.etas.length > 0 ? new Date(a.etas[0].eta).getTime() : Infinity;
                        const timeB = b.etas.length > 0 ? new Date(b.etas[0].eta).getTime() : Infinity;
                        
                        if (timeA === timeB) {
                            return a.route.localeCompare(b.route, undefined, {numeric: true, sensitivity: 'base'});
                        }
                        return timeA - timeB;
                    });

                    return result;
                },

                formatETA(etaTime) {
                    if (!etaTime) return 'No Data';
                    const diffMs = new Date(etaTime) - new Date();
                    
                    if (diffMs <= 0) {
                        return 'Arrived';
                    }
                    // Show "Arriving" if it's 1 minute or less, or rounds to 1 minute (up to 90s)
                    if (diffMs <= 90000) {
                        return 'Arriving';
                    }
                    const mins = Math.round(diffMs / 60000);
                    return `${mins} ${mins === 1 ? 'min' : 'mins'}`;
                },

                getETATagClass(etaTime) {
                    const status = this.formatETA(etaTime);
                    const lightSuffix = this.theme === 'light' ? ' is-light' : '';
                    
                    if (status === 'Arrived') return 'is-danger' + lightSuffix;
                    if (status === 'Arriving') return 'is-success' + lightSuffix;
                    return this.theme === 'light' ? 'is-light' : 'is-dark';
                }
            }
        }
