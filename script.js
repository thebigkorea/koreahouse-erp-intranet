const todayEl=document.getElementById('today');
if(todayEl) todayEl.textContent=new Intl.DateTimeFormat('ko-KR',{dateStyle:'full'}).format(new Date());
const PASSWORD='1234';
    function secureOpen(message,url){const pw=prompt(message);if(pw===null)return;if(pw!==PASSWORD){alert('비밀번호가 올바르지 않습니다.');return}window.open(url,'_blank')}
    function openContractLedger(){secureOpen('근로계약서 원장조회 비밀번호를 입력하세요.','https://docs.google.com/spreadsheets/d/1sSKno2C3Gnvx-FwfEru_rsP0QWzliWcVEQIKe9vXFqc/edit?gid=1591232369#gid=1591232369')}
    function openOvertimePage(url){secureOpen('초과근무 관리 비밀번호를 입력하세요.',url)}
    function openHrLedger(){secureOpen('인사관리대장 비밀번호를 입력하세요.','https://thebigkorea.github.io/hr-system/hr-list.html')}
    function openHrSheet(){secureOpen('인사 원장조회 비밀번호를 입력하세요.','https://docs.google.com/spreadsheets/d/1sSKno2C3Gnvx-FwfEru_rsP0QWzliWcVEQIKe9vXFqc/edit?gid=0#gid=0')}
    function openApplicantSheet(){secureOpen('지원자 원장조회 비밀번호를 입력하세요.','https://docs.google.com/spreadsheets/d/1WgLVb-hTehmz2huM5e-gyds1s8aX-7eBhMCYVZEyFDM/edit?gid=1278172800#gid=1278172800')}
    function openAttendanceAdmin(){secureOpen('출퇴근 관리자 조회 비밀번호를 입력하세요.','https://thebigkorea.github.io/koreahouse-attendance/admin.html')}
    function openAttendanceManage(){secureOpen('출퇴근 관리 비밀번호를 입력하세요.','https://thebigkorea.github.io/koreahouse-attendance/admin.html')}
    function openStaffList(){secureOpen('직원 목록 비밀번호를 입력하세요.','https://docs.google.com/spreadsheets/d/1y1f4noa90DCA_YxZYx9MXe_A523Z5g2raeLU4d4wwb4/edit?gid=422940514#gid=422940514')}

    const KOREA_DAILY_WORKER_API_URL='https://script.google.com/macros/s/AKfycbz_NFlMRhx_mP_0maccpd62iWNHGMVo-pAZCHg7s8-tM26QvKlIVrPL6TmElRgM6XIS/exec';
    const APPLICANT_API_URL='https://script.google.com/macros/s/AKfycbwNqmreZsa_YpzlTQxL4HzkklxxI1wie-ujq-BLeLgtUqPt-_ti4_W1MdbJ0Qf-eIaWJA/exec';
    const CONTRACT_API_URL='https://script.google.com/macros/s/AKfycbzCO4TLMRGgt_OY-3T92mw58AAKcOwquq0ubepUEJgPO9YPeMV-hNeP7AHy7lvOPog7oQ/exec';
    const HEALTH_CERT_API_URL='https://script.google.com/macros/s/AKfycby-FdNL_GsXFB4klTrk8fM6YB7Fgkoh0-we-D48z9o34d0OUy09PtHuAaCIAfngIqs7/exec';

    function showBadge(ids,count){
      ids.forEach(function(id){
        const badge=document.getElementById(id);
        if(!badge)return;
        if(count>0){
          badge.textContent=count>99?'99+':String(count);
          badge.style.setProperty('display','grid','important');
        }else{
          badge.textContent='0';
          badge.style.setProperty('display','none','important');
        }
      });
    }

    async function loadDailyUnpaidBadges(){
      try{
        const response=await fetch(KOREA_DAILY_WORKER_API_URL+'?action=getDailyUnpaidCount&t='+Date.now(),{cache:'no-store'});
        const data=await response.json();
        showBadge(['koreaDailyUnpaidBadgeTop','koreaDailyUnpaidBadge','dailyUnpaidBadgeReport'],Number(data.count||data.unpaidCount||0));
      }catch(error){
        console.log('일용직 미입력 배지 조회 실패',error);
      }
    }

    async function loadTodayInterviewBadge(){
      try{
        const response=await fetch(APPLICANT_API_URL+'?action=getTodayInterviewCount&t='+Date.now(),{cache:'no-store'});
        const data=await response.json();
        showBadge(['todayInterviewBadgeTop','todayInterviewBadge'],Number(data.count||0));
      }catch(error){
        console.log('오늘 면접 배지 조회 실패',error);
      }
    }

    function parseContractDate(value){
      if(!value)return null;
      const match=String(value).trim().match(/(\d{4})[^\d]+(\d{1,2})[^\d]+(\d{1,2})/);
      if(match)return new Date(Number(match[1]),Number(match[2])-1,Number(match[3]));
      const date=new Date(value);
      return isNaN(date.getTime())?null:date;
    }

    async function loadContractExpireBadge(){
      try{
        const response=await fetch(CONTRACT_API_URL,{method:'POST',body:JSON.stringify({action:'getContractList'})});
        const data=await response.json();
        const today=new Date();
        today.setHours(0,0,0,0);
        const count=(data.contracts||[]).filter(function(contract){
          const end=parseContractDate(contract.endDate);
          if(!end)return false;
          end.setHours(0,0,0,0);
          const days=Math.ceil((end-today)/86400000);
          return days>=0&&days<=30;
        }).length;
        showBadge(['contractExpireBadge'],count);
      }catch(error){
        console.log('계약 만료 배지 조회 실패',error);
      }
    }

    async function loadHealthCertBadge(){
      try{
        const response=await fetch(HEALTH_CERT_API_URL+'?action=badge&t='+Date.now(),{cache:'no-store'});
        const data=await response.json();
        showBadge(['healthCertBadge','healthCertBadgeTop'],Number(data.count||0));
      }catch(error){
        console.log('보건증 배지 조회 실패',error);
      }
    }

    document.addEventListener('DOMContentLoaded',function(){
      loadDailyUnpaidBadges();
      loadTodayInterviewBadge();
      loadContractExpireBadge();
      loadHealthCertBadge();
    });

const now=new Date();
  const month=String(now.getMonth()+1).padStart(2,'0');
  const monthInput=document.getElementById('baseMonth');
  if(monthInput) monthInput.value=now.getFullYear()+'-'+month;

  document.querySelectorAll('.side-link,.side-home').forEach(function(a){
    a.addEventListener('click',function(){document.body.classList.remove('menu-open')});
  });

  const _showBadge=window.showBadge;
  if(typeof _showBadge==='function'){
    window.showBadge=function(ids,count){
      _showBadge(ids,count);
      const n=Number(count||0);
      if(ids.includes('todayInterviewBadge') || ids.includes('todayInterviewBadgeTop')){
        const el=document.getElementById('statusInterview'); if(el) el.textContent=n+'건';
      }
      if(ids.includes('healthCertBadge')){
        const el=document.getElementById('statusHealth'); if(el) el.textContent=n+'건';
      }
      if(ids.includes('koreaDailyUnpaidBadge')){
        const el=document.getElementById('statusDaily'); if(el) el.textContent=n+'건';
      }
      if(ids.includes('contractExpireBadge')){
        const el=document.getElementById('statusContract'); if(el) el.textContent=n+'건';
      }
    }
  }


/* ===== ERP 좌측 메뉴 화면 전환 ===== */
const ERP_PAGES = {
  home: { title:'ERP 홈', desc:'한국의집 매장 운영현황과 주요 업무를 한눈에 확인합니다.' },
  store: { title:'매장관리', desc:'한국의집 매장 운영 입력과 주요 관리 원장을 확인합니다.' },
  reservation: { title:'예약 · 고객', desc:'예약, 고객 CRM 및 문자 업무를 관리합니다.' },
  schedule: { title:'근무스케줄', desc:'주간·월간 근무표와 스케줄 원장을 관리합니다.' },
  order: { title:'발주관리', desc:'식자재와 비품 발주 업무를 관리합니다.' },
  performance: { title:'매출 · 실적', desc:'일일 영업실적 입력과 경영 대시보드를 확인합니다.' },
  hr: { title:'통합인사', desc:'직원정보, 인사대장 및 보건증을 관리합니다.' },
  attendance: { title:'근태 · 휴가', desc:'출퇴근, 초과근무 및 연월차 업무를 관리합니다.' },
  contract: { title:'전자계약', desc:'근로계약서와 재직·경력 증명 업무를 관리합니다.' },
  payroll: { title:'급여관리', desc:'한국의집 직원 급여를 조회·계산·확정합니다.' },
  daily: { title:'일용직 · 알바', desc:'일용직 및 아르바이트 근로내역과 지급을 관리합니다.' },
  recruit: { title:'채용 · 퇴직', desc:'지원자, 면접, 외국인 비자 및 퇴직 업무를 관리합니다.' },
  ledger: { title:'원장 · 자료', desc:'인사·지원자·계약·퇴직 관련 원장과 관리자 자료를 조회합니다.' }
};

function showErpPage(pageId, updateHash=true){
  const page = ERP_PAGES[pageId] ? pageId : 'home';
  const isHome = page === 'home';
  const homeViews = document.querySelectorAll('.home-view');
  const workArea = document.getElementById('workArea');
  const modules = document.querySelectorAll('#workArea .module');

  homeViews.forEach(el => { el.hidden = !isHome; });
  if(workArea) workArea.hidden = isHome;
  modules.forEach(el => { el.hidden = isHome || el.id !== page; });

  const meta = ERP_PAGES[page];
  const title = document.getElementById('pageTitle');
  const desc = document.getElementById('pageDesc');
  if(title) title.textContent = meta.title;
  if(desc) desc.textContent = meta.desc;

  document.querySelectorAll('.side-home,.side-link').forEach(link => {
    const target=(link.getAttribute('href')||'').replace('#','');
    link.classList.toggle('active', target === page);
  });

  document.body.classList.remove('menu-open');
  window.scrollTo({top:0,behavior:'auto'});
  if(updateHash && location.hash !== '#'+page){
    history.replaceState(null,'','#'+page);
  }
}

document.querySelectorAll('.side-home,.side-link').forEach(link => {
  link.addEventListener('click', function(e){
    const page=(this.getAttribute('href')||'').replace('#','');
    if(ERP_PAGES[page]){
      e.preventDefault();
      showErpPage(page);
    }
  });
});

window.addEventListener('hashchange', function(){
  showErpPage((location.hash||'#home').slice(1), false);
});

showErpPage((location.hash||'#home').slice(1), false);
