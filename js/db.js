/**
 * ═══════════════════════════════════════════════════════════
 *  DB.js — 가상 데이터베이스 레이어
 *  모든 더미 데이터를 한 곳에서 생성·관리하여 일관성 확보
 *  기존: app.hosts, app.logs, dataViews.cachedB2B 등 파편화
 *  변경: DB.getHosts(), DB.getLogs(), DB.getB2B() 등 중앙 쿼리
 * ═══════════════════════════════════════════════════════════
 */
const DB = {
    // ── 내부 저장소 ──
    _hosts: [],
    _logs: [],
    _reports: [],
    _b2b: [],
    _tax: [],
    _assets: [],
    _cards: [],

    // ── 상수 ──
    COMPANIES: ['미래건설산업(주)','(주)글로벌네트웍스','제일유통','하나시스템(주)','태양물산','한국정밀','대보건설','현대유통','스마트솔루션즈','다우테크','씨제이대한','에스케이망'],
    OS_LIST: ['Windows 10 Pro','Windows 11','Windows Server 2019','Windows Server 2022'],
    BANKS_TAG: ['A은행','B은행','C은행','D은행'],
    BANKS_FULL: ['A은행(국민)','B은행(신한)','C은행(기업)','D은행(농협)'],
    CARD_COMPANIES: ['현대카드','삼성카드','신한카드','국민카드'],
    TAX_PARTNERS: ['삼성물산(주)','한국전력공사','(주)LG화학','현대자동차(주)','SK하이닉스','포스코건설','CJ제일제당','대한항공','KT','이마트'],
    TAX_ITEMS: ['건축 자재 납품','산업용 전기요금','원자재 구매','물류/운송비','IT 인프라 유지보수','사무용품 대량구매','마케팅 대행비','시설 임대료'],
    CARD_CATEGORIES: ['주유/교통비','항공/숙박(출장)','식대/접대비','공과금/기타'],

    // ── 유틸 ──
    _pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
    _rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; },
    _bizNo() { return `${this._rand(100,999)}-${this._rand(10,99)}-${this._rand(10000,99999)}`; },

    // ═══════════════════════════════════════
    //  초기화 (한번만 호출)
    // ═══════════════════════════════════════
    init() {
        this._genHosts();
        this._genLogs();
        this._genReports();
        this._genB2B();
        this._genTax();
        this._genAssets();
        this._genCards();
        console.log('[DB] 초기화 완료 — hosts:', this._hosts.length, '/ logs:', this._logs.length);
    },

    // ─── 단말(호스트) ───
    _genHosts() {
        for (let i = 1; i <= 300; i++) {
            const isCritical = (i === 1 || i === 85 || i === 210);
            const isWarning = (!isCritical && i % 25 === 0);
            const status = isCritical ? 'critical' : (isWarning ? 'warning' : 'normal');
            this._hosts.push({
                id: `AGT-${1000 + i}`,
                name: this.COMPANIES[i % this.COMPANIES.length] + (i > 15 ? ` ${i}지점` : ''),
                ip: `192.168.${i % 255}.${(i * 3) % 255}`,
                os: this.OS_LIST[i % this.OS_LIST.length],
                status,
                lastPing: status === 'critical' ? '14:20:00' : (status === 'warning' ? '14:45:00' : '14:56:55'),
                elapsed: status === 'critical' ? '37분 경과' : (status === 'warning' ? '12분 경과' : '1분 이내'),
                isVip: i % 8 === 0,
                terminals: Math.floor(Math.random() * 3) + 1,
                errorCount: isCritical ? 3 : (isWarning ? 1 : 0)
            });
        }
    },

    // ─── 시스템 로그 ───
    _genLogs() {
        for (let i = 1; i <= 300; i++) {
            const rand = Math.random();
            const host = this._hosts[i % this._hosts.length];
            let type, color, message;
            if (rand < 0.05) { type = 'CRITICAL'; color = 'text-red-600 bg-red-50 border-red-100'; message = 'Flag 수신 지연 임계치 초과. 상태가 [장애]로 강제 전환됨.'; }
            else if (rand < 0.1) { type = 'SYSTEM'; color = 'text-blue-600 bg-blue-50 border-blue-100'; message = 'Watcher 자동 복구 서비스 개입. 강제 재시작 명령 전송 및 복구 완료.'; }
            else if (rand < 0.2) { type = 'WARNING'; color = 'text-yellow-600 bg-yellow-50 border-yellow-100'; message = 'Flag 수신 지연 감지. 1차 모니터링 경고 발송됨.'; }
            else { type = 'INFO'; color = 'text-slate-500 bg-slate-100 border-slate-200'; message = `정상 Ping 응답 수신 (지연시간: ${this._rand(10,50)}ms)`; }
            const date = new Date(Date.now() - i * 1000 * 60 * 15);
            this._logs.push({
                time: `${date.toISOString().split('T')[0]} ${date.toTimeString().split(' ')[0]}`,
                type, color,
                host: `${host.name} (${host.id})`,
                hostId: host.id,
                msg: message
            });
        }
    },

    // ─── 보고서 ───
    _genReports() {
        this._reports = [
            { id: 'RPT-001', type: 'weekly', typeName: '주간', title: '2월 4주차 시스템 운영 주간보고서', dateRange: '2026-02-23 ~ 2026-03-01', group: 'all', groupName: '전체 고객사', created: '2026.03.02', format: 'pdf' },
            { id: 'RPT-002', type: 'monthly', typeName: '월간', title: '2월 VIP 고객사 관제 현황 월간보고서', dateRange: '2026-02-01 ~ 2026-02-28', group: 'vip', groupName: 'VIP 고객사', created: '2026.03.01', format: 'excel' }
        ];
    },

    // ─── 전자어음 / B2B ───
    _genB2B() {
        const types = ['전자어음','B2B매출','B2B매입'];
        for (let i = 0; i < 300; i++) {
            const dday = this._rand(1, 90);
            const amt = this._rand(10, 500) * 1000000;
            const type = this._pick(types);
            this._b2b.push({
                name: this.COMPANIES[i % this.COMPANIES.length] + (i > 15 ? ` ${i}지점` : ''),
                regNo: this._bizNo(),
                bank: this._pick(this.BANKS_TAG),
                type, amount: amt, dday,
                date: `2026-0${3 + Math.floor(dday / 30)}-${String((dday % 28) + 1).padStart(2, '0')}`,
                status: dday <= 30 && type !== 'B2B매입' ? 'target' : 'monitor'
            });
        }
        this._b2b.sort((a, b) => a.dday - b.dday);
    },

    // ─── 세금계산서 ───
    _genTax() {
        for (let i = 0; i < 300; i++) {
            const isSales = Math.random() > 0.4;
            const amt = this._rand(5, 900) * 1000000;
            this._tax.push({
                type: isSales ? '매출' : '매입',
                partner: this._pick(this.TAX_PARTNERS) + (i > 10 ? ` ${i}지사` : ''),
                item: this._pick(this.TAX_ITEMS),
                amount: amt,
                status: isSales && amt > 100000000 ? '우량' : (isSales ? '보통' : '지출')
            });
        }
    },

    // ─── 금융자산(예적금 만기) ───
    _genAssets() {
        for (let i = 0; i < 150; i++) {
            this._assets.push({
                name: this.COMPANIES[i % this.COMPANIES.length] + (i > 8 ? ` ${i}지점` : ''),
                bank: this._pick(this.BANKS_FULL),
                product: Math.random() > 0.5 ? '정기예금' : '적금',
                amount: this._rand(50, 300) * 10000000,
                dday: this._rand(1, 60)
            });
        }
        this._assets.sort((a, b) => a.dday - b.dday);
    },

    // ─── 법인카드 ───
    _genCards() {
        for (let i = 0; i < 150; i++) {
            this._cards.push({
                name: this.COMPANIES[i % 6] + (i > 5 ? ` ${i}본부` : ''),
                category: this._pick(this.CARD_CATEGORIES),
                bank: this._pick(this.CARD_COMPANIES),
                amount: this._rand(5, 50) * 1000000
            });
        }
        this._cards.sort((a, b) => b.amount - a.amount);
    },

    // ═══════════════════════════════════════
    //  쿼리 메서드 (기존 코드에서 호출)
    // ═══════════════════════════════════════

    // -- 호스트 --
    getHosts()       { return this._hosts; },
    getHostById(id)  { return this._hosts.find(h => h.id === id); },
    getHostByName(n) { return this._hosts.find(h => h.name === n || h.name.includes(n)); },

    getHostStats(filterVal) {
        let filtered = this._hosts;
        if (filterVal === 'vip') filtered = filtered.filter(h => h.isVip);
        if (filterVal === 'gen') filtered = filtered.filter(h => !h.isVip);
        let total = 0, normal = 0, warn = 0, error = 0;
        filtered.forEach(h => {
            total += h.terminals;
            if (h.status === 'critical') error += h.terminals;
            else if (h.status === 'warning') warn += h.terminals;
            else normal += h.terminals;
        });
        const uptime = total > 0 ? (((total - error) / total) * 100).toFixed(2) : '100.00';
        const recovery = Math.floor(filtered.length * 0.015) + (error > 0 ? 1 : 0);
        return { total, normal, warn, error, uptime, recovery };
    },

    filterHosts(keyword, statusVal) {
        return this._hosts.filter(h => {
            const kw = keyword ? keyword.toLowerCase() : '';
            const matchKw = !kw || h.name.toLowerCase().includes(kw) || h.ip.includes(kw) || h.id.toLowerCase().includes(kw);
            const matchSt = statusVal === 'all' ? true : (statusVal === 'critical' ? (h.status === 'critical' || h.status === 'warning') : true);
            return matchKw && matchSt;
        });
    },

    // -- 로그 --
    getLogs()    { return this._logs; },
    filterLogs(keyword) {
        const kw = keyword ? keyword.toLowerCase() : '';
        return this._logs.filter(l => !kw || l.host.toLowerCase().includes(kw) || l.msg.toLowerCase().includes(kw) || l.type.toLowerCase().includes(kw));
    },
    getAlertLogs(hostIds, limit) {
        return this._logs.filter(l => {
            const match = l.host.match(/\((AGT-\d+)\)/);
            return match && hostIds.includes(match[1]) && (l.type === 'CRITICAL' || l.type === 'WARNING' || l.type === 'SYSTEM');
        }).slice(0, limit || 3);
    },

    // -- 보고서 --
    getReports()      { return this._reports; },
    getReport(id)     { return this._reports.find(r => r.id === id); },
    addReport(r)      { this._reports.unshift(r); },

    // -- B2B --
    getB2B()          { return this._b2b; },
    filterB2B(keyword) {
        const kw = keyword ? keyword.toLowerCase() : '';
        return this._b2b.filter(i => !kw || i.name.toLowerCase().includes(kw) || i.regNo.includes(kw) || i.bank.toLowerCase().includes(kw));
    },

    // -- 세금계산서 --
    getTax()          { return this._tax; },
    filterTax(keyword) {
        const kw = keyword ? keyword.toLowerCase() : '';
        return this._tax.filter(i => !kw || i.partner.toLowerCase().includes(kw) || i.item.toLowerCase().includes(kw) || i.type.includes(kw));
    },

    // -- 자산 --
    getAssets()       { return this._assets; },
    filterAssets(keyword) {
        const kw = keyword ? keyword.toLowerCase() : '';
        return this._assets.filter(i => !kw || i.name.toLowerCase().includes(kw) || i.bank.toLowerCase().includes(kw));
    },

    // -- 카드 --
    getCards()        { return this._cards; },
    filterCards(keyword) {
        const kw = keyword ? keyword.toLowerCase() : '';
        return this._cards.filter(i => !kw || i.name.toLowerCase().includes(kw) || i.category.toLowerCase().includes(kw) || i.bank.toLowerCase().includes(kw));
    }
};
