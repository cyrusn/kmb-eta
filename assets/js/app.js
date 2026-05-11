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
                lang: 'tc', // Default
                translations: {
                    tc: {
                        dashboardTitle: '九巴到站預報',
                        subtitle: '即時查詢巴士到站時間',
                        setupHelp: '設定與幫助',
                        toggleTheme: '切換深淺模式',
                        language: '語言 / Language',
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
                        instr_route_title: '如何按路線加入？',
                        instr_route_step1: '在上方輸入巴士路線編號（如 290A）。',
                        instr_route_step2: '從結果中選擇正確的方向及服務類型。',
                        instr_route_step3: '在下方的車站列表中勾選您感興趣的車站。',
                        instr_stop_title: '如何按車站加入？',
                        instr_stop_step1: '在上方輸入車站名稱或代碼（如 創紀之城 或 KT108）。',
                        instr_stop_step2: '從搜尋結果中勾選您感興趣的車站。',
                        instr_stop_step3: '勾選後，車站會自動加入到下方的預覽列表中。',
                        instr_lang_title: '語言設定',
                        instr_lang_step1: '您可以隨時切換繁體中文、簡體中文或英文。',
                        instr_lang_step2: '語言偏好會儲存在瀏覽器中，並會反映在 URL 連結中。',
                        instr_lang_step3: '分享連結給他人時，他們也會看到您選擇的語言。',
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
                        filter: '路線過濾',
                        loadingStops: '正在加載車站...',
                        endOfRoute: '路線終點',
                        subsequentStops: '往後車站:',
                        noUpcoming: '所選路線暫無即將抵達的巴士',
                        invalidCode: '無效的車站代碼:',
                        showAll: '顯示全部',
                        hideAll: '取消全部'
                    },
                    sc: {
                        dashboardTitle: '九巴到站预报',
                        subtitle: '即时查询巴士到站时间',
                        setupHelp: '设置与帮助',
                        toggleTheme: '切换深浅模式',
                        language: '语言 / Language',
                        findStops: '🔍 寻找及加入巴士站',
                        searchByRoute: '按路线搜寻',
                        searchByStop: '按车站搜寻',
                        routeQuery: '输入路线 (如 290A, 98...)',
                        stopQuery: '输入车站名称或代码 (如 创纪之城, KT108...)',
                        routeResults: '路线搜寻结果',
                        stopResults: '车站搜寻结果',
                        stopsFor: '路线车站:',
                        changeRoute: '更改路线',
                        outbound: '往',
                        inbound: '往',
                        noStopsFound: '找不到相符车站',
                        selectedStops: '已选择加入的车站:',
                        allRoutes: '所有路线',
                        customTitle: '自定义标题 (选填):',
                        customTitleHint: '如：我的通勤、学校...',
                        loadStops: '加载车站并生成链接',
                        howToUse: '📖 使用指南',
                        instr_route_title: '如何按路线加入？',
                        instr_route_step1: '在上方输入巴士路线编号（如 290A）。',
                        instr_route_step2: '从结果中选择正确的方向及服务类型。',
                        instr_route_step3: '在下方的车站列表中勾选您感兴趣的车站。',
                        instr_stop_title: '如何按车站加入？',
                        instr_stop_step1: '在上方输入车站名称或代码（如 创纪之城 或 KT108）。',
                        instr_stop_step2: '从搜寻结果中勾选您感兴趣的车站。',
                        instr_stop_step3: '勾选后，车站会自动加入到下方的预览列表中。',
                        instr_lang_title: '语言设置',
                        instr_lang_step1: '您可以随时切换繁体中文、简体中文或英文。',
                        instr_lang_step2: '语言偏好会储存在浏览器中，并会反映在 URL 链接中。',
                        instr_lang_step3: '分享链接给他人时，他们也会看到您选择的语言。',
                        step3: '分享与自定义链接：URL 会自动更新，直接加入书签即可！',
                        back: '返回',
                        refreshIn: '更新倒数:',
                        updated: '更新时间:',
                        arrived: '已到站',
                        arriving: '即将抵达',
                        min: '分钟',
                        mins: '分钟',
                        noData: '无资料',
                        route: '路线',
                        destination: '目的地',
                        upcomingBuses: '即将抵达巴士',
                        code: '代码',
                        filter: '路线过滤',
                        loadingStops: '正在加载车站...',
                        endOfRoute: '路线终点',
                        subsequentStops: '往后车站:',
                        noUpcoming: '所选路线暂无即将抵达的巴士',
                        invalidCode: '无效的车站代码:',
                        showAll: '显示全部',
                        hideAll: '取消全部'
                    },
                    en: {
                        dashboardTitle: 'KMB Bus ETA',
                        subtitle: 'Real-time arrival information for your routes',
                        setupHelp: 'Setup & Help',
                        toggleTheme: 'Toggle Light/Dark Mode',
                        language: 'Language / 語言',
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
                        instr_route_title: 'How to add by Route?',
                        instr_route_step1: 'Enter the bus route number (e.g., 290A) above.',
                        instr_route_step2: 'Select the correct direction and service type from the results.',
                        instr_route_step3: 'Check the stops you are interested in from the list below.',
                        instr_stop_title: 'How to add by Stop?',
                        instr_stop_step1: 'Enter the stop name or code (e.g., Millennium City or KT108) above.',
                        instr_stop_step2: 'Check the stops you want from the search results.',
                        instr_stop_step3: 'Stops will be automatically added to the preview list below.',
                        instr_lang_title: 'Language Settings',
                        instr_lang_step1: 'You can switch between Traditional Chinese, Simplified Chinese, or English.',
                        instr_lang_step2: 'Language preference is stored in your browser and reflected in the URL.',
                        instr_lang_step3: 'When sharing the link, others will see the language you selected.',
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
                        filter: 'Route Filter',
                        loadingStops: 'Loading stops...',
                        endOfRoute: 'End of route',
                        subsequentStops: 'Subsequent Stops:',
                        noUpcoming: 'No upcoming buses for selected routes.',
                        invalidCode: 'Invalid stop code:',
                        showAll: 'Show All',
                        hideAll: 'Clear All'
                    }
                },

                t(key) {
                    return this.translations[this.lang][key] || key;
                },

                setLang(l) {
                    this.lang = l;
                    localStorage.setItem('lang', this.lang);
                    this.updateTitleAndLabels();
                    this.updateUrl();
                },

                updateTitleAndLabels() {
                    if (this.dashboardTitle === 'KMB Bus ETA' || this.dashboardTitle === '九巴到站預報' || this.dashboardTitle === '九巴到站预报') {
                        this.dashboardTitle = this.t('dashboardTitle');
                    }
                    document.title = (this.dashboardTitle === this.t('dashboardTitle') ? this.t('dashboardTitle') : this.dashboardTitle) + ' - ' + this.t('dashboardTitle');
                },

                async init() {
                    document.documentElement.setAttribute('data-theme', this.theme);
                    
                    const urlParams = new URLSearchParams(window.location.search);
                    
                    // Priority: URL > LocalStorage > Browser > Default
                    const urlLang = urlParams.get('lang');
                    if (['tc', 'sc', 'en'].includes(urlLang)) {
                        this.lang = urlLang;
                    } else {
                        const storedLang = localStorage.getItem('lang');
                        if (['tc', 'sc', 'en'].includes(storedLang)) {
                            this.lang = storedLang;
                        } else {
                            const browserLang = navigator.language.toLowerCase();
                            if (browserLang.startsWith('zh-cn') || browserLang.startsWith('zh-sg')) this.lang = 'sc';
                            else if (browserLang.startsWith('zh')) this.lang = 'tc';
                            else this.lang = 'en';
                        }
                    }
                    localStorage.setItem('lang', this.lang);
                    
                    this.updateTitleAndLabels();
                    
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
                    }).slice(0, 10);
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

                updateUrl() {
                    if (!this.selectedUser) return;
                    const url = new URL(window.location.origin + window.location.pathname);
                    
                    url.searchParams.delete('stops');
                    url.searchParams.delete('title');
                    url.searchParams.set('lang', this.lang);

                    if (this.dashboardTitle !== this.t('dashboardTitle')) {
                        url.searchParams.set('title', this.dashboardTitle);
                    }

                    this.selectedUser.stops.forEach((stop) => {
                        let stopParam = stop.code || stop.id;
                        if (stop.routes && stop.routes.length > 0) {
                            stopParam += ':' + stop.routes.join('+');
                        }
                        url.searchParams.append('stops', stopParam);
                    });
                    
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
                            let fullName = s.code || s.id;
                            if (this.stopNames[stopId]) {
                                fullName = this.stopNames[stopId][this.lang] || this.stopNames[stopId].tc;
                            }
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
                    this.updateTitleAndLabels();
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
                    const stopsInGroup = stopGroup.stops;
                    const otherStops = this.selectedUser.stops.filter(s => !stopsInGroup.includes(s));
                    this.selectedUser.stops = [...stopsInGroup, ...otherStops];
                    this.updateUrl();
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
                    this.timer = setInterval(() => {
                        if (this.countdown > 1) {
                            this.countdown--;
                        } else {
                            this.countdown = 10;
                        }
                    }, 1000);
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
                    const key = `${group.route}_${group.orig_dest}_${group.service_type}_${currentStopId}`;
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
                        if (!this.allRoutesList || this.allRoutesList.length === 0) {
                            const routeResp = await fetch(`https://data.etabus.gov.hk/v1/transport/kmb/route/`);
                            const routeJson = await routeResp.json();
                            this.allRoutesList = routeJson.data;
                        }
                        const boundInfo = this.allRoutesList.find(r => 
                            r.route === group.route &&
                            r.dest_tc === group.orig_dest && 
                            parseInt(r.service_type) === group.service_type
                        );
                        if (!boundInfo) {
                            console.warn("Could not find bound info for", group);
                            return;
                        }
                        const direction = boundInfo.bound === 'O' ? 'outbound' : 'inbound';
                        const stopsResp = await fetch(`https://data.etabus.gov.hk/v1/transport/kmb/route-stop/${group.route}/${direction}/${group.service_type}`);
                        const stopsJson = await stopsResp.json();
                        const stopList = stopsJson.data;
                        const currentIndex = stopList.findIndex(s => s.stop === currentStopId);
                        if (currentIndex !== -1) {
                            this.routeStops[key] = stopList.slice(currentIndex).map(s => {
                                const fullStopData = this.stopDataMap[s.stop];
                                const names = { tc: 'Unknown', sc: 'Unknown', en: 'Unknown' };
                                let code = '';

                                if (fullStopData) {
                                    // Extract code from any of the names (usually same across all)
                                    const match = (fullStopData.name_tc || '').match(/[\(（](.*?)[\)）]\s*$/);
                                    code = match ? match[1] : '';

                                    // Strip codes from names
                                    const strip = (n) => (n || '').replace(/[\(（].*?[\)）]\s*$/, '').trim();
                                    names.tc = strip(fullStopData.name_tc);
                                    names.sc = strip(fullStopData.name_sc);
                                    names.en = strip(fullStopData.name_en);
                                }
                                return { stop: s.stop, names, code: code, showCode: false };
                            });
                        } else {
                            this.routeStops[key] = [];
                        }
                    } catch (e) {
                        console.error('Failed to fetch route stops', e);
                    }
                },

                async fetchStopName(stopId) {
                    if (this.stopNames[stopId]) return;
                    if (this.stopDataMap[stopId]) {
                        this.stopNames[stopId] = {
                            tc: this.stopDataMap[stopId].name_tc,
                            sc: this.stopDataMap[stopId].name_sc,
                            en: this.stopDataMap[stopId].name_en
                        };
                        return;
                    }
                    try {
                        const resp = await fetch(`https://data.etabus.gov.hk/v1/transport/kmb/stop/${stopId}`);
                        const json = await resp.json();
                        if (json.data) {
                            this.stopNames[stopId] = {
                                tc: json.data.name_tc,
                                sc: json.data.name_sc,
                                en: json.data.name_en
                            };
                        }
                    } catch (e) {
                        console.error(`Error fetching stop name for ${stopId}`, e);
                    }
                },

                getGroupedStops() {
                    if (!this.selectedUser) return [];
                    return this.selectedUser.stops.map(stop => {
                        const stopId = this.getStopId(stop);
                        if (!stopId) return null;
                        let displayName = 'Loading...';
                        if (this.stopNames[stopId]) {
                            displayName = this.stopNames[stopId][this.lang] || this.stopNames[stopId].tc;
                        }
                        if (displayName !== 'Loading...' && stop.code) {
                            const codeStr = stop.code.toUpperCase();
                            if (!displayName.includes(codeStr)) {
                                displayName = `${displayName} (${codeStr})`;
                            }
                        }
                        return { originalIds: [stopId], name: displayName, stops: [stop], filterOpen: false };
                    }).filter(Boolean);
                },

                getGroupedETAForStops(stops) {
                    let allFiltered = [];
                    for (const stop of stops) {
                        const stopId = this.getStopId(stop);
                        if (!stopId) continue;
                        const data = this.etaData[stopId] || [];
                        const filtered = data.filter(item => {
                            let isRequestedRoute = stop.routes && stop.routes.length > 0 ? stop.routes.includes(item.route.toUpperCase()) : true;
                            if (this.urlRouteFilter.length > 0) isRequestedRoute = isRequestedRoute && this.urlRouteFilter.includes(item.route.toUpperCase());
                            return isRequestedRoute && item.eta !== null && item.eta !== '';
                        });
                        allFiltered = allFiltered.concat(filtered);
                    }
                    const uniqueEtasMap = new Map();
                    allFiltered.forEach(eta => {
                        const uniqueKey = `${eta.route}_${eta.dest_tc}_${eta.eta}`;
                        if (!uniqueEtasMap.has(uniqueKey)) uniqueEtasMap.set(uniqueKey, eta);
                        else if (eta.service_type < uniqueEtasMap.get(uniqueKey).service_type) uniqueEtasMap.set(uniqueKey, eta);
                    });
                    const grouped = {};
                    Array.from(uniqueEtasMap.values()).forEach(eta => {
                        const key = `${eta.route}_${eta.dest_tc}_${eta.service_type}`;
                        if (!grouped[key]) {
                            let dest = eta.dest_en;
                            if (this.lang === 'tc') dest = eta.dest_tc;
                            else if (this.lang === 'sc') dest = eta.dest_sc;
                            grouped[key] = {
                                route: eta.route,
                                dest: dest,
                                orig_dest: eta.dest_tc, // For stable expansion key
                                service_type: eta.service_type,
                                etas: []
                            };
                        }
                        grouped[key].etas.push(eta);
                    });
                    const result = Object.values(grouped);
                    result.forEach(group => group.etas.sort((a, b) => new Date(a.eta) - new Date(b.eta)));
                    result.sort((a, b) => {
                        const timeA = a.etas.length > 0 ? new Date(a.etas[0].eta).getTime() : Infinity;
                        const timeB = b.etas.length > 0 ? new Date(b.etas[0].eta).getTime() : Infinity;
                        if (timeA === timeB) return a.route.localeCompare(b.route, undefined, {numeric: true, sensitivity: 'base'});
                        return timeA - timeB;
                    });
                    return result;
                },

                formatETA(etaTime) {
                    if (!etaTime) return this.t('noData');
                    const diffMs = new Date(etaTime) - new Date();
                    if (diffMs <= 0) return this.t('arrived');
                    if (diffMs <= 90000) return this.t('arriving');
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