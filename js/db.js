/**
 * ═══════════════════════════════════════════════════════════
 *  DB.js — 가상 데이터베이스 레이어
 *  모든 더미 데이터를 한 곳에서 생성·관리하여 일관성 확보
 *  기존: app.hosts, app.logs, dataViews.cachedB2B 등 파편화
 *  변경: DB.getHosts(), DB.getLogs(), DB.getB2B() 등 중앙 쿼리
 * ═══════════════════════════════════════════════════════════
 */
const DB = {
    // ── 관리자 계정 ──
    AUTH: { id: 'webcash', pw: 'webcash1!!' },

    // ── 내부 저장소 ──
    _hosts: [],
    _logs: [],
    _flagMessages: [],
    _rebootHistory: [],
    _reports: [],
    _b2b: [],
    _tax: [],
    _assets: [],
    _cards: [],
    _cardMonthly: [],
    _depositDetail: [],
    _cashFlow: [],
    _proposals: [],
    _campaigns: [],
    _segments: [],

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
        this._genFlagMessages();
        this._genRebootHistory();
        this._genReports();
        this._genB2B();
        this._genTax();
        this._genAssets();
        this._genCards();
        this._genCardMonthly();
        this._genDepositDetail();
        this._genCashFlow();
        this._genProposals();
        this._genCampaigns();
        this._genSegments();
        console.log('[DB] 초기화 완료 — hosts:', this._hosts.length, '/ flags:', this._flagMessages.length, '/ reboots:', this._rebootHistory.length);
    },

    // ─── 단말(호스트) ───
    _genHosts() {
        for (let i = 1; i <= 300; i++) {
            const isCritical = (i === 1 || i === 85 || i === 210);
            const isPersistent = (i === 42 || i === 130);
            const isWarning = (!isCritical && !isPersistent && i % 25 === 0);
            const status = isPersistent ? 'persistent' : (isCritical ? 'critical' : (isWarning ? 'warning' : 'normal'));
            this._hosts.push({
                id: `AGT-${1000 + i}`,
                name: this.COMPANIES[i % this.COMPANIES.length] + (i > 15 ? ` ${i}지점` : ''),
                ip: `192.168.${i % 255}.${(i * 3) % 255}`,
                os: this.OS_LIST[i % this.OS_LIST.length],
                status,
                lastPing: status === 'critical' ? '14:20:00' : (status === 'persistent' ? '13:05:00' : (status === 'warning' ? '14:45:00' : '14:56:55')),
                elapsed: status === 'critical' ? '37분 경과' : (status === 'persistent' ? '112분 경과' : (status === 'warning' ? '12분 경과' : '1분 이내')),
                isVip: i % 8 === 0,
                terminals: Math.floor(Math.random() * 3) + 1,
                errorCount: isCritical ? 3 : (isPersistent ? 5 : (isWarning ? 1 : 0)),
                rebootAttempts: isPersistent ? 3 : (isCritical ? 1 : 0),
                rebootSuccess: isPersistent ? false : true
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

    // ─── Flag 메시지 유형별 이력 ───
    _genFlagMessages() {
        const types = [
            { code: 'FLAG_ACK', label: '정상 수신', severity: 'normal' },
            { code: 'LATENCY_WARN', label: '1회 미수신', severity: 'warning' },
            { code: 'TIMEOUT', label: '2회+ 미수신', severity: 'critical' },
            { code: 'REBOOT_CMD', label: '재구동 명령', severity: 'system' },
            { code: 'REBOOT_OK', label: '재구동 성공', severity: 'success' },
            { code: 'REBOOT_FAIL', label: '재구동 실패', severity: 'error' }
        ];
        for (let i = 0; i < 500; i++) {
            const host = this._hosts[i % this._hosts.length];
            const type = (i < 30) ? types[this._rand(1, 5)] : types[0];
            const date = new Date(Date.now() - i * 1000 * 60 * 12);
            this._flagMessages.push({
                id: `FLG-${10000 + i}`,
                time: `${date.toISOString().split('T')[0]} ${date.toTimeString().split(' ')[0]}`,
                hostId: host.id,
                hostName: host.name,
                code: type.code,
                label: type.label,
                severity: type.severity,
                latency: type.severity === 'normal' ? this._rand(10, 80) + 'ms' : '-',
                detail: type.code === 'FLAG_ACK' ? `정상 Ping 응답 수신 (${this._rand(10,60)}ms)` :
                        type.code === 'LATENCY_WARN' ? 'Flag 수신 지연 감지. 1차 경고.' :
                        type.code === 'TIMEOUT' ? 'Flag 미수신 임계치 초과. [장애] 전환.' :
                        type.code === 'REBOOT_CMD' ? 'Watcher 자동 복구. 재시작 명령 전송.' :
                        type.code === 'REBOOT_OK' ? '재구동 완료. Agent 정상 확인.' :
                        '재구동 시도 실패. 운영자 확인 필요.'
            });
        }
    },

    // ─── 재구동 이력 ───
    _genRebootHistory() {
        const problemHosts = this._hosts.filter(h => h.status !== 'normal');
        problemHosts.forEach(host => {
            const attempts = host.status === 'persistent' ? 3 : this._rand(1, 3);
            for (let a = 0; a < attempts; a++) {
                const success = (a === attempts - 1) && host.status !== 'persistent';
                const date = new Date(Date.now() - this._rand(1, 48) * 3600000);
                this._rebootHistory.push({
                    id: 'RBT-' + Math.random().toString(36).substr(2,6).toUpperCase(),
                    hostId: host.id,
                    hostName: host.name,
                    ip: host.ip,
                    time: `${date.toISOString().split('T')[0]} ${date.toTimeString().split(' ')[0]}`,
                    attempt: a + 1,
                    maxAttempts: 3,
                    result: success ? 'success' : 'fail',
                    resultLabel: success ? '성공' : '실패',
                    nextAction: success ? '정상 전환' : (a >= 2 ? '운영자 확인 필요' : '재시도 예정'),
                    isVip: host.isVip
                });
            }
        });
        this._rebootHistory.sort((a, b) => b.time.localeCompare(a.time));
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

    // ─── 법인카드 월별 추이 (8개월) ───
    _genCardMonthly() {
        const months = ['2025.08','2025.09','2025.10','2025.11','2025.12','2026.01','2026.02','2026.03'];
        const cats = ['주유/교통비','항공/숙박(출장)','식대/접대비','공과금/기타'];
        cats.forEach(cat => {
            const base = cat === '주유/교통비' ? 4200 : (cat === '항공/숙박(출장)' ? 3100 : (cat === '식대/접대비' ? 1800 : 900));
            months.forEach(m => {
                this._cardMonthly.push({ month: m, category: cat, amount: (base + this._rand(-500, 800)) * 10000 });
            });
        });
    },

    // ─── 예적금 은행별 상세 ───
    _genDepositDetail() {
        const banks = [
            { bank: '당행(하나)', color: '#0d9488' },
            { bank: 'A은행(국민)', color: '#3b82f6' },
            { bank: 'B은행(신한)', color: '#f59e0b' },
            { bank: 'C은행(기업)', color: '#94a3b8' }
        ];
        banks.forEach(b => {
            const depAmt = b.bank.includes('하나') ? this._rand(600,900) : this._rand(100,450);
            const savAmt = b.bank.includes('하나') ? this._rand(200,400) : this._rand(50,200);
            this._depositDetail.push({
                bank: b.bank, color: b.color,
                deposit: depAmt * 100000000,
                savings: savAmt * 100000000,
                total: (depAmt + savAmt) * 100000000,
                maturity30: this._rand(2, 15),
                maturity60: this._rand(5, 25),
                maturity90: this._rand(10, 40),
                rate: (this._rand(25, 48) / 10).toFixed(1)
            });
        });
    },

    // ─── 일별 자금흐름 (고객사별 30일) ───
    _genCashFlow() {
        this.COMPANIES.forEach(comp => {
            for (let i = 29; i >= 0; i--) {
                const d = new Date(Date.now() - i * 86400000);
                const dateStr = `${d.getMonth()+1}/${d.getDate()}`;
                const inflow = this._rand(20, 120) * 1000000;
                const outflow = this._rand(15, 90) * 1000000;
                this._cashFlow.push({ company: comp, date: dateStr, inflow, outflow, net: inflow - outflow });
            }
        });
    },

    // ─── 영업 제안 이력 ───
    _genProposals() {
        const types = ['기업 운전자금 대출 제안','고금리 예적금 유치 제안','주유 특화 법인카드 제안','여신 한도 상향 제안','맞춤형 예금 금리 패키지','자금흐름 맞춤 여신 제안','종합 금융 패키지 제안'];
        const channels = ['이메일','SMS','카카오 알림톡'];
        const statuses = [{s:'sent',l:'발송완료',w:25},{s:'read',l:'열람확인',w:30},{s:'responded',l:'회신접수',w:15},{s:'accepted',l:'승인(계약)',w:10},{s:'rejected',l:'거절',w:10},{s:'expired',l:'만료',w:10}];
        for (let i = 0; i < 80; i++) {
            const daysAgo = this._rand(0, 60);
            const d = new Date(Date.now() - daysAgo * 86400000);
            const timeStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(this._rand(8,18)).padStart(2,'0')}:${String(this._rand(0,59)).padStart(2,'0')}`;
            const r = Math.random()*100; let cum=0, status=statuses[0];
            for(const st of statuses){cum+=st.w;if(r<cum){status=st;break;}}
            const comp = this.COMPANIES[i % this.COMPANIES.length] + (i > 14 ? ` ${i}지점` : '');
            const ch = [channels[this._rand(0,2)]]; if(Math.random()>0.5) ch.push(channels[this._rand(0,2)]);
            this._proposals.push({ id:'PRP-'+String(1000+i), company:comp, type:this._pick(types), channels:[...new Set(ch)], status:status.s, statusLabel:status.l, sentAt:timeStr, rm:'RM'+this._rand(100,999), amount:this._rand(1,50)*100000000 });
        }
        this._proposals.sort((a,b) => b.sentAt.localeCompare(a.sentAt));
    },
    _genCampaigns() {
        this._campaigns = [
            { id:'CMP-001', name:'Q1 만기 예적금 대량 유치', type:'예적금 유치', status:'active', statusLabel:'진행 중', targetCount:45, sentCount:38, responseCount:12, acceptCount:5, startDate:'2026-01-15', endDate:'2026-03-31', desc:'Q1 타행 예적금 만기 도래 고객 대상 특별금리 유치 캠페인' },
            { id:'CMP-002', name:'B2B 고액 만기 여신 제안', type:'대출/여신', status:'active', statusLabel:'진행 중', targetCount:28, sentCount:22, responseCount:8, acceptCount:3, startDate:'2026-02-01', endDate:'2026-04-30', desc:'B2B/전자어음 만기 30일 이내 고액 거래 고객 대상 여신 제안' },
            { id:'CMP-003', name:'타행카드 전환 집중 프로모션', type:'법인카드', status:'active', statusLabel:'진행 중', targetCount:60, sentCount:55, responseCount:18, acceptCount:7, startDate:'2026-02-15', endDate:'2026-05-15', desc:'주유/교통비 고비중 타행 카드 사용 고객 전환 캠페인' },
            { id:'CMP-004', name:'매출 우량 기업 VIP 여신 확대', type:'대출/여신', status:'scheduled', statusLabel:'예정', targetCount:20, sentCount:0, responseCount:0, acceptCount:0, startDate:'2026-04-01', endDate:'2026-06-30', desc:'세금계산서 매출 우량 기업 대상 여신 한도 상향 캠페인' },
            { id:'CMP-005', name:'2025 하반기 종합 금융 패키지', type:'종합 패키지', status:'completed', statusLabel:'완료', targetCount:80, sentCount:76, responseCount:32, acceptCount:15, startDate:'2025-07-01', endDate:'2025-12-31', desc:'2025 하반기 전 고객사 대상 종합 금융 상품 패키지 제안' },
            { id:'CMP-006', name:'자금흐름 적자 기업 긴급 여신', type:'대출/여신', status:'completed', statusLabel:'완료', targetCount:15, sentCount:15, responseCount:9, acceptCount:6, startDate:'2025-10-01', endDate:'2026-01-31', desc:'자금흐름 분석 기반 적자 빈도 높은 기업 선제적 여신 제안' }
        ];
    },
    _genSegments() {
        const segDefs = [
            { id:'SEG-VIP', name:'VIP 핵심 고객', color:'#0d9488', icon:'fa-crown', desc:'대출+예금+카드 3개 이상 거래, 연매출 100억 이상', criteria:'복합거래 3종+ & 매출 100억+' },
            { id:'SEG-GROW', name:'성장 잠재 고객', color:'#3b82f6', icon:'fa-arrow-trend-up', desc:'매출 증가 추세, 당행 점유율 확대 가능', criteria:'최근 3개월 매출 증가 & 당행점유 50% 미만' },
            { id:'SEG-RISK', name:'이탈 위험 고객', color:'#ef4444', icon:'fa-triangle-exclamation', desc:'타행 거래 비중 증가, 예적금 만기 미갱신 위험', criteria:'타행비중 60%+ & D-30 만기 보유' },
            { id:'SEG-CARD', name:'카드 전환 타겟', color:'#8b5cf6', icon:'fa-credit-card', desc:'타행 법인카드 고액 사용, 당행 카드 미보유', criteria:'타행 카드 월 500만+ & 당행 카드 없음' },
            { id:'SEG-LOAN', name:'여신 확대 타겟', color:'#f59e0b', icon:'fa-hand-holding-dollar', desc:'매출 우량 + B2B 만기 도래, 여신 수요 높음', criteria:'매출 우량 & B2B만기 D-30 보유' },
            { id:'SEG-NEW', name:'신규 유치 대상', color:'#64748b', icon:'fa-user-plus', desc:'CMS 연동만 된 상태, 금융 거래 미개시', criteria:'CMS 연동 완료 & 금융거래 0건' }
        ];
        segDefs.forEach(seg => {
            const count = this._rand(8, 45);
            const members = [];
            for(let i=0; i<count; i++) {
                const comp = this.COMPANIES[i % this.COMPANIES.length] + (i > 8 ? ` ${this._rand(1,99)}지점` : '');
                members.push({ name:comp, score:this._rand(30,99), revenue:this._rand(10,500)*100000000, hanaRatio:this._rand(10,80) });
            }
            members.sort((a,b)=>b.score-a.score);
            this._segments.push({ ...seg, count, members, avgScore:Math.round(members.reduce((s,m)=>s+m.score,0)/count) });
        });
    },

    // ═══════════════════════════════════════
    //  쿼리 메서드
    // ═══════════════════════════════════════

    // -- 호스트 --
    getHosts()       { return this._hosts; },
    getHostById(id)  { return this._hosts.find(h => h.id === id); },
    getHostByName(n) { return this._hosts.find(h => h.name === n || h.name.includes(n)); },

    getHostStats(filterVal) {
        let filtered = this._hosts;
        if (filterVal === 'vip') filtered = filtered.filter(h => h.isVip);
        if (filterVal === 'gen') filtered = filtered.filter(h => !h.isVip);
        let total = 0, normal = 0, warn = 0, error = 0, persistent = 0;
        filtered.forEach(h => {
            total += h.terminals;
            if (h.status === 'critical') error += h.terminals;
            else if (h.status === 'persistent') { error += h.terminals; persistent += h.terminals; }
            else if (h.status === 'warning') warn += h.terminals;
            else normal += h.terminals;
        });
        const uptime = total > 0 ? (((total - error) / total) * 100).toFixed(2) : '100.00';
        const recovery = Math.floor(filtered.length * 0.015) + (error > 0 ? 1 : 0);
        return { total, normal, warn, error, persistent, uptime, recovery };
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
    },

    // -- Flag 메시지 --
    getFlagMessages(filter) {
        let data = [...this._flagMessages];
        if (filter) {
            if (filter.code && filter.code !== 'all') data = data.filter(f => f.code === filter.code);
            if (filter.keyword) {
                const kw = filter.keyword.toLowerCase();
                data = data.filter(f => f.hostName.toLowerCase().includes(kw) || f.code.toLowerCase().includes(kw) || f.label.includes(kw));
            }
        }
        return data;
    },
    getFlagCounts() {
        const c = { FLAG_ACK:0, LATENCY_WARN:0, TIMEOUT:0, REBOOT_CMD:0, REBOOT_OK:0, REBOOT_FAIL:0 };
        this._flagMessages.forEach(f => { if(c[f.code] !== undefined) c[f.code]++; });
        return c;
    },

    // -- 재구동 이력 --
    getRebootHistory(filter) {
        let data = [...this._rebootHistory];
        if (filter) {
            if (filter.hostId) data = data.filter(r => r.hostId === filter.hostId);
            if (filter.result && filter.result !== 'all') data = data.filter(r => r.result === filter.result);
            if (filter.keyword) {
                const kw = filter.keyword.toLowerCase();
                data = data.filter(r => r.hostName.toLowerCase().includes(kw) || r.hostId.toLowerCase().includes(kw));
            }
        }
        return data;
    },
    getRebootStats() {
        const total = this._rebootHistory.length;
        const success = this._rebootHistory.filter(r => r.result === 'success').length;
        const fail = this._rebootHistory.filter(r => r.result === 'fail').length;
        const persistentHosts = [...new Set(this._rebootHistory.filter(r => r.attempt >= 3 && r.result === 'fail').map(r => r.hostId))].length;
        return { total, success, fail, persistentHosts, successRate: total > 0 ? ((success/total)*100).toFixed(1) : '0.0' };
    },

    // -- 카드 월별 추이 --
    getCardMonthly()  { return this._cardMonthly; },
    getCardMonthlyByCategory() {
        const result = {};
        this._cardMonthly.forEach(c => { if(!result[c.category]) result[c.category] = []; result[c.category].push(c); });
        return result;
    },

    // -- 예적금 상세 --
    getDepositDetail() { return this._depositDetail; },
    getDepositSummary() {
        let totalDeposit = 0, totalSavings = 0, hanaShare = 0, totalAll = 0;
        this._depositDetail.forEach(d => { totalDeposit += d.deposit; totalSavings += d.savings; totalAll += d.total; if(d.bank.includes('하나')) hanaShare = d.total; });
        return { totalDeposit, totalSavings, totalAll, hanaShare, hanaRatio: totalAll > 0 ? ((hanaShare/totalAll)*100).toFixed(1) : '0' };
    },
    getAssetsByCompany() {
        const map = {};
        this._assets.forEach(a => {
            if (!map[a.name]) map[a.name] = { name: a.name, items: [], totalAmt: 0, d30: 0, bankSet: new Set() };
            map[a.name].items.push(a); map[a.name].totalAmt += a.amount;
            if (a.dday <= 30) map[a.name].d30++;
            map[a.name].bankSet.add(a.bank);
        });
        return Object.values(map).map(c => ({ ...c, banks: [...c.bankSet].join(', '), count: c.items.length })).sort((a,b) => b.totalAmt - a.totalAmt);
    },

    // -- 자금흐름 --
    getCashFlow(company) {
        if (company) return this._cashFlow.filter(c => c.company === company);
        // 전체 합산: 날짜별로 묶기
        const map = {};
        this._cashFlow.forEach(c => {
            if (!map[c.date]) map[c.date] = { date: c.date, inflow: 0, outflow: 0, net: 0 };
            map[c.date].inflow += c.inflow; map[c.date].outflow += c.outflow; map[c.date].net += c.net;
        });
        return Object.values(map);
    },
    getCashFlowSummary(company) {
        const data = this.getCashFlow(company).slice(-7);
        let inTotal = 0, outTotal = 0;
        data.forEach(c => { inTotal += c.inflow; outTotal += c.outflow; });
        return { inTotal, outTotal, net: inTotal - outTotal, days: data.length };
    },
    getCashFlowCompanies() {
        return [...new Set(this._cashFlow.map(c => c.company))];
    },
    getCashFlowRanking() {
        const map = {};
        this._cashFlow.forEach(c => {
            if (!map[c.company]) map[c.company] = { company: c.company, totalIn: 0, totalOut: 0 };
            map[c.company].totalIn += c.inflow; map[c.company].totalOut += c.outflow;
        });
        return Object.values(map).map(c => ({ ...c, net: c.totalIn - c.totalOut })).sort((a,b) => b.totalIn - a.totalIn);
    },

    // -- B2B 분기별 집계 --
    getB2BSummaryByQuarter() {
        const q = { 'Q1(1~3월)': { count:0, amount:0, target:0 }, 'Q2(4~6월)': { count:0, amount:0, target:0 } };
        this._b2b.forEach(b => {
            const key = b.dday <= 45 ? 'Q1(1~3월)' : 'Q2(4~6월)';
            q[key].count++; q[key].amount += b.amount; if(b.status==='target') q[key].target++;
        });
        return q;
    },

    // -- 세금계산서 집계 --
    getTaxSummary() {
        let salesAmt = 0, purchaseAmt = 0, salesCnt = 0, purchaseCnt = 0, premium = 0;
        this._tax.forEach(t => {
            if(t.type==='매출') { salesAmt += t.amount; salesCnt++; if(t.status==='우량') premium++; }
            else { purchaseAmt += t.amount; purchaseCnt++; }
        });
        return { salesAmt, purchaseAmt, salesCnt, purchaseCnt, premium };
    },

    // -- 반복 장애 고객 집계 --
    getRepeatOffenders(days) {
        const cutoff = Date.now() - (days || 7) * 86400000;
        const counts = {};
        this._logs.filter(l => new Date(l.time) >= cutoff && (l.type === 'CRITICAL' || l.type === 'WARNING')).forEach(l => {
            const key = l.hostId || l.host;
            if (!counts[key]) counts[key] = { hostId: key, hostName: l.host, count: 0, types: {} };
            counts[key].count++;
            counts[key].types[l.type] = (counts[key].types[l.type] || 0) + 1;
        });
        return Object.values(counts).filter(c => c.count >= 2).sort((a, b) => b.count - a.count);
    },

    // -- 금일 장애 호스트 --
    getTodayErrors() {
        return this._hosts.filter(h => h.status === 'critical' || h.status === 'persistent');
    },

    // -- 제안 이력 --
    getProposals(filter) {
        let data = [...this._proposals];
        if(filter) {
            if(filter.status && filter.status!=='all') data = data.filter(p=>p.status===filter.status);
            if(filter.keyword) { const kw=filter.keyword.toLowerCase(); data=data.filter(p=>p.company.toLowerCase().includes(kw)||p.type.toLowerCase().includes(kw)||p.rm.toLowerCase().includes(kw)); }
        }
        return data;
    },
    addProposal(p) { this._proposals.unshift(p); },
    getProposalStats() {
        const t=this._proposals.length; const sent=this._proposals.filter(p=>p.status==='sent').length;
        const read=this._proposals.filter(p=>p.status==='read').length; const resp=this._proposals.filter(p=>p.status==='responded').length;
        const acc=this._proposals.filter(p=>p.status==='accepted').length; const rej=this._proposals.filter(p=>p.status==='rejected').length;
        const totalAmt=this._proposals.filter(p=>p.status==='accepted').reduce((s,p)=>s+p.amount,0);
        return { total:t, sent, read, responded:resp, accepted:acc, rejected:rej, expired:t-sent-read-resp-acc-rej, conversionRate:t>0?((acc/t)*100).toFixed(1):'0', totalAmount:totalAmt };
    },
    getCampaigns() { return this._campaigns; },
    getCampaignById(id) { return this._campaigns.find(c=>c.id===id); },
    getSegments() { return this._segments; },
    getSegmentById(id) { return this._segments.find(s=>s.id===id); },

    // -- 데이터 활용 총괄 요약 --
    getDataOverview() {
        const ts = this.getTaxSummary();
        const ds = this.getDepositSummary();
        const cs = this.getCashFlowSummary();
        const b2b = this._b2b;
        const cards = this._cards;
        return {
            totalCompanies: this.COMPANIES.length,
            b2bCount: b2b.length, b2bAmount: b2b.reduce((s,d)=>s+d.amount,0), b2bTarget: b2b.filter(d=>d.status==='target').length,
            taxSales: ts.salesAmt, taxPurchase: ts.purchaseAmt, taxPremium: ts.premium,
            assetTotal: ds.totalAll, hanaShare: ds.hanaShare, hanaRatio: ds.hanaRatio,
            cardTotal: cards.reduce((s,c)=>s+c.amount,0), cardCount: cards.length,
            cashIn7d: cs.inTotal, cashOut7d: cs.outTotal, cashNet7d: cs.net,
            d30Assets: this._assets.filter(a=>a.dday<=30).length
        };
    }
};
