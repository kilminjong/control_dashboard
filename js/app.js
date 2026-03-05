const app = {
    state: { normalThreshold: 5, warningThreshold: 10, errorThreshold: 30, flagInterval: 60, autoRecovery: true },
    chartInstances: [],
    c360Charts: [], 
    

    _sessionTimer: null,
    SESSION_DURATION: 30 * 60 * 1000, // 30분

    doLogin() {
        const id = document.getElementById('login-id').value.trim();
        const pw = document.getElementById('login-pw').value;
        const errEl = document.getElementById('login-error');
        const btn = document.getElementById('login-btn');

        if (id === DB.AUTH.id && pw === DB.AUTH.pw) {
            errEl.classList.add('hidden');
            btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-2"></i>접속 중...`;
            btn.disabled = true;
            sessionStorage.setItem('cms_login', Date.now().toString());
            setTimeout(() => {
                document.getElementById('login-screen').style.display = 'none';
                this.init();
                this._startSessionTimer();
            }, 600);
        } else {
            errEl.classList.remove('hidden');
            document.getElementById('login-pw').value = '';
            document.getElementById('login-pw').focus();
        }
    },

    checkSession() {
        const loginTime = sessionStorage.getItem('cms_login');
        if (loginTime && (Date.now() - parseInt(loginTime)) < this.SESSION_DURATION) {
            document.getElementById('login-screen').style.display = 'none';
            this.init();
            this._startSessionTimer();
        } else {
            sessionStorage.removeItem('cms_login');
            document.getElementById('login-id').focus();
        }
    },

    _startSessionTimer() {
        if (this._sessionTimer) clearTimeout(this._sessionTimer);
        const loginTime = parseInt(sessionStorage.getItem('cms_login') || Date.now());
        const remaining = this.SESSION_DURATION - (Date.now() - loginTime);
        this._sessionTimer = setTimeout(() => this.doLogout(), Math.max(remaining, 0));
    },

    doLogout() {
        if (this._sessionTimer) clearTimeout(this._sessionTimer);
        sessionStorage.removeItem('cms_login');
        document.getElementById('login-screen').style.display = '';
        document.getElementById('login-id').value = '';
        document.getElementById('login-pw').value = '';
        document.getElementById('login-error').classList.add('hidden');
        document.getElementById('login-btn').innerHTML = '로그인';
        document.getElementById('login-btn').disabled = false;
        document.getElementById('login-id').focus();
    },

    init() {
        DB.init(); 
        this.injectCustomer360Panel(); 
        this.injectMonitoringModal();  
        this.injectProposalModal();
        const firstMenu = document.querySelector('[data-menu]');
        this.loadView('dashboard', firstMenu);
    },

    injectProposalModal() {
        const modalHtml = `
        <div id="proposal-modal-overlay" onclick="app.closeProposalModal()" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[120] hidden opacity-0 transition-opacity duration-300 flex items-center justify-center">
            <div id="proposal-modal-content" class="bg-white w-[650px] rounded-xl shadow-2xl overflow-hidden transform scale-95 transition-transform duration-300 flex flex-col" onclick="event.stopPropagation()">
                <div class="p-5 bg-teal-700 text-white flex justify-between items-center">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center border border-teal-500 shadow-sm">
                            <i class="fa-solid fa-paper-plane text-xl text-teal-100"></i>
                        </div>
                        <div>
                            <h3 class="text-lg font-bold tracking-tight">마케팅 및 영업 제안 발송</h3>
                            <p class="text-xs text-teal-100 mt-0.5">수집된 데이터를 기반으로 타겟 고객사에게 맞춤형 제안서를 전송합니다.</p>
                        </div>
                    </div>
                    <button onclick="app.closeProposalModal()" class="text-teal-200 hover:text-white transition"><i class="fa-solid fa-xmark text-xl"></i></button>
                </div>
                <div class="p-6 bg-slate-50 flex-1">
                    <div class="bg-white p-5 rounded-lg border border-slate-200 shadow-sm mb-5">
                        <div class="grid grid-cols-2 gap-4 mb-5">
                            <div>
                                <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">수신 고객사 (Target)</p>
                                <p class="text-[15px] font-bold text-slate-800" id="prop-company">기업명</p>
                            </div>
                            <div>
                                <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">제안 유형 (Type)</p>
                                <p class="text-[13px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded inline-block border border-blue-200" id="prop-type">유형</p>
                            </div>
                        </div>
                        <div>
                            <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">발송 채널 다중 선택</p>
                            <div class="flex space-x-5 bg-slate-50 p-3 rounded border border-slate-100">
                                <label class="flex items-center space-x-2 cursor-pointer"><input type="checkbox" checked class="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"><span class="text-sm font-bold text-slate-700"><i class="fa-regular fa-envelope text-slate-400 mr-1.5"></i>담당자 이메일</span></label>
                                <label class="flex items-center space-x-2 cursor-pointer"><input type="checkbox" checked class="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"><span class="text-sm font-bold text-slate-700"><i class="fa-solid fa-mobile-screen text-slate-400 mr-1.5"></i>대표번호 SMS</span></label>
                                <label class="flex items-center space-x-2 cursor-pointer"><input type="checkbox" class="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"><span class="text-sm font-bold text-slate-700"><i class="fa-brands fa-line text-yellow-500 mr-1.5"></i>카카오 알림톡</span></label>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <div class="flex justify-between items-end mb-2">
                            <p class="text-[12px] font-bold text-slate-600"><i class="fa-solid fa-robot text-teal-600 mr-1.5"></i>AI 제안 메시지 템플릿 (수정 가능)</p>
                            <button class="text-[10px] text-teal-600 font-bold hover:underline"><i class="fa-solid fa-arrows-rotate mr-1"></i>내용 자동 재생성</button>
                        </div>
                        <textarea id="prop-message" class="w-full h-36 p-4 border border-slate-300 rounded-lg text-[13px] leading-relaxed text-slate-700 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white resize-none shadow-inner"></textarea>
                    </div>
                </div>
                <div class="p-4 border-t border-slate-200 bg-white flex justify-end space-x-2">
                    <button onclick="app.closeProposalModal()" class="px-5 py-2.5 border border-slate-300 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition">취소</button>
                    <button id="prop-send-btn" onclick="app.sendProposal()" class="px-6 py-2.5 bg-teal-600 rounded-lg text-sm font-bold text-white hover:bg-teal-700 transition shadow-md flex items-center">
                        <i class="fa-solid fa-paper-plane mr-2"></i>고객사로 즉시 발송
                    </button>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    openProposalModal(company, type) {
        document.getElementById('prop-company').innerText = company;
        document.getElementById('prop-type').innerText = type;
        
        let msg = '';
        if (type.includes('대출') || type.includes('여신')) {
            msg = `[하나은행] ${company} 대표님,\n\n최근 귀사의 안정적인 매출 성장 및 우수한 결제 이력을 바탕으로, 하나은행에서 특별 '기업 우대 여신(대출) 한도'를 추가 산정하였습니다.\n\n다음 달 예정된 결제 자금 소요 등 필요하신 시기에 최저 금리로 자금을 활용하실 수 있도록 안내해 드립니다. 담당 영업점 지점장이 금일 중 유선으로 연락드리겠습니다.\n\n감사합니다.`;
        } else if (type.includes('예금') || type.includes('예적금')) {
            msg = `[하나은행] ${company} 재무담당자님,\n\n최근 타행 정기예금 만기 도래 일정이 확인되어, 당행에서 VIP 고객사를 위해 준비한 [특별 금리 우대 기업예금] 특판 상품을 선제적으로 제안 드립니다.\n\n현재 시장 금리 대비 최고 0.5%p 우대 혜택을 제공해 드릴 수 있으니, 첨부된 제안서를 확인해 보시기 바랍니다.`;
        } else if (type.includes('카드')) {
            msg = `[하나은행] ${company} 관리담당자님,\n\n당행의 기업 비용 분석 시스템(CRM) 결과, 귀사의 월간 주유 및 교통비 지출 비중이 높은 것으로 파악되었습니다.\n\n이에 하나은행 'Biz 주유 특화 법인카드'로 전환하실 경우, 연간 최소 350만 원 이상의 비용 절감이 예상되어 맞춤형 카드를 제안해 드립니다.`;
        } else {
            msg = `[하나은행] ${company} 담당자님,\n\n하나은행 통합CMS 관제센터입니다. 귀사의 안정적인 금융 업무를 위한 맞춤형 혜택을 안내해 드립니다.`;
        }
        
        document.getElementById('prop-message').value = msg;
        
        const overlay = document.getElementById('proposal-modal-overlay');
        const content = document.getElementById('proposal-modal-content');
        overlay.classList.remove('hidden');
        setTimeout(() => { overlay.classList.remove('opacity-0'); content.classList.remove('scale-95'); }, 10);
    },

    closeProposalModal() {
        const overlay = document.getElementById('proposal-modal-overlay');
        const content = document.getElementById('proposal-modal-content');
        overlay.classList.add('opacity-0');
        content.classList.add('scale-95');
        setTimeout(() => { overlay.classList.add('hidden'); }, 300);
    },

    sendProposal() {
        const btn = document.getElementById('prop-send-btn');
        const origText = btn.innerHTML;
        const company = document.getElementById('prop-company').innerText;
        const type = document.getElementById('prop-type').innerText;
        
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-2"></i>발송 처리 중...`;
        btn.classList.replace('bg-teal-600', 'bg-slate-500');
        btn.disabled = true;

        const now = new Date();
        const timeStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
        DB.addProposal({ id:'PRP-'+Date.now(), company, type, channels:['이메일','SMS'], status:'sent', statusLabel:'발송완료', sentAt:timeStr, rm:'RM'+Math.floor(Math.random()*900+100), amount:Math.floor(Math.random()*50+1)*100000000 });

        setTimeout(() => {
            btn.innerHTML = `<i class="fa-solid fa-check mr-2"></i>발송 완료!`;
            btn.classList.replace('bg-slate-500', 'bg-blue-600');
            
            setTimeout(() => {
                this.closeProposalModal();
                setTimeout(() => {
                    btn.innerHTML = origText;
                    btn.classList.replace('bg-blue-600', 'bg-teal-600');
                    btn.disabled = false;
                }, 300);
            }, 1500);
        }, 1200);
    },

    injectMonitoringModal() {
        const modalHtml = `
        <div id="monitoring-modal-overlay" onclick="app.closeMonitoringModal()" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] hidden opacity-0 transition-opacity duration-300 flex items-center justify-center">
            <div id="monitoring-modal-content" class="bg-white w-[500px] rounded-xl shadow-2xl overflow-hidden transform scale-95 transition-transform duration-300" onclick="event.stopPropagation()">
                <div class="p-5 bg-slate-800 text-white flex justify-between items-center">
                    <div class="flex items-center space-x-3">
                        <i class="fa-solid fa-server text-xl text-teal-400"></i>
                        <div>
                            <h3 class="text-lg font-bold" id="mon-modal-name">기업명</h3>
                            <p class="text-xs text-slate-400 font-mono mt-0.5" id="mon-modal-id">ID: AGT-0000</p>
                        </div>
                    </div>
                    <button onclick="app.closeMonitoringModal()" class="text-slate-400 hover:text-white transition"><i class="fa-solid fa-xmark text-xl"></i></button>
                </div>
                <div class="p-6">
                    <div class="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                        <div>
                            <p class="text-xs font-bold text-slate-500 mb-1">현재 통신 상태</p>
                            <div id="mon-modal-status"></div>
                        </div>
                        <div class="text-right">
                            <p class="text-xs font-bold text-slate-500 mb-1">관제 등급</p>
                            <div id="mon-modal-vip"></div>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4 mb-6">
                        <div class="bg-slate-50 p-3 rounded border border-slate-200 shadow-sm">
                            <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">IP Address</p>
                            <p class="text-sm font-mono font-bold text-slate-800" id="mon-modal-ip">192.168.0.1</p>
                        </div>
                        <div class="bg-slate-50 p-3 rounded border border-slate-200 shadow-sm">
                            <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">OS Environment</p>
                            <p class="text-sm font-bold text-slate-800" id="mon-modal-os">Windows 10</p>
                        </div>
                        <div class="bg-slate-50 p-3 rounded border border-slate-200 shadow-sm">
                            <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">Last Ping Time</p>
                            <p class="text-sm font-mono font-bold text-slate-800" id="mon-modal-lastping">14:20:00</p>
                        </div>
                        <div class="bg-slate-50 p-3 rounded border border-slate-200 shadow-sm">
                            <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">Elapsed Time</p>
                            <p class="text-sm font-bold text-slate-800" id="mon-modal-elapsed">1분 이내</p>
                        </div>
                    </div>
                    <div class="flex space-x-2 mt-2">
                        <button onclick="app.doAgentReboot()" id="mon-reboot-btn" class="flex-1 bg-slate-800 text-white py-2.5 rounded text-xs font-bold hover:bg-slate-700 shadow-sm transition"><i class="fa-solid fa-rotate-right mr-1.5"></i>Agent 재구동</button>
                        <button onclick="app.doPingTest()" id="mon-ping-btn" class="flex-1 border border-teal-500 bg-teal-50 text-teal-700 py-2.5 rounded text-xs font-bold hover:bg-teal-100 shadow-sm transition"><i class="fa-solid fa-network-wired mr-1.5"></i>Ping 테스트</button>
                    </div>
                    <div id="mon-action-result" class="mt-3 hidden"></div>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    doAgentReboot() {
        const btn = document.getElementById('mon-reboot-btn');
        const result = document.getElementById('mon-action-result');
        const orig = btn.innerHTML;
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-1.5"></i>재구동 처리 중...`;
        btn.disabled = true; btn.classList.add('opacity-60');
        result.className = 'mt-3 p-3 rounded border text-center bg-slate-50 border-slate-200';
        result.innerHTML = `<i class="fa-solid fa-spinner fa-spin text-slate-400 mr-1.5"></i><span class="text-xs font-bold text-slate-500">Watcher를 통해 Agent 재구동 명령 전송 중...</span>`;
        result.classList.remove('hidden');
        setTimeout(() => {
            const success = Math.random() > 0.2;
            if(success) {
                result.className = 'mt-3 p-3 rounded border text-center bg-teal-50 border-teal-200';
                result.innerHTML = `<i class="fa-solid fa-circle-check text-teal-600 mr-1.5"></i><span class="text-xs font-bold text-teal-700">Agent 재구동이 완료되었습니다.</span><p class="text-[10px] text-teal-600 mt-1">응답 시간: ${(Math.random()*2+0.5).toFixed(1)}초 | 상태: 정상 통신</p>`;
            } else {
                result.className = 'mt-3 p-3 rounded border text-center bg-red-50 border-red-200';
                result.innerHTML = `<i class="fa-solid fa-circle-xmark text-red-600 mr-1.5"></i><span class="text-xs font-bold text-red-700">Agent 재구동에 실패했습니다.</span><p class="text-[10px] text-red-600 mt-1">원인: 대상 PC 응답 없음 — 현장 점검이 필요합니다.</p>`;
            }
            btn.innerHTML = orig; btn.disabled = false; btn.classList.remove('opacity-60');
        }, 2000);
    },

    doPingTest() {
        const btn = document.getElementById('mon-ping-btn');
        const result = document.getElementById('mon-action-result');
        const ip = document.getElementById('mon-modal-ip').innerText;
        const orig = btn.innerHTML;
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-1.5"></i>테스트 중...`;
        btn.disabled = true; btn.classList.add('opacity-60');
        result.className = 'mt-3 p-3 rounded border text-center bg-slate-50 border-slate-200';
        result.innerHTML = `<i class="fa-solid fa-spinner fa-spin text-slate-400 mr-1.5"></i><span class="text-xs font-bold text-slate-500">잠시만 기다려주세요... Watcher → 스케줄 PC에서 Ping 테스트 진행 중 (${ip})</span>`;
        result.classList.remove('hidden');
        setTimeout(() => {
            const success = Math.random() > 0.3;
            const ms = Math.floor(Math.random()*50+5);
            if(success) {
                result.className = 'mt-3 p-3 rounded border text-center bg-teal-50 border-teal-200';
                result.innerHTML = `<i class="fa-solid fa-circle-check text-teal-600 mr-1.5"></i><span class="text-xs font-bold text-teal-700">Ping 정상입니다.</span><p class="text-[10px] text-teal-600 mt-1 font-mono">Reply from ${ip}: bytes=32 time=${ms}ms TTL=128 — 4패킷 전송, 4수신 (손실 0%)</p>`;
            } else {
                result.className = 'mt-3 p-3 rounded border text-center bg-red-50 border-red-200';
                result.innerHTML = `<i class="fa-solid fa-circle-xmark text-red-600 mr-1.5"></i><span class="text-xs font-bold text-red-700">Ping이 연결되지 않습니다.</span><p class="text-[10px] text-red-600 mt-1 font-mono">Request timed out. ${ip} — 4패킷 전송, 0수신 (손실 100%)</p>`;
            }
            btn.innerHTML = orig; btn.disabled = false; btn.classList.remove('opacity-60');
        }, 1800);
    },

    openMonitoringModal(companyName) {
        const hostData = DB.getHostByName(companyName) || DB.getHosts()[0];
        document.getElementById('mon-action-result').classList.add('hidden');
        document.getElementById('mon-action-result').innerHTML = '';
        
        document.getElementById('mon-modal-name').innerText = hostData.name;
        document.getElementById('mon-modal-id').innerText = "통합 ID: " + hostData.id;
        document.getElementById('mon-modal-ip').innerText = hostData.ip;
        document.getElementById('mon-modal-os').innerText = hostData.os;
        document.getElementById('mon-modal-lastping').innerText = hostData.lastPing;
        document.getElementById('mon-modal-elapsed').innerText = hostData.elapsed;

        let statusHtml = '';
        if (hostData.status === 'critical') statusHtml = `<span class="inline-flex items-center rounded-md bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 ring-1 ring-inset ring-red-600/20"><span class="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></span>연결 장애</span>`;
        else if (hostData.status === 'warning') statusHtml = `<span class="inline-flex items-center rounded-md bg-yellow-50 px-2.5 py-1 text-xs font-bold text-yellow-700 ring-1 ring-inset ring-yellow-600/20"><span class="w-1.5 h-1.5 rounded-full bg-yellow-400 mr-1.5"></span>수신 지연</span>`;
        else statusHtml = `<span class="inline-flex items-center rounded-md bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700 ring-1 ring-inset ring-teal-600/20"><span class="w-1.5 h-1.5 rounded-full bg-teal-500 mr-1.5"></span>정상 통신</span>`;
        document.getElementById('mon-modal-status').innerHTML = statusHtml;

        let vipHtml = hostData.isVip ? `<span class="bg-blue-600 text-white px-2.5 py-1 rounded text-xs font-bold shadow-sm">VIP 고객사</span>` : `<span class="bg-slate-100 border border-slate-200 text-slate-500 px-2.5 py-1 rounded text-xs font-bold">일반 고객사</span>`;
        document.getElementById('mon-modal-vip').innerHTML = vipHtml;

        const overlay = document.getElementById('monitoring-modal-overlay');
        const content = document.getElementById('monitoring-modal-content');
        overlay.classList.remove('hidden');
        setTimeout(() => { overlay.classList.remove('opacity-0'); content.classList.remove('scale-95'); }, 10);
    },

    closeMonitoringModal() {
        const overlay = document.getElementById('monitoring-modal-overlay');
        const content = document.getElementById('monitoring-modal-content');
        overlay.classList.add('opacity-0');
        content.classList.add('scale-95');
        setTimeout(() => { overlay.classList.add('hidden'); }, 300);
    },

    injectCustomer360Panel() {
        const panelHtml = `
        <div id="c360-overlay" onclick="app.closeCustomer360()" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[90] hidden opacity-0 transition-opacity duration-300"></div>
        <div id="customer-360-panel" class="fixed top-0 right-0 h-full w-[750px] bg-slate-50 shadow-2xl z-[100] transform translate-x-full transition-transform duration-300 ease-in-out flex flex-col border-l border-slate-200">
            <div class="p-6 bg-slate-900 text-white flex justify-between items-start shrink-0 relative overflow-hidden">
                <i class="fa-solid fa-chart-pie absolute right-[-20px] top-[-20px] text-9xl text-white opacity-5"></i>
                <div class="relative z-10 w-full">
                    <div class="flex justify-between items-center mb-2">
                        <div class="text-[10px] text-teal-400 font-bold uppercase tracking-widest px-2 py-0.5 border border-teal-400/30 bg-teal-400/10 rounded inline-block" id="c360-context-badge"><i class="fa-solid fa-microscope mr-1"></i>Customer 360 심층 분석</div>
                        <button onclick="app.closeCustomer360()" class="text-slate-400 hover:text-white transition"><i class="fa-solid fa-xmark text-xl"></i></button>
                    </div>
                    <div class="flex items-end space-x-4 mt-2">
                        <h2 class="text-2xl font-bold tracking-tight" id="c360-name">기업명</h2>
                        <span class="text-sm text-slate-300 font-mono mb-1" id="c360-id">ID: AGT-0000</span>
                        <span class="bg-blue-600 text-white px-2 py-0.5 rounded text-[10px] font-bold mb-1 hidden" id="c360-vip-badge">VIP 고객사</span>
                    </div>
                </div>
            </div>
            <div class="flex-1 overflow-y-auto p-6 space-y-5" id="c360-body"></div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', panelHtml);
    },

    openCustomer360(companyName, context) {
        context = context || this._currentContext || 'general';
        document.getElementById('c360-name').innerText = companyName;
        const hostData = DB.getHostByName(companyName) || { id: "AGT-" + (Math.floor(Math.random()*8999)+1000), isVip: Math.random() > 0.5 };
        document.getElementById('c360-id').innerText = "통합 ID: " + hostData.id;
        const vipBadge = document.getElementById('c360-vip-badge');
        if(hostData.isVip) { vipBadge.classList.remove('hidden'); } else { vipBadge.classList.add('hidden'); }

        const contextLabels = {
            general: '<i class="fa-solid fa-microscope mr-1"></i>Customer 360 종합 분석',
            asset: '<i class="fa-solid fa-coins mr-1"></i>예적금/자산 심층 분석',
            deposit: '<i class="fa-solid fa-piggy-bank mr-1"></i>예적금 보유/만기 분석',
            b2b: '<i class="fa-solid fa-file-invoice-dollar mr-1"></i>B2B/전자어음 분석',
            card: '<i class="fa-regular fa-credit-card mr-1"></i>법인카드 사용 분석',
            tax: '<i class="fa-solid fa-receipt mr-1"></i>세금계산서 매출/매입 분석',
            cashflow: '<i class="fa-solid fa-money-bill-transfer mr-1"></i>자금흐름 분석',
            monitoring: '<i class="fa-solid fa-server mr-1"></i>CMS 인프라 모니터링'
        };
        document.getElementById('c360-context-badge').innerHTML = contextLabels[context] || contextLabels.general;

        this.c360Charts.forEach(c => c.destroy()); this.c360Charts = [];
        document.getElementById('c360-body').innerHTML = this._buildC360Body(companyName, context, hostData);
        setTimeout(() => this._initC360Charts(companyName, context), 50);

        const overlay = document.getElementById('c360-overlay');
        const panel = document.getElementById('customer-360-panel');
        overlay.classList.remove('hidden');
        setTimeout(() => { overlay.classList.remove('opacity-0'); panel.classList.remove('translate-x-full'); }, 10);
    },

    _buildC360Body(name, ctx, host) {
        // AI 추천 - context별 맞춤
        const aiBlock = this._getAiRecommendation(name, ctx);
        let html = `<div class="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-5 text-white shadow-md relative overflow-hidden border border-slate-600"><div class="flex items-center mb-3"><i class="fa-solid fa-wand-magic-sparkles text-teal-400 mr-2 text-lg"></i><span class="font-bold text-[14px]">AI 기반 맞춤 추천 액션</span></div><p class="text-[13px] leading-relaxed text-slate-200">${aiBlock.txt}</p><div class="mt-4 flex space-x-2">${aiBlock.btns}</div></div>`;

        if (ctx === 'asset' || ctx === 'deposit') {
            // 예적금/자산 분석
            const assets = DB.getAssets().filter(a => a.name.includes(name.split(' ')[0]) || a.name === name);
            html += `<div class="grid grid-cols-2 gap-5">
                <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm"><h3 class="font-bold text-slate-800 text-[13px] mb-1">보유 자산 은행별 분포</h3><p class="text-[10px] text-slate-400 mb-4">수집된 예적금 기준</p><div class="h-[220px]"><canvas id="c360-chart1"></canvas></div></div>
                <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm"><h3 class="font-bold text-slate-800 text-[13px] mb-1">만기 일정별 금액 분포</h3><p class="text-[10px] text-slate-400 mb-4">D-Day 구간별 합산</p><div class="h-[220px]"><canvas id="c360-chart2"></canvas></div></div></div>`;
            html += `<div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"><div class="p-4 bg-slate-50 border-b border-slate-200"><h3 class="font-bold text-slate-800 text-[13px]">보유 예적금 상세 목록 (${assets.length}건)</h3></div><div class="max-h-[250px] overflow-y-auto"><table class="w-full text-left"><thead class="bg-white text-[11px] text-slate-400 border-b"><tr><th class="px-4 py-2 font-bold">금융기관</th><th class="px-4 py-2 font-bold">상품</th><th class="px-4 py-2 font-bold text-right">보유액</th><th class="px-4 py-2 font-bold text-center">만기 D-Day</th></tr></thead><tbody class="text-[12px] text-slate-700 divide-y divide-slate-50">${assets.length ? assets.map(a=>`<tr class="hover:bg-slate-50"><td class="px-4 py-2.5">${a.bank}</td><td class="px-4 py-2.5">${a.product}</td><td class="px-4 py-2.5 text-right font-mono font-bold">${a.amount.toLocaleString()}</td><td class="px-4 py-2.5 text-center"><span class="${a.dday<=30?'text-red-600 font-bold':'text-slate-500'}">D-${a.dday}</span></td></tr>`).join('') : `<tr><td colspan="4" class="px-4 py-6 text-center text-slate-400">해당 고객사의 예적금 데이터가 없습니다.</td></tr>`}</tbody></table></div></div>`;
        } else if (ctx === 'b2b') {
            const b2bData = DB.getB2B().filter(b => b.name.includes(name.split(' ')[0]) || b.name === name);
            html += `<div class="grid grid-cols-2 gap-5">
                <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm"><h3 class="font-bold text-slate-800 text-[13px] mb-4">어음/B2B 만기 분포</h3><div class="h-[220px]"><canvas id="c360-chart1"></canvas></div></div>
                <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm"><h3 class="font-bold text-slate-800 text-[13px] mb-4">거래 유형별 금액</h3><div class="h-[220px]"><canvas id="c360-chart2"></canvas></div></div></div>`;
            html += `<div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"><div class="p-4 bg-slate-50 border-b border-slate-200"><h3 class="font-bold text-slate-800 text-[13px]">B2B/전자어음 거래 내역 (${b2bData.length}건)</h3></div><div class="max-h-[250px] overflow-y-auto"><table class="w-full text-left"><thead class="bg-white text-[11px] text-slate-400 border-b"><tr><th class="px-4 py-2 font-bold">유형</th><th class="px-4 py-2 font-bold">금융기관</th><th class="px-4 py-2 font-bold text-right">금액</th><th class="px-4 py-2 font-bold text-center">만기</th></tr></thead><tbody class="text-[12px] text-slate-700 divide-y divide-slate-50">${b2bData.length ? b2bData.map(b=>`<tr class="hover:bg-slate-50"><td class="px-4 py-2.5"><span class="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold">${b.type}</span></td><td class="px-4 py-2.5">${b.bank}</td><td class="px-4 py-2.5 text-right font-mono font-bold">${b.amount.toLocaleString()}</td><td class="px-4 py-2.5 text-center ${b.dday<=30?'text-red-600 font-bold':'text-slate-500'}">D-${b.dday}</td></tr>`).join('') : `<tr><td colspan="4" class="px-4 py-6 text-center text-slate-400">B2B 거래 데이터 없음</td></tr>`}</tbody></table></div></div>`;
        } else if (ctx === 'card') {
            const cardData = DB.getCards().filter(c => c.name.includes(name.split(' ')[0]) || c.name === name);
            html += `<div class="grid grid-cols-2 gap-5">
                <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm"><h3 class="font-bold text-slate-800 text-[13px] mb-4">업종별 결제 비중</h3><div class="h-[220px]"><canvas id="c360-chart1"></canvas></div></div>
                <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm"><h3 class="font-bold text-slate-800 text-[13px] mb-4">월별 결제 추이</h3><div class="h-[220px]"><canvas id="c360-chart2"></canvas></div></div></div>`;
            html += `<div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"><div class="p-4 bg-slate-50 border-b border-slate-200"><h3 class="font-bold text-slate-800 text-[13px]">타행 카드 결제 내역 (${cardData.length}건)</h3></div><div class="max-h-[250px] overflow-y-auto"><table class="w-full text-left"><thead class="bg-white text-[11px] text-slate-400 border-b"><tr><th class="px-4 py-2 font-bold">카드사</th><th class="px-4 py-2 font-bold">결제 업종</th><th class="px-4 py-2 font-bold text-right">월평균 결제액</th></tr></thead><tbody class="text-[12px] text-slate-700 divide-y divide-slate-50">${cardData.length ? cardData.map(c=>`<tr class="hover:bg-slate-50"><td class="px-4 py-2.5"><span class="bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold">${c.bank}</span></td><td class="px-4 py-2.5 font-bold">${c.category}</td><td class="px-4 py-2.5 text-right font-mono font-bold">${c.amount.toLocaleString()}</td></tr>`).join('') : `<tr><td colspan="3" class="px-4 py-6 text-center text-slate-400">카드 데이터 없음</td></tr>`}</tbody></table></div></div>`;
        } else if (ctx === 'tax') {
            const taxData = DB.getTax().filter(t => t.partner.includes(name.split(' ')[0]) || t.partner === name);
            const sales = taxData.filter(t=>t.type==='매출'); const purchase = taxData.filter(t=>t.type==='매입');
            html += `<div class="grid grid-cols-3 gap-4 mb-1">
                <div class="bg-blue-50 border border-blue-200 p-4 rounded shadow-sm text-center"><p class="text-[10px] font-bold text-blue-700 mb-1">매출 건수</p><h4 class="text-xl font-black text-blue-800">${sales.length}<span class="text-sm ml-0.5">건</span></h4></div>
                <div class="bg-red-50 border border-red-200 p-4 rounded shadow-sm text-center"><p class="text-[10px] font-bold text-red-700 mb-1">매입 건수</p><h4 class="text-xl font-black text-red-800">${purchase.length}<span class="text-sm ml-0.5">건</span></h4></div>
                <div class="bg-teal-50 border border-teal-200 p-4 rounded shadow-sm text-center"><p class="text-[10px] font-bold text-teal-700 mb-1">순매출</p><h4 class="text-xl font-black text-teal-800 font-mono">${Math.round((sales.reduce((s,t)=>s+t.amount,0)-purchase.reduce((s,t)=>s+t.amount,0))/1000000).toLocaleString()}<span class="text-sm ml-0.5">백만</span></h4></div></div>`;
            html += `<div class="grid grid-cols-2 gap-5">
                <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm"><h3 class="font-bold text-slate-800 text-[13px] mb-4">매출/매입 비교</h3><div class="h-[220px]"><canvas id="c360-chart1"></canvas></div></div>
                <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm"><h3 class="font-bold text-slate-800 text-[13px] mb-4">품목별 거래 분포</h3><div class="h-[220px]"><canvas id="c360-chart2"></canvas></div></div></div>`;
            html += `<div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"><div class="p-4 bg-slate-50 border-b border-slate-200"><h3 class="font-bold text-slate-800 text-[13px]">세금계산서 거래 내역 (${taxData.length}건)</h3></div><div class="max-h-[200px] overflow-y-auto"><table class="w-full text-left"><thead class="bg-white text-[11px] text-slate-400 border-b"><tr><th class="px-4 py-2 font-bold">구분</th><th class="px-4 py-2 font-bold">품목</th><th class="px-4 py-2 font-bold text-right">금액</th><th class="px-4 py-2 font-bold text-center">평가</th></tr></thead><tbody class="text-[12px] text-slate-700 divide-y divide-slate-50">${taxData.length ? taxData.slice(0,10).map(t=>`<tr class="hover:bg-slate-50"><td class="px-4 py-2.5"><span class="${t.type==='매출'?'text-blue-700 bg-blue-50':'text-red-600 bg-red-50'} px-2 py-0.5 rounded text-[10px] font-bold">${t.type}</span></td><td class="px-4 py-2.5">${t.item}</td><td class="px-4 py-2.5 text-right font-mono font-bold">${t.amount.toLocaleString()}</td><td class="px-4 py-2.5 text-center text-[10px] font-bold ${t.status==='우량'?'text-teal-600':'text-slate-400'}">${t.status}</td></tr>`).join('') : `<tr><td colspan="4" class="px-4 py-6 text-center text-slate-400">세금계산서 데이터 없음</td></tr>`}</tbody></table></div></div>`;
        } else if (ctx === 'cashflow') {
            const flows = DB.getCashFlow(name);
            const hasCF = flows.length > 0;
            html += `<div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm"><h3 class="font-bold text-slate-800 text-[13px] mb-4">30일간 자금흐름 추이</h3><div class="h-[250px]"><canvas id="c360-chart1"></canvas></div></div>`;
            if (hasCF) {
                const total = flows.reduce((s,f)=>({ inflow:s.inflow+f.inflow, outflow:s.outflow+f.outflow }), {inflow:0,outflow:0});
                html += `<div class="grid grid-cols-3 gap-4">
                    <div class="bg-blue-50 border border-blue-200 p-4 rounded shadow-sm text-center"><p class="text-[10px] font-bold text-blue-700 mb-1">30일 총 입금</p><h4 class="text-xl font-black text-blue-800 font-mono">${Math.round(total.inflow/100000000).toLocaleString()}<span class="text-sm ml-0.5">억</span></h4></div>
                    <div class="bg-red-50 border border-red-200 p-4 rounded shadow-sm text-center"><p class="text-[10px] font-bold text-red-700 mb-1">30일 총 출금</p><h4 class="text-xl font-black text-red-800 font-mono">${Math.round(total.outflow/100000000).toLocaleString()}<span class="text-sm ml-0.5">억</span></h4></div>
                    <div class="bg-teal-50 border border-teal-200 p-4 rounded shadow-sm text-center"><p class="text-[10px] font-bold text-teal-700 mb-1">순 흐름</p><h4 class="text-xl font-black text-teal-800 font-mono">${Math.round((total.inflow-total.outflow)/100000000).toLocaleString()}<span class="text-sm ml-0.5">억</span></h4></div></div>`;
            }
        } else if (ctx === 'monitoring') {
            // 모니터링 전용 (기존 히트맵)
            let heatmapHtml = ''; let errorDays = 0;
            for(let i=0;i<60;i++){const r=Math.random();let c='bg-teal-400';if(r<0.03){c='bg-red-500';errorDays++;}else if(r<0.1)c='bg-yellow-400';heatmapHtml+=`<div class="w-[15px] h-[15px] ${c} rounded-[2px] opacity-80 hover:opacity-100 cursor-pointer shadow-sm" title="D-${60-i}일"></div>`;}
            html += `<div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div class="flex justify-between items-center mb-3"><h3 class="font-bold text-slate-800 text-[13px]">최근 60일 Agent 가동 이력</h3><div class="text-[10px] text-slate-500 font-bold space-x-2 flex"><span class="flex items-center"><span class="w-2.5 h-2.5 bg-red-500 rounded-sm mr-1"></span>장애</span><span class="flex items-center"><span class="w-2.5 h-2.5 bg-yellow-400 rounded-sm mr-1"></span>주의</span><span class="flex items-center"><span class="w-2.5 h-2.5 bg-teal-400 rounded-sm mr-1"></span>정상</span></div></div>
                <div class="flex flex-wrap gap-1">${heatmapHtml}</div>
                <p class="text-[11px] text-slate-500 mt-3 pt-3 border-t border-slate-100"><i class="fa-solid fa-server mr-1 text-slate-400"></i>가동률: <span class="font-bold text-teal-600">${((60-errorDays)/60*100).toFixed(1)}%</span></p></div>`;
            html += `<div class="grid grid-cols-2 gap-5"><div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm"><h3 class="font-bold text-slate-800 text-[13px] mb-4">인프라 상태 레이더</h3><div class="h-[220px]"><canvas id="c360-chart1"></canvas></div></div><div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm"><h3 class="font-bold text-slate-800 text-[13px] mb-4">최근 6개월 장애 추이</h3><div class="h-[220px]"><canvas id="c360-chart2"></canvas></div></div></div>`;
        } else {
            // general - 종합 (기존 스타일 유지)
            html += `<div class="grid grid-cols-2 gap-5">
                <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm"><h3 class="font-bold text-slate-800 text-[13px] mb-1">통합 금융/거래 밸런스</h3><p class="text-[10px] text-slate-400 mb-4">당행 및 타행 수집 데이터 종합 스코어</p><div class="h-[220px]"><canvas id="c360-chart1"></canvas></div></div>
                <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm"><h3 class="font-bold text-slate-800 text-[13px] mb-1">수집된 자금 흐름 (매출/매입)</h3><p class="text-[10px] text-slate-400 mb-4">세금계산서 및 어음 기반 추정</p><div class="h-[220px]"><canvas id="c360-chart2"></canvas></div></div></div>`;
            let hmHtml=''; let ed=0; for(let i=0;i<60;i++){const r=Math.random();let c='bg-teal-400';if(r<0.03){c='bg-red-500';ed++;}else if(r<0.1)c='bg-yellow-400';hmHtml+=`<div class="w-[15px] h-[15px] ${c} rounded-[2px] opacity-80 hover:opacity-100 shadow-sm" title="D-${60-i}"></div>`;}
            html += `<div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm"><div class="flex justify-between items-center mb-3"><h3 class="font-bold text-slate-800 text-[13px]">60일 Agent 가동 이력</h3></div><div class="flex flex-wrap gap-1">${hmHtml}</div><p class="text-[11px] text-slate-500 mt-3 pt-3 border-t border-slate-100">가동률: <span class="font-bold text-teal-600">${((60-ed)/60*100).toFixed(1)}%</span></p></div>`;
            const tableRows = [`<tr class="hover:bg-slate-50"><td class="px-4 py-2.5 font-bold"><span class="bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 text-[10px]">전자어음</span></td><td class="px-4 py-2.5 text-slate-600">A은행 발행 (만기 D-10)</td><td class="px-4 py-2.5 text-right font-mono font-bold">500,000,000</td><td class="px-4 py-2.5 text-center"><span class="text-[10px] text-red-500 font-bold">대출 타겟</span></td></tr>`,`<tr class="hover:bg-slate-50"><td class="px-4 py-2.5 font-bold"><span class="bg-teal-50 text-teal-700 px-2 py-0.5 rounded border border-teal-200 text-[10px]">세금계산서</span></td><td class="px-4 py-2.5 text-slate-600">매출 발생</td><td class="px-4 py-2.5 text-right font-mono font-bold">125,000,000</td><td class="px-4 py-2.5 text-center"><span class="text-[10px] text-slate-400 font-bold">수집 완료</span></td></tr>`,`<tr class="hover:bg-slate-50"><td class="px-4 py-2.5 font-bold"><span class="bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200 text-[10px]">법인카드</span></td><td class="px-4 py-2.5 text-slate-600">주유비 결제</td><td class="px-4 py-2.5 text-right font-mono font-bold">8,500,000</td><td class="px-4 py-2.5 text-center"><span class="text-[10px] text-slate-400 font-bold">수집 완료</span></td></tr>`];
            html += `<div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"><div class="p-4 bg-slate-50 border-b border-slate-200"><h3 class="font-bold text-slate-800 text-[13px]">최근 수집된 핵심 마케팅 데이터</h3></div><table class="w-full text-left"><thead class="bg-white text-[11px] text-slate-400 border-b border-slate-100"><tr><th class="px-4 py-2 font-bold">유형</th><th class="px-4 py-2 font-bold">상세</th><th class="px-4 py-2 font-bold text-right">금액</th><th class="px-4 py-2 font-bold text-center">상태</th></tr></thead><tbody class="text-[12px] text-slate-700 divide-y divide-slate-50">${tableRows.sort(()=>Math.random()-0.5).join('')}</tbody></table></div>`;
        }
        return html;
    },

    _getAiRecommendation(name, ctx) {
        const recs = {
            asset: { txt:`<strong>${name}</strong>의 타행 보유 예적금 만기가 임박해 있습니다. 이탈 방지를 위해 <strong>[특별 금리 우대 예금]</strong> 제안이 시급합니다. 당행 유치 시 예상 점유율 상승 효과가 있습니다.`, btns:`<button onclick="app.openProposalModal('${name}','고금리 예적금 유치 제안')" class="bg-teal-500 text-white px-3 py-1.5 rounded text-[11px] font-bold shadow-sm hover:bg-teal-400"><i class="fa-solid fa-paper-plane mr-1"></i>유치 제안 발송</button>` },
            deposit: { txt:`<strong>${name}</strong>의 복수 금융기관 예적금 보유 현황을 분석한 결과, 타행 대비 당행 금리 경쟁력이 있는 구간이 확인됩니다. <strong>[맞춤형 금리 패키지]</strong>를 통해 당행 점유율을 높일 수 있습니다.`, btns:`<button onclick="app.openProposalModal('${name}','맞춤형 예금 금리 패키지 제안')" class="bg-teal-500 text-white px-3 py-1.5 rounded text-[11px] font-bold shadow-sm hover:bg-teal-400"><i class="fa-solid fa-paper-plane mr-1"></i>금리 패키지 제안</button>` },
            b2b: { txt:`<strong>${name}</strong>의 B2B/전자어음 만기 분석 결과, 결제성 자금 수요가 예측됩니다. <strong>[기업 단기 운전자금 대출]</strong> 선제적 제안으로 여신 거래 확대 기회입니다.`, btns:`<button onclick="app.openProposalModal('${name}','기업 운전자금 대출 제안')" class="bg-blue-500 text-white px-3 py-1.5 rounded text-[11px] font-bold shadow-sm hover:bg-blue-400"><i class="fa-solid fa-paper-plane mr-1"></i>대출 제안 발송</button>` },
            card: { txt:`<strong>${name}</strong>의 타행 법인카드 결제 패턴 분석 결과, <strong>주유/교통비 지출 비중이 높습니다</strong>. 당행 <strong>[주유 특화 비즈니스 카드]</strong> 전환 시 연간 약 8% 비용 절감이 가능합니다.`, btns:`<button onclick="app.openProposalModal('${name}','주유 특화 법인카드 제안')" class="bg-purple-500 text-white px-3 py-1.5 rounded text-[11px] font-bold shadow-sm hover:bg-purple-400"><i class="fa-regular fa-credit-card mr-1"></i>카드 전환 제안</button>` },
            tax: { txt:`<strong>${name}</strong>의 세금계산서 분석 결과, 매출 규모 대비 여신 한도가 낮은 것으로 보입니다. <strong>[매출 우량 기업 여신 한도 상향]</strong>을 통해 거래 확대가 가능합니다.`, btns:`<button onclick="app.openProposalModal('${name}','여신 한도 상향 제안')" class="bg-teal-500 text-white px-3 py-1.5 rounded text-[11px] font-bold shadow-sm hover:bg-teal-400"><i class="fa-solid fa-paper-plane mr-1"></i>여신 상향 제안</button>` },
            cashflow: { txt:`<strong>${name}</strong>의 30일 자금흐름 패턴 분석 결과, 주기적 자금 부족 구간이 감지됩니다. <strong>[마이너스 통장 또는 단기 대출]</strong>을 사전에 제안하면 고객 만족도를 높일 수 있습니다.`, btns:`<button onclick="app.openProposalModal('${name}','자금흐름 맞춤 여신 제안')" class="bg-blue-500 text-white px-3 py-1.5 rounded text-[11px] font-bold shadow-sm hover:bg-blue-400"><i class="fa-solid fa-paper-plane mr-1"></i>맞춤 여신 제안</button>` },
            monitoring: { txt:`<strong>${name}</strong>의 CMS Agent 가동 현황을 분석했습니다. 최근 장애 발생 빈도와 복구 패턴을 기반으로 <strong>인프라 안정화 조치</strong>를 권장합니다.`, btns:`<button class="bg-slate-600 text-white px-3 py-1.5 rounded text-[11px] font-bold shadow-sm hover:bg-slate-500"><i class="fa-solid fa-wrench mr-1"></i>원격 점검 요청</button>` },
        };
        return recs[ctx] || { txt:`<strong>${name}</strong>의 종합 금융 데이터를 분석한 결과, 타행 예적금 만기 도래 및 B2B 결제성 자금 수요가 동시에 확인됩니다. <strong>복합 금융 패키지</strong> 제안이 효과적입니다.`, btns:`<button onclick="app.openProposalModal('${name}','종합 금융 패키지 제안')" class="bg-teal-500 text-white px-3 py-1.5 rounded text-[11px] font-bold shadow-sm hover:bg-teal-400"><i class="fa-solid fa-paper-plane mr-1"></i>종합 제안 발송</button>` };
    },

    _initC360Charts(name, ctx) {
        const r = () => Math.floor(Math.random()*60)+30;
        if (ctx === 'asset' || ctx === 'deposit') {
            const c1 = new Chart(document.getElementById('c360-chart1').getContext('2d'), { type:'doughnut', data:{ labels:['당행(하나)','A은행(국민)','B은행(신한)','C은행(기업)'], datasets:[{ data:[r(),r(),r(),r()], backgroundColor:['#0d9488','#3b82f6','#f59e0b','#94a3b8'], borderWidth:2, borderColor:'#fff' }] }, options:{ responsive:true, maintainAspectRatio:false, cutout:'60%', plugins:{ legend:{position:'bottom',labels:{boxWidth:8,font:{size:9}}} } } });
            const c2 = new Chart(document.getElementById('c360-chart2').getContext('2d'), { type:'bar', data:{ labels:['D-15 이내','D-30 이내','D-60 이내','D-90 이내'], datasets:[{ data:[r(),r(),r(),r()], backgroundColor:['#ef4444','#f59e0b','#3b82f6','#94a3b8'], borderRadius:4 }] }, options:{ responsive:true, maintainAspectRatio:false, scales:{ y:{beginAtZero:true,grid:{borderDash:[2,2],color:'#f1f5f9'},border:{display:false}}, x:{grid:{display:false},border:{display:false}} }, plugins:{legend:{display:false}} } });
            this.c360Charts.push(c1, c2);
        } else if (ctx === 'b2b') {
            const c1 = new Chart(document.getElementById('c360-chart1').getContext('2d'), { type:'bar', data:{ labels:['D-15','D-30','D-60','D-90'], datasets:[{label:'만기금액',data:[r()*10,r()*10,r()*10,r()*10],backgroundColor:['#ef4444','#f59e0b','#3b82f6','#94a3b8'],borderRadius:4}] }, options:{ responsive:true, maintainAspectRatio:false, scales:{y:{beginAtZero:true,grid:{borderDash:[2,2],color:'#f1f5f9'},border:{display:false}},x:{grid:{display:false},border:{display:false}}}, plugins:{legend:{display:false}} } });
            const c2 = new Chart(document.getElementById('c360-chart2').getContext('2d'), { type:'doughnut', data:{ labels:['전자어음','B2B매출','B2B매입'], datasets:[{data:[r(),r(),r()],backgroundColor:['#0d9488','#3b82f6','#f43f5e'],borderWidth:2,borderColor:'#fff'}] }, options:{ responsive:true, maintainAspectRatio:false, cutout:'60%', plugins:{legend:{position:'bottom',labels:{boxWidth:8,font:{size:9}}}} } });
            this.c360Charts.push(c1, c2);
        } else if (ctx === 'card') {
            const c1 = new Chart(document.getElementById('c360-chart1').getContext('2d'), { type:'doughnut', data:{ labels:['주유/교통','항공/숙박','식대/접대','공과금/기타'], datasets:[{data:[40,30,18,12],backgroundColor:['#0d9488','#3b82f6','#94a3b8','#cbd5e1'],borderWidth:2,borderColor:'#fff'}] }, options:{ responsive:true, maintainAspectRatio:false, cutout:'60%', plugins:{legend:{position:'bottom',labels:{boxWidth:8,font:{size:9}}}} } });
            const c2 = new Chart(document.getElementById('c360-chart2').getContext('2d'), { type:'line', data:{ labels:['10월','11월','12월','1월','2월','3월'], datasets:[{label:'결제액',data:[r()*5,r()*5,r()*5,r()*5,r()*5,r()*5],borderColor:'#0d9488',backgroundColor:'rgba(13,148,136,0.1)',fill:true,borderWidth:2,tension:0.3}] }, options:{ responsive:true, maintainAspectRatio:false, scales:{y:{beginAtZero:true,grid:{borderDash:[2,2],color:'#f1f5f9'},border:{display:false},ticks:{font:{size:9}}},x:{grid:{display:false},border:{display:false}}}, plugins:{legend:{display:false}} } });
            this.c360Charts.push(c1, c2);
        } else if (ctx === 'tax') {
            const c1 = new Chart(document.getElementById('c360-chart1').getContext('2d'), { type:'bar', data:{ labels:['10월','11월','12월','1월','2월','3월'], datasets:[{label:'매출',data:[r()*10,r()*10,r()*10,r()*10,r()*10,r()*10],backgroundColor:'#0ea5e9',borderRadius:2},{label:'매입',data:[r()*8,r()*8,r()*8,r()*8,r()*8,r()*8],backgroundColor:'#f43f5e',borderRadius:2}] }, options:{ responsive:true, maintainAspectRatio:false, scales:{y:{beginAtZero:true,grid:{borderDash:[2,2],color:'#f1f5f9'},border:{display:false}},x:{grid:{display:false},border:{display:false}}}, plugins:{legend:{position:'bottom',labels:{boxWidth:8,font:{size:9}}}} } });
            const items = DB.getTax().filter(t=>t.partner.includes(name.split(' ')[0]));
            const itemCounts = {}; items.forEach(t=>{itemCounts[t.item]=(itemCounts[t.item]||0)+1;});
            const topItems = Object.entries(itemCounts).sort((a,b)=>b[1]-a[1]).slice(0,5);
            const c2 = new Chart(document.getElementById('c360-chart2').getContext('2d'), { type:'doughnut', data:{ labels:topItems.length?topItems.map(i=>i[0]):['데이터 없음'], datasets:[{data:topItems.length?topItems.map(i=>i[1]):[1],backgroundColor:['#0d9488','#3b82f6','#f59e0b','#94a3b8','#cbd5e1'],borderWidth:2,borderColor:'#fff'}] }, options:{ responsive:true, maintainAspectRatio:false, cutout:'60%', plugins:{legend:{position:'bottom',labels:{boxWidth:8,font:{size:9}}}} } });
            this.c360Charts.push(c1, c2);
        } else if (ctx === 'cashflow') {
            const flows = DB.getCashFlow(name);
            if (flows.length && document.getElementById('c360-chart1')) {
                const c1 = new Chart(document.getElementById('c360-chart1').getContext('2d'), { type:'bar', data:{ labels:flows.map(f=>f.date), datasets:[{label:'입금',data:flows.map(f=>Math.round(f.inflow/1000000)),backgroundColor:'rgba(59,130,246,0.7)',borderRadius:2,barThickness:6},{label:'출금',data:flows.map(f=>-Math.round(f.outflow/1000000)),backgroundColor:'rgba(239,68,68,0.5)',borderRadius:2,barThickness:6},{label:'순흐름',data:flows.map(f=>Math.round(f.net/1000000)),type:'line',borderColor:'#0d9488',backgroundColor:'transparent',borderWidth:2,tension:0.3,pointRadius:0}] }, options:{ responsive:true, maintainAspectRatio:false, scales:{y:{grid:{borderDash:[2,2],color:'#f1f5f9'},border:{display:false},ticks:{font:{size:8}}},x:{grid:{display:false},border:{display:false},ticks:{maxRotation:0,font:{size:7},maxTicksLimit:10}}}, plugins:{legend:{position:'bottom',labels:{boxWidth:8,font:{size:9}}}} } });
                this.c360Charts.push(c1);
            }
        } else if (ctx === 'monitoring') {
            const c1 = new Chart(document.getElementById('c360-chart1').getContext('2d'), { type:'radar', data:{ labels:['CPU 사용률','메모리','디스크','네트워크','응답시간'], datasets:[{data:[r(),r(),r(),r(),r()],backgroundColor:'rgba(20,184,166,0.2)',borderColor:'#14b8a6',pointBackgroundColor:'#14b8a6',borderWidth:2}] }, options:{ responsive:true, maintainAspectRatio:false, scales:{r:{angleLines:{color:'#e2e8f0'},grid:{color:'#e2e8f0'},pointLabels:{font:{size:10,weight:'bold'},color:'#64748b'},ticks:{display:false,max:100}}}, plugins:{legend:{display:false}} } });
            const c2 = new Chart(document.getElementById('c360-chart2').getContext('2d'), { type:'line', data:{ labels:['10월','11월','12월','1월','2월','3월'], datasets:[{label:'장애건수',data:[Math.floor(Math.random()*3),Math.floor(Math.random()*3),Math.floor(Math.random()*5),Math.floor(Math.random()*2),Math.floor(Math.random()*4),Math.floor(Math.random()*3)],borderColor:'#ef4444',backgroundColor:'rgba(239,68,68,0.1)',fill:true,borderWidth:2,tension:0.3}] }, options:{ responsive:true, maintainAspectRatio:false, scales:{y:{beginAtZero:true,grid:{borderDash:[2,2],color:'#f1f5f9'},border:{display:false}},x:{grid:{display:false},border:{display:false}}}, plugins:{legend:{display:false}} } });
            this.c360Charts.push(c1, c2);
        } else {
            // general
            const c1 = new Chart(document.getElementById('c360-chart1').getContext('2d'), { type:'radar', data:{ labels:['타행자산','여신필요도','카드결제','어음/B2B','당행기여도'], datasets:[{data:[r(),r(),r(),r(),r()],backgroundColor:'rgba(20,184,166,0.2)',borderColor:'#14b8a6',pointBackgroundColor:'#14b8a6',borderWidth:2}] }, options:{ responsive:true, maintainAspectRatio:false, scales:{r:{angleLines:{color:'#e2e8f0'},grid:{color:'#e2e8f0'},pointLabels:{font:{size:10,weight:'bold'},color:'#64748b'},ticks:{display:false,max:100}}}, plugins:{legend:{display:false}} } });
            const c2 = new Chart(document.getElementById('c360-chart2').getContext('2d'), { type:'bar', data:{ labels:['10월','11월','12월','1월','2월','당월'], datasets:[{label:'매출액',data:[120,150,180,130,200,250],backgroundColor:'#0ea5e9',borderRadius:2},{label:'지출액',data:[90,110,100,120,150,140],backgroundColor:'#f43f5e',borderRadius:2}] }, options:{ responsive:true, maintainAspectRatio:false, scales:{y:{beginAtZero:true,grid:{borderDash:[2,2],color:'#f1f5f9'},border:{display:false}},x:{grid:{display:false},border:{display:false}}}, plugins:{legend:{position:'bottom',labels:{boxWidth:8,font:{size:10}}}} } });
            this.c360Charts.push(c1, c2);
        }
    },

    closeCustomer360() {
        const overlay = document.getElementById('c360-overlay');
        const panel = document.getElementById('customer-360-panel');
        overlay.classList.add('opacity-0');
        panel.classList.add('translate-x-full');
        setTimeout(() => { overlay.classList.add('hidden'); }, 300);
    },


    clearCharts() {
        this.chartInstances.forEach(chart => chart.destroy());
        this.chartInstances = [];
    },

    loadView(viewName, menuElement = null) {
        const container = document.getElementById('app-view');
        const pageTitle = document.getElementById('page-title');
        if (menuElement) {
            document.querySelectorAll('[data-menu]').forEach(el => el.classList.remove('active'));
            menuElement.classList.add('active');
            if(pageTitle) pageTitle.innerText = menuElement.innerText;
        }
        this.clearCharts(); 
        const views = {
            'dashboard': { render: () => dashboardView.render(), init: () => dashboardView.initCharts() },
            'pcStatus': { render: () => controlViews.renderPcStatus() },
            'flagHistory': { render: () => controlViews.renderFlagHistory() },
            'rebootView': { render: () => controlViews.renderRebootView() },
            'groupManage': { render: () => controlViews.renderGroupManage() },
            'reportView': { render: () => controlViews.renderReportView() },
            'settings': { render: () => controlViews.renderSettings(this.state) },
            'assetView': { render: () => dataViews.renderAsset(), init: () => dataViews.initAssetChart() },
            'dataDashboard': { render: () => dataViews.renderDataDashboard(), init: () => dataViews.initDataDashCharts() },
            'depositView': { render: () => dataViews.renderDepositView(), init: () => dataViews.initDepositChart() },
            'b2bView': { render: () => dataViews.renderB2B() },
            'cardView': { render: () => dataViews.renderCard(), init: () => dataViews.initCardChart() },
            'taxView': { render: () => dataViews.renderTax() },
            'cashFlow': { render: () => dataViews.renderCashFlow(), init: () => dataViews.initCashFlowChart() },
            'proposalHistory': { render: () => dataViews.renderProposalHistory(), init: () => dataViews.initProposalCharts() },
            'campaignView': { render: () => dataViews.renderCampaignView() },
            'segmentView': { render: () => dataViews.renderSegmentView(), init: () => dataViews.initSegmentChart() }
        };
        if(views[viewName]) {
            // context 추적 (Customer360에서 사용)
            const contextMap = { assetView:'asset', depositView:'deposit', b2bView:'b2b', cardView:'card', taxView:'tax', cashFlow:'cashflow', dataDashboard:'general', pcStatus:'monitoring', flagHistory:'monitoring', rebootView:'monitoring', groupManage:'monitoring' };
            this._currentContext = contextMap[viewName] || 'general';
            container.innerHTML = views[viewName].render();
            if(views[viewName].init) setTimeout(() => views[viewName].init(), 50); 
        }
    },

    loadViewWithFilter(viewName, filterType) {
        const menus = document.querySelectorAll('[data-menu]');
        let targetMenuIndex = 1;
        if(viewName === 'flagHistory') targetMenuIndex = 2;
        this.loadView(viewName, menus[targetMenuIndex]);
        setTimeout(() => {
            const searchInput = document.getElementById('search-input');
            const statusSelect = document.getElementById('status-filter');
            if (viewName === 'pcStatus' && filterType === 'critical') { if(statusSelect) { statusSelect.value = 'critical'; controlViews.filterPcStatus(); } } 
            else if (viewName === 'flagHistory' && filterType === 'recovery') { if(searchInput) { searchInput.value = '자동 복구'; controlViews.filterLogs(); } }
        }, 100);
    },

    saveSettings() { 
        this.state.normalThreshold = document.getElementById('norm-input').value;
        this.state.warningThreshold = document.getElementById('warn-input').value;
        this.state.errorThreshold = document.getElementById('err-input').value;
        this.state.flagInterval = parseInt(document.getElementById('flag-interval').value) || 60;
        const btn = document.getElementById('save-btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-2"></i>저장 중...`;
        btn.classList.add('opacity-75');
        setTimeout(() => {
            btn.innerHTML = `<i class="fa-solid fa-check mr-2"></i>적용 완료`;
            btn.classList.replace('bg-slate-800', 'bg-teal-600');
            setTimeout(() => { btn.innerHTML = originalText; btn.classList.replace('bg-teal-600', 'bg-slate-800'); btn.classList.remove('opacity-75'); }, 2000);
        }, 800);
    }
};

window.onload = () => app.checkSession();