const dataViews = {
    cachedB2B: null,
    cachedTax: null,
    cachedAsset: null,
    cachedCard: null,

    getB2BData() {
        if(this.cachedB2B) return this.cachedB2B;
        const companies = ['미래건설산업(주)', '(주)글로벌네트웍스', '제일유통', '하나시스템(주)', '태양물산', '한국정밀', '대보건설', '현대유통', '스마트솔루션즈', '다우테크', '씨제이대한', '에스케이망'];
        const banks = ['A은행', 'B은행', 'C은행', 'D은행'];
        const types = ['전자어음', 'B2B매출', 'B2B매입'];
        let data = [];
        for(let i=0; i<300; i++) {
            let dday = Math.floor(Math.random() * 90) + 1;
            let amt = (Math.floor(Math.random() * 500) + 10) * 1000000;
            let type = types[Math.floor(Math.random() * types.length)];
            data.push({
                name: companies[i % companies.length] + (i>15 ? ` ${i}지점` : ''),
                regNo: `${Math.floor(Math.random()*900)+100}-${Math.floor(Math.random()*90)+10}-${Math.floor(Math.random()*90000)+10000}`,
                bank: banks[Math.floor(Math.random() * banks.length)],
                type: type,
                amount: amt,
                dday: dday,
                date: `2026-0${3 + Math.floor(dday/30)}-${String((dday%28)+1).padStart(2,'0')}`,
                status: dday <= 30 && type !== 'B2B매입' ? 'target' : 'monitor'
            });
        }
        this.cachedB2B = data.sort((a,b) => a.dday - b.dday);
        return this.cachedB2B;
    },

    getTaxData() {
        if(this.cachedTax) return this.cachedTax;
        const partners = ['삼성물산(주)', '한국전력공사', '(주)LG화학', '현대자동차(주)', 'SK하이닉스', '포스코건설', 'CJ제일제당', '대한항공', 'KT', '이마트'];
        const items = ['건축 자재 납품', '산업용 전기요금', '원자재 구매', '물류/운송비', 'IT 인프라 유지보수', '사무용품 대량구매', '마케팅 대행비', '시설 임대료'];
        let data = [];
        for(let i=0; i<300; i++) {
            let isSales = Math.random() > 0.4;
            let amt = (Math.floor(Math.random() * 900) + 5) * 1000000;
            data.push({
                type: isSales ? '매출' : '매입',
                partner: partners[Math.floor(Math.random() * partners.length)] + (i>10 ? ` ${i}지사` : ''),
                item: items[Math.floor(Math.random() * items.length)],
                amount: amt,
                status: isSales && amt > 100000000 ? '우량' : (isSales ? '보통' : '지출')
            });
        }
        this.cachedTax = data;
        return this.cachedTax;
    },

    getAssetData() {
        if(this.cachedAsset) return this.cachedAsset;
        const companies = ['미래건설산업(주)', '(주)글로벌네트웍스', '제일유통', '하나시스템(주)', '태양물산', '한국정밀', '대보건설', '현대유통'];
        const banks = ['A은행(국민)', 'B은행(신한)', 'C은행(기업)', 'D은행(농협)'];
        let data = [];
        for(let i=0; i<150; i++) {
            let dday = Math.floor(Math.random() * 60) + 1;
            data.push({
                name: companies[i % companies.length] + (i>8 ? ` ${i}지점` : ''),
                bank: banks[Math.floor(Math.random() * banks.length)],
                product: Math.random() > 0.5 ? '정기예금' : '적금',
                amount: (Math.floor(Math.random() * 300) + 50) * 10000000,
                dday: dday
            });
        }
        this.cachedAsset = data.sort((a,b) => a.dday - b.dday);
        return this.cachedAsset;
    },

    getCardData() {
        if(this.cachedCard) return this.cachedCard;
        const companies = ['미래건설산업(주)', '(주)글로벌네트웍스', '제일유통', '하나시스템(주)', '태양물산', '현대유통'];
        const categories = ['주유/교통비', '항공/숙박(출장)', '식대/접대비', '공과금/기타'];
        const banks = ['현대카드', '삼성카드', '신한카드', '국민카드'];
        let data = [];
        for(let i=0; i<150; i++) {
            data.push({
                name: companies[i % companies.length] + (i>5 ? ` ${i}본부` : ''),
                category: categories[Math.floor(Math.random() * categories.length)],
                bank: banks[Math.floor(Math.random() * banks.length)],
                amount: (Math.floor(Math.random() * 50) + 5) * 1000000
            });
        }
        this.cachedCard = data.sort((a,b) => b.amount - a.amount);
        return this.cachedCard;
    },

    buildB2BRows(data) {
        if(data.length === 0) return `<tr><td colspan="6" class="text-center py-10 text-slate-500 font-bold">검색 결과가 없습니다.</td></tr>`;
        return data.map(item => `
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="px-4 py-3 text-center"><input type="checkbox" class="rounded border-slate-300"></td>
                <td class="px-4 py-3"><p class="font-bold text-slate-800 text-[13px]"><span onclick="app.openCustomer360('${item.name}')" class="cursor-pointer text-teal-700 hover:text-teal-900 hover:underline transition-colors">${item.name}</span></p><p class="text-[10px] text-slate-400 font-mono mt-0.5">${item.regNo}</p></td>
                <td class="px-4 py-3"><span class="bg-slate-100 text-slate-600 px-2 py-1 rounded font-bold text-[10px] border border-slate-200">${item.bank} / ${item.type}</span></td>
                <td class="px-4 py-3 text-right font-mono font-bold text-slate-800 text-[13px]">${item.amount.toLocaleString()}</td>
                <td class="px-4 py-3 text-center"><span class="${item.status === 'target' ? 'text-red-600 bg-red-50 border-red-100' : 'text-slate-500 bg-white border-transparent'} font-bold px-2 py-1 rounded border">${item.date} (D-${item.dday})</span></td>
                <td class="px-4 py-3">
                    ${item.status === 'target' 
                        ? `<button class="text-[11px] font-bold px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 transition shadow-sm">대출(여신) 제안</button>`
                        : `<span class="flex items-center text-slate-400 font-bold text-[11px]"><div class="w-1.5 h-1.5 rounded-full bg-slate-300 mr-1.5"></div>만기 도래 관찰 중</span>`}
                </td>
            </tr>
        `).join('');
    },

    filterB2B() {
        const keyword = document.getElementById('b2b-search').value.toLowerCase();
        const filtered = this.getB2BData().filter(i => i.name.toLowerCase().includes(keyword) || i.regNo.includes(keyword) || i.bank.toLowerCase().includes(keyword));
        document.getElementById('b2b-tbody').innerHTML = this.buildB2BRows(filtered);
    },

    renderB2B() {
        const data = this.getB2BData();
        return `
        <div class="max-w-[1400px] mx-auto flex flex-col h-full">
            <div class="grid grid-cols-3 gap-4 mb-4">
                <div class="bg-blue-50 border border-blue-200 p-4 rounded flex justify-between items-center shadow-sm"><div class="text-blue-800"><p class="text-[11px] font-bold mb-1">총 만기 예정 금액 (수집 데이터)</p><h3 class="text-2xl font-black font-mono">1,850<span class="text-sm font-bold ml-1">억 원</span></h3></div><i class="fa-solid fa-won-sign text-3xl text-blue-200"></i></div>
                <div class="bg-white border border-slate-200 p-4 rounded flex justify-between items-center shadow-sm"><div class="text-slate-800"><p class="text-[11px] font-bold text-slate-500 mb-1">D-30 이내 만기 임박 건수</p><h3 class="text-2xl font-black font-mono">${data.filter(d=>d.dday<=30).length}<span class="text-sm font-bold ml-1 text-slate-500">건</span></h3></div><i class="fa-regular fa-calendar-xmark text-3xl text-slate-200"></i></div>
                <div class="bg-teal-50 border border-teal-200 p-4 rounded flex justify-between items-center shadow-sm"><div class="text-teal-800"><p class="text-[11px] font-bold mb-1">대출(여신) 제안 우선 타겟 수</p><h3 class="text-2xl font-black font-mono">${data.filter(d=>d.status==='target').length}<span class="text-sm font-bold ml-1">개사</span></h3></div><i class="fa-solid fa-bullseye text-3xl text-teal-200"></i></div>
            </div>

            <div class="flex justify-between items-end mb-3">
                <h2 class="text-[15px] font-bold text-slate-800 tracking-tight">전자어음 및 B2B 거래 상세 내역 (영업 리드)</h2>
                <div class="flex space-x-2">
                    <button class="bg-slate-800 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-slate-700 shadow-sm"><i class="fa-solid fa-paper-plane mr-1.5"></i>선택 항목 영업점 일괄 전송</button>
                </div>
            </div>

            <div class="bg-white border border-slate-200 rounded flex flex-col flex-1 overflow-hidden shadow-sm">
                <div class="px-4 py-3 border-b border-slate-200 bg-slate-50 flex space-x-3 items-center">
                    <div class="relative">
                        <i class="fa-solid fa-magnifying-glass absolute left-3 top-2 text-slate-400 text-xs"></i>
                        <input type="text" id="b2b-search" onkeyup="dataViews.filterB2B()" placeholder="고객사명, 사업자번호, 은행 검색" class="border border-slate-300 rounded text-xs pl-8 pr-3 py-1.5 w-64 outline-none focus:border-teal-500 font-medium">
                    </div>
                </div>
                <div class="overflow-y-auto max-h-[550px] relative">
                    <table class="w-full text-left border-collapse whitespace-nowrap">
                        <thead class="bg-white text-[12px] text-slate-500 border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th class="px-4 py-3 font-bold w-10 text-center"><input type="checkbox" class="rounded border-slate-300"></th>
                                <th class="px-4 py-3 font-bold">고객사명 (사업자번호)</th>
                                <th class="px-4 py-3 font-bold">금융기관 / 수집 상품</th>
                                <th class="px-4 py-3 font-bold text-right">만기 예정 금액 (원)</th>
                                <th class="px-4 py-3 font-bold text-center">만기 일자 (D-Day)</th>
                                <th class="px-4 py-3 font-bold">마케팅 조치 (Action)</th>
                            </tr>
                        </thead>
                        <tbody id="b2b-tbody" class="text-xs text-slate-700 divide-y divide-slate-100">
                            ${this.buildB2BRows(data)}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        `;
    },

    buildAssetRows(data) {
        if(data.length === 0) return `<div class="text-center py-10 text-slate-500 font-bold border border-slate-200 rounded bg-slate-50">검색 결과가 없습니다.</div>`;
        return data.map(item => `
            <div class="p-3 border border-slate-200 bg-slate-50 rounded flex justify-between items-center hover:bg-white transition shadow-sm mb-2">
                <div>
                    <p class="text-[13px] font-bold text-slate-800"><span onclick="app.openCustomer360('${item.name}')" class="cursor-pointer text-teal-700 hover:text-teal-900 hover:underline transition-colors">${item.name}</span> <span class="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded ml-1 text-slate-500">${item.bank}</span></p>
                    <p class="text-[11px] ${item.dday <= 30 ? 'text-red-500' : 'text-slate-500'} font-bold mt-1">${item.product} 만기 ${item.dday <= 30 ? '임박' : '예정'} (D-${item.dday})</p>
                </div>
                <div class="text-right">
                    <p class="text-[15px] font-black font-mono text-slate-800">${item.amount.toLocaleString()} 원</p>
                    <button class="text-[11px] bg-teal-600 text-white px-2.5 py-1 rounded font-bold mt-1.5 hover:bg-teal-700 shadow-sm">당행 유치 제안</button>
                </div>
            </div>
        `).join('');
    },

    filterAsset() {
        const keyword = document.getElementById('asset-search').value.toLowerCase();
        const filtered = this.getAssetData().filter(i => i.name.toLowerCase().includes(keyword) || i.bank.toLowerCase().includes(keyword));
        document.getElementById('asset-list').innerHTML = this.buildAssetRows(filtered);
    },

    renderAsset() { 
        return `
        <div class="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div class="bg-white border border-slate-200 rounded p-5 shadow-sm h-fit">
                <h3 class="font-bold text-slate-800 text-[14px] mb-1">전체 고객사 금융기관별 자산 점유율 현황</h3>
                <p class="text-[11px] text-slate-500 mb-5">수집된 금융 데이터 합산 기준 (단위: 억 원)</p>
                <div class="h-[300px] w-full"><canvas id="assetChart"></canvas></div>
            </div>
            <div class="bg-white border border-slate-200 rounded p-5 flex flex-col shadow-sm max-h-[700px]">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="font-bold text-slate-800 text-[14px]">고액 예·적금 만기 도래 타겟 리스트</h3>
                    <input type="text" id="asset-search" onkeyup="dataViews.filterAsset()" placeholder="고객사, 은행명 검색" class="border border-slate-300 rounded text-xs px-3 py-1 w-48 outline-none focus:border-teal-500 font-medium">
                </div>
                <div id="asset-list" class="flex-1 overflow-y-auto pr-2 space-y-1">
                    ${this.buildAssetRows(this.getAssetData())}
                </div>
            </div>
        </div>`; 
    },
    initAssetChart() { 
        const ctx = document.getElementById('assetChart').getContext('2d'); 
        const chart = new Chart(ctx, { 
            type: 'bar', 
            data: { 
                labels: ['당행(하나)', 'A은행(국민)', 'B은행(신한)', 'C은행(기업)'], 
                datasets: [{ label: '보유 자산 총액', data: [850, 450, 320, 150], backgroundColor: ['#0d9488', '#cbd5e1', '#cbd5e1', '#cbd5e1'], borderRadius: 4, barThickness: 40 }] 
            }, 
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, grid: { borderDash: [2, 2], color: '#f1f5f9' }, border: { display: false } }, x: { grid: { display: false }, border: { display: false } } }, plugins: { legend: { display: false } } } 
        }); 
        app.chartInstances.push(chart); 
    },

    buildCardRows(data) {
        if(data.length === 0) return `<tr><td colspan="5" class="text-center py-10 text-slate-500 font-bold">검색 결과가 없습니다.</td></tr>`;
        return data.map(item => `
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="px-4 py-3"><span onclick="app.openCustomer360('${item.name}')" class="cursor-pointer text-teal-700 hover:text-teal-900 hover:underline font-bold text-[13px]">${item.name}</span></td>
                <td class="px-4 py-3"><span class="bg-slate-100 text-slate-600 px-2 py-1 rounded font-bold text-[10px] border border-slate-200">${item.bank}</span></td>
                <td class="px-4 py-3 font-bold text-slate-700 text-[12px]">${item.category}</td>
                <td class="px-4 py-3 text-right font-mono font-bold text-slate-800 text-[13px]">${item.amount.toLocaleString()}</td>
                <td class="px-4 py-3 text-center"><button class="text-[11px] font-bold px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 transition shadow-sm">맞춤 카드 제안</button></td>
            </tr>
        `).join('');
    },

    filterCard() {
        const keyword = document.getElementById('card-search').value.toLowerCase();
        const filtered = this.getCardData().filter(i => i.name.toLowerCase().includes(keyword) || i.category.toLowerCase().includes(keyword) || i.bank.toLowerCase().includes(keyword));
        document.getElementById('card-tbody').innerHTML = this.buildCardRows(filtered);
    },

    renderCard() { 
        return `
        <div class="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div class="lg:col-span-4 bg-white border border-slate-200 rounded p-6 shadow-sm h-fit">
                <h3 class="font-bold text-slate-800 text-[14px] mb-1">타행 법인카드 주 사용처 분석 (업종별)</h3>
                <p class="text-[11px] text-slate-500 mb-6">당행 신규 카드 상품 기획 및 전환 영업 타겟팅 데이터</p>
                <div class="h-[220px] flex justify-center"><canvas id="cardChart"></canvas></div>
                <div class="mt-6 pt-4 border-t border-slate-100 bg-slate-50 p-4 rounded text-center">
                    <p class="text-[12px] text-slate-700 font-medium leading-relaxed">수집된 데이터 분석 결과, 타행 카드 결제액의 40% 이상이 <span class="font-bold text-teal-600">주유/교통</span>에 집중되어 있습니다. <br>따라서 <span class="font-bold text-slate-900 underline">당행 주유 특화 법인카드 프로모션</span>을 우선적으로 제안해야 합니다.</p>
                </div>
            </div>

            <div class="lg:col-span-8 bg-white border border-slate-200 rounded flex flex-col shadow-sm overflow-hidden">
                <div class="px-4 py-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                    <h3 class="text-[14px] font-bold text-slate-800">법인카드 고액 결제 기업 타겟 리스트</h3>
                    <div class="relative">
                        <i class="fa-solid fa-magnifying-glass absolute left-3 top-2 text-slate-400 text-xs"></i>
                        <input type="text" id="card-search" onkeyup="dataViews.filterCard()" placeholder="고객사, 사용처, 카드사 검색" class="border border-slate-300 rounded text-xs pl-8 pr-3 py-1.5 w-64 outline-none focus:border-teal-500 font-medium">
                    </div>
                </div>
                <div class="overflow-y-auto max-h-[600px] relative">
                    <table class="w-full text-left border-collapse whitespace-nowrap">
                        <thead class="bg-white text-[12px] text-slate-500 border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th class="px-4 py-3 font-bold">고객사명</th>
                                <th class="px-4 py-3 font-bold">주 사용 타행카드</th>
                                <th class="px-4 py-3 font-bold">주 결제 업종</th>
                                <th class="px-4 py-3 font-bold text-right">월 평균 결제액 (원)</th>
                                <th class="px-4 py-3 font-bold text-center">영업(Action)</th>
                            </tr>
                        </thead>
                        <tbody id="card-tbody" class="text-xs text-slate-700 divide-y divide-slate-100">
                            ${this.buildCardRows(this.getCardData())}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>`; 
    },
    initCardChart() { 
        const ctx = document.getElementById('cardChart').getContext('2d'); 
        const chart = new Chart(ctx, { 
            type: 'doughnut', 
            data: { labels: ['주유/교통비', '항공/숙박(출장)', '식대/접대비', '공과금/기타'], datasets: [{ data: [40, 35, 15, 10], backgroundColor: ['#0d9488', '#3b82f6', '#94a3b8', '#cbd5e1'], borderWidth: 2, borderColor: '#fff' }] }, 
            options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { position: 'right', labels: { boxWidth: 10, font: { size: 11, family: 'Pretendard' } } } } } 
        }); 
        app.chartInstances.push(chart); 
    },

    buildTaxRows(data) {
        if(data.length === 0) return `<tr><td colspan="5" class="text-center py-10 text-slate-500 font-bold">검색 결과가 없습니다.</td></tr>`;
        return data.map(item => `
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="px-4 py-3 text-center"><span class="${item.type === '매출' ? 'text-blue-700 bg-blue-50 border-blue-200' : 'text-red-600 bg-red-50 border-red-200'} font-bold px-2 py-0.5 rounded border text-[11px]">${item.type} 발생</span></td>
                <td class="px-4 py-3 font-bold text-slate-800 text-[13px]"><span onclick="app.openCustomer360('${item.partner}')" class="cursor-pointer text-teal-700 hover:text-teal-900 hover:underline transition-colors">${item.partner}</span></td>
                <td class="px-4 py-3 text-slate-600 font-medium">${item.item}</td>
                <td class="px-4 py-3 text-right font-mono font-bold text-slate-800 text-[13px]">${item.amount.toLocaleString()}</td>
                <td class="px-4 py-3 text-center">
                    ${item.status === '우량' 
                        ? `<span class="text-[11px] text-teal-700 font-bold border border-teal-200 bg-teal-50 px-2.5 py-1 rounded-full shadow-sm">매출 우량 (여신 상향 제안)</span>`
                        : `<span class="text-[11px] text-slate-500 font-bold bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">${item.status === '지출' ? '정기적 고정 지출' : '일반 거래 관찰'}</span>`}
                </td>
            </tr>
        `).join('');
    },

    filterTax() {
        const keyword = document.getElementById('tax-search').value.toLowerCase();
        const filtered = this.getTaxData().filter(i => i.partner.toLowerCase().includes(keyword) || i.item.toLowerCase().includes(keyword) || i.type.includes(keyword));
        document.getElementById('tax-tbody').innerHTML = this.buildTaxRows(filtered);
    },

    renderTax() { 
        return `
        <div class="max-w-[1400px] mx-auto flex flex-col h-full">
            <div class="grid grid-cols-2 gap-4 mb-4">
                <div class="bg-white border border-slate-200 p-4 rounded flex justify-between items-center shadow-sm"><div class="text-slate-800"><p class="text-[12px] font-bold text-slate-500 mb-1">당월 총 매출 세금계산서 수집액</p><h3 class="text-2xl font-black font-mono text-blue-700">3,450<span class="text-sm font-bold ml-1 text-slate-600">억 원</span></h3></div><i class="fa-solid fa-arrow-trend-up text-3xl text-blue-100"></i></div>
                <div class="bg-white border border-slate-200 p-4 rounded flex justify-between items-center shadow-sm"><div class="text-slate-800"><p class="text-[12px] font-bold text-slate-500 mb-1">당월 총 매입 세금계산서 수집액</p><h3 class="text-2xl font-black font-mono text-red-600">1,210<span class="text-sm font-bold ml-1 text-slate-600">억 원</span></h3></div><i class="fa-solid fa-arrow-trend-down text-3xl text-red-100"></i></div>
            </div>

            <div class="flex justify-between items-end mb-3 mt-2">
                <h2 class="text-[15px] font-bold text-slate-800 tracking-tight">수집된 세금계산서 기반 매입/매출 장부 (기업 여신 평가용)</h2>
                <button class="border border-slate-300 bg-white px-3 py-1.5 rounded text-xs font-bold text-slate-600 hover:bg-slate-50 shadow-sm"><i class="fa-solid fa-download mr-1.5"></i>전체 원장 엑셀 다운로드</button>
            </div>

            <div class="bg-white border border-slate-200 rounded overflow-hidden shadow-sm flex flex-col flex-1">
                <div class="px-4 py-3 border-b border-slate-200 bg-slate-50 flex space-x-3 items-center">
                    <div class="relative">
                        <i class="fa-solid fa-magnifying-glass absolute left-3 top-2 text-slate-400 text-xs"></i>
                        <input type="text" id="tax-search" onkeyup="dataViews.filterTax()" placeholder="거래처명, 품목, 구분(매출/매입) 검색" class="border border-slate-300 rounded text-xs pl-8 pr-3 py-1.5 w-72 outline-none focus:border-teal-500 font-medium">
                    </div>
                </div>
                <div class="overflow-y-auto max-h-[550px] relative">
                    <table class="w-full text-left whitespace-nowrap">
                        <thead class="bg-white text-[12px] text-slate-500 border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th class="px-4 py-3 font-bold w-24 text-center">발행 구분</th>
                                <th class="px-4 py-3 font-bold">거래처 (발행처)</th>
                                <th class="px-4 py-3 font-bold">품목 설명</th>
                                <th class="px-4 py-3 font-bold text-right">공급가액 합계 (원)</th>
                                <th class="px-4 py-3 font-bold text-center">여신/한도 평가 시스템 상태</th>
                            </tr>
                        </thead>
                        <tbody id="tax-tbody" class="text-xs text-slate-700 divide-y divide-slate-100">
                            ${this.buildTaxRows(this.getTaxData())}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        `; 
    }
};