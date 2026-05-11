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
                lang: localStorage.getItem('lang') || (navigator.language.startsWith('zh') ? 'zh' : 'en'),
                translations: {
                    zh: {
                        dashboardTitle: '九巴到站預報',
                        subtitle: '即時查詢巴士到站時間',
                        setupHelp: '設定與幫助',
                        toggleTheme: '切換深淺模式',
                        toggleLang: 'English',
                        findStops: '🔍 尋找及加入巴士站',
                        searchByRoute: '按路線搜尋',
                        searchByStop: '按車站搜尋',
                        routeQuery: '輸入路線 (如 290A, 98...)',
                        stopQuery: '輸入車站名稱或代碼 (如 創紀之城, KT108...)',
                        routeResults: '路線搜尋結果',
                        stopResults: '車站搜尋結果',
                        stopsFor: '路線車站:',
                        changeRoute: '更改路線',
                        outbound: '往',
                        inbound: '往',
                        noStopsFound: '找不到相符車站',
                        selectedStops: '已選擇加入的車站:',
                        allRoutes: '所有路線',
                        customTitle: '自定義標題 (選填):',
                        customTitleHint: '如：我的通勤、學校...',
                        loadStops: '加載車站並生成連結',
                        howToUse: '📖 使用指南',
                        step1: '加入車站：使用上方搜尋框尋找並加入車站到儀表板。',
                        step2: '過濾路線：點擊路線標籤 (如 290A) 僅顯示該路線。點擊 ... 查看車站所有路線。',
                        step3: '分享與自定義連結：URL 會自動更新，直接加入書籤即可！',
                        back: '返回',
                        refreshIn: '更新倒數:',
                        updated: '更新時間:',
                        arrived: '已到站',
                        arriving: '即將抵達',
                        min: '分鐘',
                        mins: '分鐘',
                        noData: '無資料',
                        route: '路線',
                        destination: '目的地',
                        upcomingBuses: '即將抵達巴士',
                        code: '代碼',
                        filter: '過濾:',
                        loadingStops: '正在加載車站...',
                        endOfRoute: '路線終點',
                        subsequentStops: '往後車站:',
                        noUpcoming: '所選路線暫無即將抵達的巴士',
                        invalidCode: '無效的車站代碼:'
                    },
                    en: {
                        dashboardTitle: 'KMB Bus ETA',
                        subtitle: 'Real-time arrival information for your routes',
                        setupHelp: 'Setup & Help',
                        toggleTheme: 'Toggle Light/Dark Mode',
                        toggleLang: '中文',
                        findStops: '🔍 Find & Add Bus Stops',
                        searchByRoute: 'Search by Route',
                        searchByStop: 'Search by Stop',
                        routeQuery: 'e.g. 290A, 98...',
                        stopQuery: 'e.g. Millennium City, KT108...',
                        routeResults: 'Route Results',
                        stopResults: 'Stop Results',
                        stopsFor: 'Stops for',
                        changeRoute: 'Change Route',
                        outbound: 'To',
                        inbound: 'To',
                        noStopsFound: 'No stops found matching your search.',
                        selectedStops: 'Selected Stops to Add:',
                        allRoutes: 'All Routes',
                        customTitle: 'Custom Dashboard Title (Optional):',
                        customTitleHint: 'e.g. My Commute, School...',
                        loadStops: 'Load Stops & Create Link',
                        howToUse: '📖 How to Use',
                        step1: 'Add Stops: Use the search box above to find and add stops to your dashboard.',
                        step2: 'Filter Routes: Click the route tags (e.g. 290A) to show only those buses. Click ... to see all routes at a stop.',
                        step3: 'Share & Custom Links: The URL updates automatically, so you can just bookmark it!',
                        back: 'Back',
                        refreshIn: 'Refresh in:',
                        updated: 'Updated:',
                        arrived: 'Arrived',
                        arriving: 'Arriving',
                        min: 'min',
                        mins: 'mins',
                        noData: 'No Data',
                        route: 'Route',
                        destination: 'Destination',
                        upcomingBuses: 'Upcoming Buses',
                        code: 'Code',
                        filter: 'Filter:',
                        loadingStops: 'Loading stops...',
                        endOfRoute: 'End of route',
                        subsequentStops: 'Subsequent Stops:',
                        noUpcoming: 'No upcoming buses for selected routes.',
                        invalidCode: 'Invalid stop code:'
                    }
                },

                t(key) {
                    return this.translations[this.lang][key] || key;
                },

                toggleLang() {
                    this.lang = this.lang === 'zh' ? 'en' : 'zh';
                    localStorage.setItem('lang', this.lang);
                    this.updateTitleAndLabels();
                },

                updateTitleAndLabels() {
                    if (this.dashboardTitle === 'KMB Bus ETA' || this.dashboardTitle === '九巴到站預報') {
                        this.dashboardTitle = this.t('dashboardTitle');
                    }
                    document.title = (this.dashboardTitle === this.t('dashboardTitle') ? this.t('dashboardTitle') : this.dashboardTitle) + ' - ' + this.t('dashboardTitle');
                },

                async init() {
                    document.documentElement.setAttribute('data-theme', this.theme);
                    this.updateTitleAndLabels();
                    const urlParams = new URLSearchParams(window.location.search);
                    
                    const urlTitle = urlParams.get('title');
                    if (urlTitle) {
                        this.dashboardTitle = urlTitle;
                        this.dashboardTitleInput = urlTitle;
                        document.title = urlTitle + ' - ' + this.t('dashboardTitle');
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

                    if (this.dashboardTitle !== this.t('dashboardTitle')) {
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
                        alert(this.t('invalidCode') + ' ' + stopCode);
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
                    this.dashboardTitleInput = this.dashboardTitle === this.t('dashboardTitle') ? '' : this.dashboardTitle;
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
                    
                    this.dashboardTitle = this.dashboardTitleInput.trim() || this.t('dashboardTitle');
                    document.title = (this.dashboardTitle === this.t('dashboardTitle') ? this.t('dashboardTitle') : this.dashboardTitle) + ' - ' + this.t('dashboardTitle');

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
                                let name = fullStopData ? (this.lang === 'zh' ? fullStopData.name_tc : fullStopData.name_en) : 'Unknown Stop';
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
                                dest_tc: this.lang === 'zh' ? eta.dest_tc : eta.dest_en,
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
                    if (!etaTime) return this.t('noData');
                    const diffMs = new Date(etaTime) - new Date();
                    
                    if (diffMs <= 0) {
                        return this.t('arrived');
                    }
                    // Show "Arriving" if it's 1 minute or less, or rounds to 1 minute (up to 90s)
                    if (diffMs <= 90000) {
                        return this.t('arriving');
                    }
                    const mins = Math.round(diffMs / 60000);
                    return `${mins} ${mins === 1 ? this.t('min') : this.t('mins')}`;
                },

                getETATagClass(etaTime) {
                    const status = this.formatETA(etaTime);
                    const lightSuffix = this.theme === 'light' ? ' is-light' : '';
                    
                    if (status === this.t('arrived')) return 'is-danger' + lightSuffix;
                    if (status === this.t('arriving')) return 'is-success' + lightSuffix;
                    return this.theme === 'light' ? 'is-light' : 'is-dark';
                }
            }
        }