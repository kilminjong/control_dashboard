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
        this.loadView('dataDashboard', firstMenu);
    },

    injectProposalModal() {
        const modalHtml = `
        <div id="proposal-modal-overlay" onclick="app.closeProposalModal()" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[120] hidden opacity-0 transition-opacity duration-300 flex items-center justify-center">
            <div id="proposal-modal-content" class="bg-white w-[650px] rounded-xl shadow-2xl overflow-hidden transform scale-95 transition-transform duration-300 flex flex-col" onclick="event.stopPropagation()">
                <div id="prop-header" class="p-5 bg-teal-700 text-white flex justify-between items-center">
                    <div class="flex items-center space-x-3">
                        <div id="prop-icon-wrap" class="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center border border-teal-500 shadow-sm">
                            <i id="prop-icon" class="fa-solid fa-paper-plane text-xl text-teal-100"></i>
                        </div>
                        <div>
                            <h3 id="prop-title" class="text-lg font-bold tracking-tight">마케팅 및 영업 제안 발송</h3>
                            <p id="prop-subtitle" class="text-xs text-teal-100 mt-0.5">수집된 데이터를 기반으로 타겟 고객사에게 맞춤형 제안서를 전송합니다.</p>
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
                    <div id="prop-data-summary" class="mb-5 hidden"></div>
                    
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
        const hdr = document.getElementById('prop-header');
        const icon = document.getElementById('prop-icon');
        const iconWrap = document.getElementById('prop-icon-wrap');
        const title = document.getElementById('prop-title');
        const subtitle = document.getElementById('prop-subtitle');
        const summaryEl = document.getElementById('prop-data-summary');
        let msg = '', summaryHtml = '';

        if (type.includes('예금') || type.includes('예적금') || type.includes('유치') || type.includes('금리')) {
            hdr.className = 'p-5 bg-amber-600 text-white flex justify-between items-center';
            iconWrap.className = 'w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center border border-amber-400 shadow-sm';
            icon.className = 'fa-solid fa-piggy-bank text-xl text-amber-100';
            title.innerText = '예적금 유치 제안 발송';
            subtitle.innerText = '타행 예적금 만기 도래 고객에게 당행 특별 금리 유치 제안서를 전송합니다.';
            const assets = DB.getAssets ? DB.getAssets().filter(a => a.name && a.name.includes(company.split(' ')[0])) : [];
            const totalAmt = assets.reduce((s,a) => s + (a.amount||0), 0);
            const d30 = assets.filter(a => (a.dday||999) <= 30);
            const banks = [...new Set(assets.map(a=>a.bank))];
            summaryHtml = `<div class="bg-white p-4 rounded-lg border border-amber-200 shadow-sm">
                <p class="text-[11px] font-bold text-amber-700 uppercase mb-3"><i class="fa-solid fa-chart-pie mr-1.5"></i>고객사 예적금 보유 현황 분석</p>
                <div class="grid grid-cols-3 gap-3 mb-3">
                    <div class="bg-amber-50 p-2.5 rounded border border-amber-100 text-center"><p class="text-[9px] font-bold text-amber-600 mb-0.5">타행 보유 총액</p><p class="text-lg font-black text-amber-800">${totalAmt>0?Math.round(totalAmt/100000000).toLocaleString():'N/A'}<span class="text-xs ml-0.5">억</span></p></div>
                    <div class="bg-red-50 p-2.5 rounded border border-red-100 text-center"><p class="text-[9px] font-bold text-red-600 mb-0.5">D-30 만기 임박</p><p class="text-lg font-black text-red-700">${d30.length}<span class="text-xs ml-0.5">건</span></p></div>
                    <div class="bg-slate-50 p-2.5 rounded border border-slate-200 text-center"><p class="text-[9px] font-bold text-slate-500 mb-0.5">보유 은행 수</p><p class="text-lg font-black text-slate-800">${banks.length}<span class="text-xs ml-0.5">곳</span></p></div>
                </div>
                ${d30.length>0?`<div class="bg-red-50 p-2.5 rounded border border-red-100"><p class="text-[10px] font-bold text-red-700 mb-1.5"><i class="fa-solid fa-clock mr-1"></i>만기 임박 상품 (D-30 이내)</p>${d30.slice(0,3).map(a=>`<div class="flex justify-between text-[11px] mb-0.5"><span class="text-slate-600">${a.bank||'타행'} ${a.type||'예금'}</span><span class="font-mono font-bold text-slate-800">${Math.round((a.amount||0)/100000000).toLocaleString()}억</span><span class="text-red-600 font-bold">D-${a.dday||'?'}</span></div>`).join('')}</div>`:'<p class="text-[10px] text-slate-400 text-center py-2">만기 임박 상품 없음 — 전체 보유 현황 기반 유치 제안</p>'}
            </div>`;
            msg = `[하나은행] ${company} 재무담당자님,\n\n최근 타행 정기예금 만기 도래 일정이 확인되어, 당행에서 VIP 고객사를 위해 준비한 [특별 금리 우대 기업예금] 특판 상품을 선제적으로 제안 드립니다.\n\n현재 시장 금리 대비 최고 0.5%p 우대 혜택을 제공해 드릴 수 있으니, 첨부된 제안서를 확인해 보시기 바랍니다.`;

        } else if (type.includes('대출') || type.includes('여신') || type.includes('운전자금')) {
            hdr.className = 'p-5 bg-blue-700 text-white flex justify-between items-center';
            iconWrap.className = 'w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center border border-blue-500 shadow-sm';
            icon.className = 'fa-solid fa-hand-holding-dollar text-xl text-blue-100';
            title.innerText = '기업 여신/대출 제안 발송';
            subtitle.innerText = 'B2B 거래 분석 기반으로 결제성 자금 수요가 예측되는 고객에게 여신 제안을 전송합니다.';
            const b2b = DB.getB2B ? DB.getB2B().filter(b => b.name && b.name.includes(company.split(' ')[0])) : [];
            const totalB2B = b2b.reduce((s,b) => s + (b.amount||0), 0);
            const d30b = b2b.filter(b => (b.dday||999) <= 30);
            const tax = DB.getTax ? DB.getTax().filter(t => t.partner && t.partner.includes(company.split(' ')[0])) : [];
            const salesAmt = tax.filter(t=>t.type==='매출').reduce((s,t)=>s+(t.amount||0),0);
            summaryHtml = `<div class="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
                <p class="text-[11px] font-bold text-blue-700 uppercase mb-3"><i class="fa-solid fa-file-invoice-dollar mr-1.5"></i>고객사 여신 수요 분석</p>
                <div class="grid grid-cols-3 gap-3 mb-3">
                    <div class="bg-blue-50 p-2.5 rounded border border-blue-100 text-center"><p class="text-[9px] font-bold text-blue-600 mb-0.5">B2B 거래 총액</p><p class="text-lg font-black text-blue-800">${totalB2B>0?Math.round(totalB2B/100000000).toLocaleString():'N/A'}<span class="text-xs ml-0.5">억</span></p></div>
                    <div class="bg-red-50 p-2.5 rounded border border-red-100 text-center"><p class="text-[9px] font-bold text-red-600 mb-0.5">D-30 만기 도래</p><p class="text-lg font-black text-red-700">${d30b.length}<span class="text-xs ml-0.5">건</span></p></div>
                    <div class="bg-teal-50 p-2.5 rounded border border-teal-100 text-center"><p class="text-[9px] font-bold text-teal-600 mb-0.5">추정 매출</p><p class="text-lg font-black text-teal-800">${salesAmt>0?Math.round(salesAmt/100000000).toLocaleString():'N/A'}<span class="text-xs ml-0.5">억</span></p></div>
                </div>
                <div class="bg-blue-50 p-2.5 rounded border border-blue-100"><p class="text-[10px] font-bold text-blue-700 mb-1"><i class="fa-solid fa-lightbulb mr-1"></i>제안 근거</p><p class="text-[11px] text-slate-600 leading-relaxed">${d30b.length>0?`만기 30일 이내 B2B 거래 ${d30b.length}건(${Math.round(d30b.reduce((s,b)=>s+(b.amount||0),0)/100000000).toLocaleString()}억)이 도래하여 결제성 자금 수요가 예측됩니다.`:'안정적인 매출 실적과 B2B 거래 이력을 바탕으로 기업 우대 여신 한도를 산정하였습니다.'}</p></div>
            </div>`;
            msg = `[하나은행] ${company} 대표님,\n\n최근 귀사의 안정적인 매출 성장 및 우수한 결제 이력을 바탕으로, 하나은행에서 특별 '기업 우대 여신(대출) 한도'를 추가 산정하였습니다.\n\n다음 달 예정된 결제 자금 소요 등 필요하신 시기에 최저 금리로 자금을 활용하실 수 있도록 안내해 드립니다.`;

        } else if (type.includes('카드')) {
            hdr.className = 'p-5 bg-purple-700 text-white flex justify-between items-center';
            iconWrap.className = 'w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center border border-purple-500 shadow-sm';
            icon.className = 'fa-regular fa-credit-card text-xl text-purple-100';
            title.innerText = '법인카드 전환 제안 발송';
            subtitle.innerText = '타행 법인카드 사용 분석 결과, 당행 전환 시 비용 절감이 가능한 고객에게 제안합니다.';
            const cards = DB.getCards ? DB.getCards().filter(c => c.name && c.name.includes(company.split(' ')[0])) : [];
            const totalCard = cards.reduce((s,c) => s + (c.amount||0), 0);
            const cardCo = [...new Set(cards.map(c=>c.cardCompany||c.bank||'타행'))];
            const categories = {}; cards.forEach(c => { const cat=c.category||'기타'; categories[cat]=(categories[cat]||0)+(c.amount||0); });
            const topCat = Object.entries(categories).sort((a,b)=>b[1]-a[1]);
            const estSave = Math.round(totalCard * 0.08 / 10000);
            summaryHtml = `<div class="bg-white p-4 rounded-lg border border-purple-200 shadow-sm">
                <p class="text-[11px] font-bold text-purple-700 uppercase mb-3"><i class="fa-regular fa-credit-card mr-1.5"></i>고객사 타행 법인카드 사용 분석</p>
                <div class="grid grid-cols-3 gap-3 mb-3">
                    <div class="bg-purple-50 p-2.5 rounded border border-purple-100 text-center"><p class="text-[9px] font-bold text-purple-600 mb-0.5">타행 카드 사용액</p><p class="text-lg font-black text-purple-800">${totalCard>0?Math.round(totalCard/10000).toLocaleString():'N/A'}<span class="text-xs ml-0.5">만</span></p></div>
                    <div class="bg-slate-50 p-2.5 rounded border border-slate-200 text-center"><p class="text-[9px] font-bold text-slate-500 mb-0.5">이용 카드사</p><p class="text-sm font-black text-slate-800">${cardCo.length>0?cardCo.slice(0,2).join(', '):'N/A'}</p></div>
                    <div class="bg-teal-50 p-2.5 rounded border border-teal-100 text-center"><p class="text-[9px] font-bold text-teal-600 mb-0.5">전환 시 예상 절감</p><p class="text-lg font-black text-teal-800">${estSave>0?estSave.toLocaleString():'N/A'}<span class="text-xs ml-0.5">만/년</span></p></div>
                </div>
                ${topCat.length>0?`<div class="bg-purple-50 p-2.5 rounded border border-purple-100"><p class="text-[10px] font-bold text-purple-700 mb-1.5"><i class="fa-solid fa-chart-pie mr-1"></i>업종별 결제 비중</p>${topCat.slice(0,4).map(([cat,amt])=>`<div class="flex justify-between text-[11px] mb-0.5"><span class="text-slate-600">${cat}</span><span class="font-mono font-bold text-slate-800">${Math.round(amt/10000).toLocaleString()}만</span><span class="text-purple-600 font-bold">${totalCard>0?Math.round(amt/totalCard*100):0}%</span></div>`).join('')}</div>`:'<p class="text-[10px] text-slate-400 text-center py-2">카드 사용 상세 데이터 기반 맞춤 제안</p>'}
            </div>`;
            msg = `[하나은행] ${company} 관리담당자님,\n\n당행의 기업 비용 분석 시스템(CRM) 결과, 귀사의 월간 주유 및 교통비 지출 비중이 높은 것으로 파악되었습니다.\n\n이에 하나은행 'Biz 주유 특화 법인카드'로 전환하실 경우, 연간 최소 ${estSave>0?estSave.toLocaleString()+'만':'350만'} 원 이상의 비용 절감이 예상되어 맞춤형 카드를 제안해 드립니다.`;

        } else if (type.includes('세그먼트') || type.includes('종합') || type.includes('패키지')) {
            hdr.className = 'p-5 bg-indigo-700 text-white flex justify-between items-center';
            iconWrap.className = 'w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center border border-indigo-500 shadow-sm';
            icon.className = 'fa-solid fa-cubes text-xl text-indigo-100';
            title.innerText = '종합 금융 패키지 제안 발송';
            subtitle.innerText = '세그먼트 분석 결과 기반 고객 맞춤 복합 금융 상품 패키지를 제안합니다.';
            summaryHtml = `<div class="bg-white p-4 rounded-lg border border-indigo-200 shadow-sm">
                <p class="text-[11px] font-bold text-indigo-700 uppercase mb-3"><i class="fa-solid fa-users-viewfinder mr-1.5"></i>세그먼트 기반 맞춤 제안</p>
                <div class="grid grid-cols-2 gap-3">
                    <div class="bg-indigo-50 p-2.5 rounded border border-indigo-100"><p class="text-[10px] font-bold text-indigo-700 mb-1"><i class="fa-solid fa-crosshairs mr-1"></i>제안 전략</p><p class="text-[11px] text-slate-600">수집 데이터 종합 분석(자산·거래·카드·매출·자금흐름) 기반 고객 스코어링 결과에 따른 맞춤 제안</p></div>
                    <div class="bg-teal-50 p-2.5 rounded border border-teal-100"><p class="text-[10px] font-bold text-teal-700 mb-1"><i class="fa-solid fa-arrow-trend-up mr-1"></i>기대 효과</p><p class="text-[11px] text-slate-600">예적금 우대금리 + 기업 여신 + 법인카드 혜택 패키지로 당행 점유율 상승 및 고객 Lock-in 효과</p></div>
                </div>
            </div>`;
            msg = `[하나은행] ${company} 담당자님,\n\n하나은행 통합CMS 관제센터의 데이터 분석 결과, 귀사에 최적화된 종합 금융 패키지를 준비하였습니다.\n\n예적금 우대금리 + 기업 여신 + 법인카드 혜택을 패키지로 제공해 드릴 수 있으니, 상세 내용을 확인해 주시기 바랍니다.`;

        } else {
            hdr.className = 'p-5 bg-teal-700 text-white flex justify-between items-center';
            iconWrap.className = 'w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center border border-teal-500 shadow-sm';
            icon.className = 'fa-solid fa-paper-plane text-xl text-teal-100';
            title.innerText = '마케팅 및 영업 제안 발송';
            subtitle.innerText = '수집된 데이터를 기반으로 타겟 고객사에게 맞춤형 제안서를 전송합니다.';
            summaryHtml = '';
            msg = `[하나은행] ${company} 담당자님,\n\n하나은행 통합CMS 관제센터입니다. 귀사의 안정적인 금융 업무를 위한 맞춤형 혜택을 안내해 드립니다.`;
        }

        if(summaryHtml) { summaryEl.innerHTML = summaryHtml; summaryEl.classList.remove('hidden'); }
        else { summaryEl.innerHTML = ''; summaryEl.classList.add('hidden'); }
        
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
            if(this._dataGuide && this._dataGuide[viewName]) {
                container.insertAdjacentHTML('beforeend', `<button onclick="app.showDataGuide('${viewName}')" class="fixed bottom-6 right-6 z-50 bg-slate-800 text-white pl-3.5 pr-4 py-2.5 rounded-full text-xs font-bold shadow-lg hover:bg-teal-600 transition-colors flex items-center space-x-2"><i class="fa-solid fa-database"></i><span>데이터 활용 설명</span></button>`);
            } 
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
    },

    _dataGuide: {
        dashboard:{title:'대시보드 총괄표',icon:'fa-table-cells-large',color:'#0d9488',items:[{data:'Agent Flag 수신 상태',source:'각 고객사 스케줄 PC Agent가 주기(기본 1시간)마다 전송하는 Flag 값',usage:'정상/주의/장애/지속장애 4단계 KPI + 도넛 차트'},{data:'장애 발생 추이',source:'최근 7일간 일별 장애 건수 집계',usage:'라인 차트로 증감 패턴 파악'},{data:'반복 장애 고객',source:'30일 내 2회+ 장애 고객사 필터링',usage:'집중 관리 대상 패널'},{data:'마케팅 데이터 수집 현황',source:'Agent 수집 금융 데이터(자산,B2B,카드,세금계산서) 건수',usage:'KPI 4칸으로 수집 진행률'}]},
        pcStatus:{title:'단말 상태 관제',icon:'fa-server',color:'#3b82f6',items:[{data:'Agent 단말 정보',source:'고객사별 스케줄 PC의 IP, OS, Agent ID',usage:'300대 단말 테이블 + 검색/필터'},{data:'Flag 수신 시간·경과',source:'마지막 Flag 수신 시각 기준 경과 시간',usage:'임계값(5/10/30분)으로 상태 자동 판별'},{data:'VIP/일반 등급',source:'고객사 등급 관리에서 설정',usage:'VIP 우선 표시 및 필터링'}]},
        flagHistory:{title:'Flag 수신 이력',icon:'fa-list-check',color:'#f59e0b',items:[{data:'Flag 수신 로그',source:'Agent→관제서버 전송 시 기록 (정상/지연/미수신/재구동)',usage:'유형별 6종 카운트 + 이력 테이블'},{data:'고객사별 타임라인',source:'특정 고객사의 시간순 Flag 전체 기록',usage:'장애→재구동→복구 흐름 시각적 확인'}]},
        rebootView:{title:'재구동 이력 관리',icon:'fa-rotate-right',color:'#8b5cf6',items:[{data:'자동 재구동 기록',source:'Watcher.dog 장애 감지 → Agent 재시작 시도 이력',usage:'시도 시간, 횟수, 성공/실패 테이블'},{data:'재구동 성공률',source:'전체 시도 대비 성공/실패 비율',usage:'KPI 4칸 (시도/성공/실패/성공률)'}]},
        groupManage:{title:'고객사 등급 관리',icon:'fa-users-gear',color:'#6366f1',items:[{data:'고객사 기본 정보',source:'CMS 계약 고객사 목록',usage:'고객사 테이블'},{data:'등급 설정',source:'장애 빈도 기반 + 관리자 수동 설정',usage:'VIP/일반 분류, 전 메뉴 필터링'}]},
        reportView:{title:'운영 보고서',icon:'fa-file-pdf',color:'#ef4444',items:[{data:'운영 통계',source:'기간별 장애 건수, 가동률, 재구동 현황 집계',usage:'보고서 자동 생성'},{data:'데이터 수집 실적',source:'보고 기간 내 수집 건수',usage:'수집 성과 보고'}]},
        settings:{title:'모니터링 정책 설정',icon:'fa-sliders',color:'#64748b',items:[{data:'Flag 수신 주기',source:'Agent Flag 전송 간격 (10분~3시간)',usage:'전체 정상/주의/장애 판별 기준'},{data:'상태 판별 임계값',source:'정상(5분)/주의(10분)/장애(30분) 기준',usage:'경과 시간 비교로 상태 자동 분류'}]},
        dataDashboard:{title:'데이터 활용 총괄',icon:'fa-chart-pie',color:'#0d9488',items:[{data:'은행별 보유 금액',source:'<b>수집:</b> 은행명, 계좌구분, 보유금액(백만/억)<br>전 금융기관 예적금 잔액',usage:'당행 vs 타행 점유율 도넛 차트로 유치 타겟 식별'},{data:'모계좌 거래내역 기반 자금흐름',source:'<b>수집:</b> 거래일자, 은행명, 입/출구분, 거래금액',usage:'자금흐름 순위 테이블로 자금 건전성 파악'},{data:'법인카드 승인내역',source:'<b>수집:</b> 카드사명, 사용건수, 사용액',usage:'8개월 추이 차트로 카드 전환 타겟 식별'},{data:'영업 타겟 긴급 액션',source:'복합 분석으로 만기 도래·고액 결제·매출 우량 기업 필터링',usage:'즉시 제안 필요 고객사 리스트 자동 생성'}]},
        assetView:{title:'금융자산 점유 현황',icon:'fa-coins',color:'#f59e0b',items:[{data:'은행별 보유 금액',source:'<b>수집:</b> 은행명, 계좌구분(예금/적금/신탁), 보유금액(백만/억)<br>하나+타행 전체 예적금 잔액',usage:'은행별 스택 바차트로 자산 분포 시각화. 타행 비중 높은 기업을 유치 타겟으로 식별'},{data:'예적금 만기 정보',source:'<b>수집:</b> 은행명, 잔액, 만기일, 이율',usage:'D-30/60/90 만기 도래 리스트 자동 생성. 만기 전 선제적 유치 제안'},{data:'타행 금리 비교',source:'<b>수집:</b> 은행명, 이율',usage:'당행 전환 시 금리 이점을 수치로 산출'}]},
        depositView:{title:'예적금 보유/만기 분석',icon:'fa-piggy-bank',color:'#3b82f6',items:[{data:'계좌 원장 상세',source:'<b>수집:</b> 은행명, 잔액, 만기일, 이율',usage:'은행별 만기 일정 테이블에서 D-Day 기준 하이라이팅'},{data:'고객사별 보유 잔액 합계',source:'<b>수집:</b> 은행명, 계좌구분, 보유금액',usage:'보유 현황 테이블 + 검색으로 당행 비중 확인'},{data:'당행/타행 점유율',source:'위 데이터 기반 자동 계산',usage:'도넛 차트로 점유율 시각화. 이탈 위험 조기 감지'}]},
        b2bView:{title:'전자어음 및 B2B 거래',icon:'fa-file-invoice-dollar',color:'#8b5cf6',items:[{data:'B2B 전자어음/매출채권 원장',source:'<b>수집:</b> 은행명, 상품구분, 매입/매출 구분, 금액, 만기일',usage:'분기별 집계 + 유형별 분류. 매출채권 비중 높은 기업에 팩토링 제안'},{data:'만기 정보',source:'<b>수집:</b> 만기일, 금액, 상품구분',usage:'D-Day 만기 임박 하이라이팅. 단기 운전자금 대출 선제 제안'},{data:'거래 상대방',source:'<b>수집:</b> 매입/매출, 거래 상대 사업자 정보',usage:'주요 거래처 파악 → 신규 CMS 타겟 발굴'}]},
        cardView:{title:'법인카드 사용 분석',icon:'fa-credit-card',color:'#ef4444',items:[{data:'타행 법인카드 승인내역',source:'<b>수집:</b> 카드사명, 사용카드 장수, 사용건수, 사용액',usage:'업종별 도넛 + 8개월 추이 라인 차트'},{data:'업종별 결제 비중',source:'승인내역에서 업종별 자동 분류·집계',usage:'주유 30%+ 기업에 특화 카드 전환 제안. 예상 절감액 산출'},{data:'고액 결제 기업',source:'월 500만원+ 기업 필터링',usage:'전환 효과 가장 큰 기업 우선 타겟팅'}]},
        taxView:{title:'전자세금계산서',icon:'fa-receipt',color:'#0d9488',items:[{data:'세금계산서 매출/매입',source:'<b>수집:</b> 매입/매출 구분, 사업자명(번호), 합계금액, 품목, 작성일, 발행일',usage:'매출/매입 KPI + 거래 내역 테이블로 사업 규모 파악'},{data:'매출 규모 기반 여신 분석',source:'합계금액 집계 → 추정 연매출, 현 여신 한도 비교',usage:'매출 우량 + 여신 낮은 기업 → 여신 상향 제안'},{data:'거래처 네트워크',source:'<b>수집:</b> 사업자명, 매입/매출 구분',usage:'주요 거래처 파악 → 신규 CMS + 공급망 금융'}]},
        cashFlow:{title:'자금흐름 분석',icon:'fa-money-bill-transfer',color:'#6366f1',items:[{data:'모계좌 입출금 거래내역',source:'<b>수집:</b> 거래일자, 은행명, 입/출구분, 거래금액<br>모계좌 일별 입출금 30일간 집계',usage:'입금(바)+출금(바)+순흐름(라인) 혼합 차트'},{data:'수시입출 거래내역',source:'<b>수집:</b> 거래일자, 은행명, 계좌구분, 적요, 입/출구분, 거래금액',usage:'급여 지급일, 매출 입금 주기 등 세부 패턴 분석'},{data:'자금 부족 구간 감지',source:'일별 순흐름 마이너스 자동 감지',usage:'마이너스 통장, 단기 대출 선제 제안'},{data:'이체결과·자금집금',source:'<b>수집:</b> 이체일자, 거래금액 / 집금일자, 집금금액',usage:'CMS 활용도 파악'}]},
        proposalHistory:{title:'제안 이력 관리',icon:'fa-paper-plane',color:'#0d9488',items:[{data:'영업 제안 발송 기록',source:'데이터 분석으로 식별된 타겟에 발송한 제안 이력',usage:'6단계 파이프라인 추적'},{data:'제안 전환율',source:'발송 대비 승인 비율 + 계약 금액',usage:'KPI 6칸 + 도넛 차트'},{data:'30일 발송 추이',source:'일별 발송 건수 집계',usage:'바 차트로 영업 활동량 모니터링'}]},
        campaignView:{title:'캠페인 관리',icon:'fa-bullhorn',color:'#f59e0b',items:[{data:'캠페인 타겟 고객',source:'수집 데이터 분석으로 조건별 자동 필터링',usage:'타겟→발송→회신→계약 + 진행률 바'},{data:'전환율',source:'발송 대비 계약 비율',usage:'10%+ 하이라이팅'},{data:'미발송 현황',source:'타겟 대비 미발송 수',usage:'일괄 발송 버튼'}]},
        segmentView:{title:'고객 세그먼트',icon:'fa-users-viewfinder',color:'#8b5cf6',items:[{data:'복합 지표 스코어링',source:'전체 수집 데이터 종합 스코어',usage:'6개 세그먼트 자동 분류'},{data:'멤버 상세',source:'스코어, 매출, 당행 점유율',usage:'좌측 카드→우측 테이블 + 즉시 제안'},{data:'세그먼트 분포',source:'6개 세그먼트별 고객 수',usage:'바 차트로 포트폴리오 균형 파악'}]}
    },
    showDataGuide(v) {
        const g=this._dataGuide[v]; if(!g) return;
        const old=document.getElementById('data-guide-overlay'); if(old) old.remove();
        const h=`<div id="data-guide-overlay" onclick="app.closeDataGuide()" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[140] flex items-center justify-center" style="opacity:0;transition:opacity .3s"><div class="bg-white w-[720px] max-h-[85vh] rounded-xl shadow-2xl overflow-hidden flex flex-col" onclick="event.stopPropagation()" style="transform:scale(.95);transition:transform .3s"><div class="p-5 text-white flex justify-between items-center shrink-0" style="background:${g.color}"><div class="flex items-center space-x-3"><div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"><i class="fa-solid ${g.icon} text-lg"></i></div><div><h3 class="text-lg font-bold">${g.title}</h3><p class="text-xs mt-0.5 opacity-80">수집 데이터와 화면 활용 방식</p></div></div><button onclick="app.closeDataGuide()" class="opacity-70 hover:opacity-100"><i class="fa-solid fa-xmark text-xl"></i></button></div><div class="flex-1 overflow-y-auto p-6 space-y-4">${g.items.map((it,i)=>`<div class="border border-slate-200 rounded-lg overflow-hidden"><div class="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center space-x-2"><span class="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white shrink-0" style="background:${g.color}">${i+1}</span><h4 class="text-[13px] font-bold text-slate-800">${it.data}</h4></div><div class="p-4 space-y-3"><div><p class="text-[10px] font-bold text-slate-400 uppercase mb-1.5"><i class="fa-solid fa-download mr-1"></i>수집 데이터</p><p class="text-[12px] text-slate-700 leading-relaxed">${it.source}</p></div><div class="border-t border-slate-100 pt-3"><p class="text-[10px] font-bold uppercase mb-1.5" style="color:${g.color}"><i class="fa-solid fa-chart-line mr-1"></i>화면 활용 방식</p><p class="text-[12px] text-slate-700 leading-relaxed">${it.usage}</p></div></div></div>`).join('')}</div><div class="px-6 py-3 border-t border-slate-200 bg-slate-50 shrink-0"><p class="text-[10px] text-slate-400 text-center"><i class="fa-solid fa-shield-halved mr-1"></i>위 데이터는 고객사 스케줄 PC의 CMS Agent를 통해 자동 수집됩니다.</p></div></div></div>`;
        document.body.insertAdjacentHTML('beforeend',h);
        setTimeout(()=>{const o=document.getElementById('data-guide-overlay');if(o){o.style.opacity='1';o.firstElementChild.style.transform='scale(1)';}},10);
    },
    closeDataGuide(){const o=document.getElementById('data-guide-overlay');if(o){o.style.opacity='0';o.firstElementChild.style.transform='scale(.95)';setTimeout(()=>o.remove(),300);}}
};

document.addEventListener('click',function(e){
    const tip=e.target.closest('.info-tip');
    const old=document.getElementById('floating-tip');if(old)old.remove();
    if(!tip)return; e.stopPropagation();
    const box=tip.querySelector('.tip-box');if(!box)return;
    const rect=tip.getBoundingClientRect();
    const div=document.createElement('div');div.id='floating-tip';div.innerHTML=box.innerHTML;
    div.style.cssText='position:fixed;z-index:99999;width:360px;padding:14px 16px;background:#1e293b;color:#e2e8f0;border-radius:10px;font-size:12px;line-height:1.7;font-weight:500;box-shadow:0 12px 32px rgba(0,0,0,0.3);opacity:0;transition:opacity .2s;';
    div.querySelectorAll('b').forEach(b=>b.style.color='#5eead4');
    document.body.appendChild(div);
    let top=rect.top-div.offsetHeight-10;let left=rect.left+rect.width/2-180;
    if(top<10)top=rect.bottom+10;if(left<10)left=10;if(left+360>window.innerWidth-10)left=window.innerWidth-370;
    div.style.top=top+'px';div.style.left=left+'px';
    setTimeout(()=>{div.style.opacity='1';},10);
    setTimeout(()=>{document.addEventListener('click',function handler(){const el=document.getElementById('floating-tip');if(el){el.style.opacity='0';setTimeout(()=>el.remove(),200);}document.removeEventListener('click',handler);});},50);
});

window.onload = () => app.checkSession();