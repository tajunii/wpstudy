// ====================
// 데이터
// ====================

let wordData = (typeof localWordData !== "undefined") ? localWordData : [];

let patternData = (typeof localPatternData !== "undefined") ? localPatternData : [];

// ====================
// 상태
// ====================

let mode = "word";
let currentIndex = 0;

let quizData = [];
let currentQuiz;
let currentWeek = "all";
let isDataReady = (wordData.length > 0 || patternData.length > 0);

// ====================
// DOM
// ====================

const menuPage = document.getElementById("menuPage");
const studyPage = document.getElementById("studyPage");
const quizPage = document.getElementById("quizPage");

const card = document.getElementById("card");
const question = document.getElementById("question");
const answer = document.getElementById("answer");
const weekSelect = document.getElementById("weekSelect");

// ====================
// 페이지 전환 (핵심)
// ====================

// (수정된 코드)
function showPage(page){

    document.querySelectorAll(".page").forEach(p=>{
        p.classList.remove("active");
    });
    
    // 네비게이션 버튼 활성화 스타일 업데이트
    document.querySelectorAll("#nav button").forEach(btn => {
        btn.classList.remove("active-nav");
    });
    const targetBtn = document.querySelector(`#nav button[onclick*="showPage('${page}')"]`);
    if(targetBtn) targetBtn.classList.add("active-nav");

    if(page === "menu") menuPage.classList.add("active");
    if(page === "study") {
        studyPage.classList.add("active");
        showCard();
    }
    if(page === "quiz") {
        quizPage.classList.add("active");
        
        // --- 수정된 부분: 퀴즈 페이지 진입 시 무조건 초기화 ---
        // 만약 이미 진행 중인 퀴즈가 있었다면 화면만 닫아주고,
        // 완전히 비어있다면 새 퀴즈를 불러옵니다.
        if (answer) {
            answer.classList.remove("reveal");
        }
        
        if(!currentQuiz) {
            nextQuiz();
        }
        // -----------------------------------------------------
    }
}

function getStudyData(){
    let words = wordData;
    let patterns = patternData;

    if (currentWeek !== "all") {
        words = wordData.filter(w => String(w.week) === String(currentWeek));
        patterns = patternData.filter(p => String(p.week) === String(currentWeek));
    }

    return {
        words: words,
        patterns: patterns
    };
}

// ====================
// 공부
// ====================

function setMode(m){

    if(!isDataReady){
        alert("데이터를 불러오는 중입니다.");
        return;
    }

    mode = m;
    currentIndex = 0;
    
    // 탭 버튼 선택 스타일 적용
    document.querySelectorAll(".tabs button").forEach(btn => {
        btn.classList.remove("active-tab-word", "active-tab-pattern");
    });
    const tabWord = document.getElementById("tab-word");
    const tabPattern = document.getElementById("tab-pattern");
    if (m === "word" && tabWord) tabWord.classList.add("active-tab-word");
    if (m === "pattern" && tabPattern) tabPattern.classList.add("active-tab-pattern");
    
    // 카드 Glow 모드 클래스 적용
    if (card) {
        card.className = (m === "word") ? "word-mode" : "pattern-mode";
    }

    showCard();
}

// ====================
// TTS (음성 합성) 기능
// ====================

function speak(text, lang = 'ja-JP') {
    if ('speechSynthesis' in window) {
        // 기존 음성 중단
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        
        // 일본어 전용 보이스 매칭 시도
        const voices = window.speechSynthesis.getVoices();
        const jpVoice = voices.find(v => v.lang.includes('ja-JP') || v.lang.includes('ja_JP'));
        if (jpVoice) {
            utterance.voice = jpVoice;
        }
        
        window.speechSynthesis.speak(utterance);
    } else {
        console.warn("이 브라우저는 TTS(음성 합성)를 지원하지 않습니다.");
    }
}

// 브라우저 보이스 로드 최적화 (일부 브라우저 대응)
if ('speechSynthesis' in window) {
    window.speechSynthesis.getVoices();
}

function showCard(){

    const study = getStudyData();
    const data = (mode === "word") ? study.words : study.patterns;

    if(!data || data.length === 0){
        card.innerHTML = "데이터 없음";
        return;
    }

    if(!data[currentIndex]){
        card.innerHTML = "항목 없음";
        return;
    }

    const item = data[currentIndex];

    if(mode === "word"){
        card.innerHTML = `
        <div class="card-japanese tts-clickable" onclick="speak('${item.word.replace(/'/g, "\\'")}')">${item.word} <span>(${item.furigana})</span></div>
        <div class="card-meanings">
            <div class="meaning-item"><span class="meaning-badge">1</span> ${item.meaning1}</div>
            ${item.meaning2 ? `<div class="meaning-item"><span class="meaning-badge">2</span> ${item.meaning2}</div>` : ''}
        </div>
        <div class="card-divider"></div>
        <div class="card-examples">
            <div class="example-block">
                <div class="ex-ja tts-clickable" onclick="speak('${item.example1.replace(/'/g, "\\'")}')">${item.example1}</div>
                <div class="ex-ko">${item.translation1}</div>
            </div>
            <div class="example-block">
                <div class="ex-ja tts-clickable" onclick="speak('${item.example2.replace(/'/g, "\\'")}')">${item.example2}</div>
                <div class="ex-ko">${item.translation2}</div>
            </div>
        </div>
        `;
    } else {
        card.innerHTML = `
        <div class="card-japanese tts-clickable" onclick="speak('${item.pattern.replace(/'/g, "\\'")}')">${item.pattern}</div>
        <div class="card-meanings">
            <div class="meaning-item"><span class="meaning-badge">1</span> ${item.meaning1}</div>
            ${item.meaning2 ? `<div class="meaning-item"><span class="meaning-badge">2</span> ${item.meaning2}</div>` : ''}
        </div>
        <div class="card-usage">💡 활용법: ${item.usage}</div>
        <div class="card-divider"></div>
        <div class="card-examples">
            <div class="example-block">
                <div class="ex-ja tts-clickable" onclick="speak('${item.example1.replace(/'/g, "\\'")}')">${item.example1}</div>
                <div class="ex-ko">${item.translation1}</div>
            </div>
            <div class="example-block">
                <div class="ex-ja tts-clickable" onclick="speak('${item.example2.replace(/'/g, "\\'")}')">${item.example2}</div>
                <div class="ex-ko">${item.translation2}</div>
            </div>
        </div>
        `;
    }
}

function nextCard(){

    if(!isDataReady) return;

    const study = getStudyData();
    const data = (mode === "word") ? study.words : study.patterns;

    if(data.length === 0) return;

    currentIndex = (currentIndex + 1) % data.length;
    showCard();
}

function prevCard(){

    if(!isDataReady) return;

    const study = getStudyData();
    const data = (mode === "word") ? study.words : study.patterns;

    if(data.length === 0) return;

    currentIndex = (currentIndex - 1 + data.length) % data.length;
    showCard();
}

// ====================
// 퀴즈
// ====================

function buildQuiz(){

    quizData = [];
    const study = getStudyData();

    study.words.forEach(w=>{

    if(w.translation1){
        quizData.push({
            question:w.translation1,
            answer:w.example1,
            reading:w.reading1
        });
    }

    if(w.translation2){
        quizData.push({
            question:w.translation2,
            answer:w.example2,
            reading:w.reading2
        });
    }

});

    study.patterns.forEach(p=>{

    if (p.translation1 && p.example1) {
        quizData.push({
            question: p.translation1,
            answer: p.example1,
            reading: p.reading1
        });
    }

    if (p.translation2 && p.example2) {
        quizData.push({
            question: p.translation2,
            answer: p.example2,
            reading: p.reading2
        });
    }

});
}

function nextQuiz(){

    if(quizData.length === 0) return;

    const i = Math.floor(Math.random() * quizData.length);
    currentQuiz = quizData[i];

    question.innerHTML = currentQuiz.question;
    answer.innerHTML = "";
    answer.classList.remove("reveal");
}

function showAnswer(){

    if(!currentQuiz) return;

    answer.innerHTML = `
        <div class="tts-clickable" onclick="speak('${currentQuiz.answer.replace(/'/g, "\\'")}')">${currentQuiz.answer}</div>
        <div class="answer-reading">(${currentQuiz.reading})</div>
    `;
    answer.classList.add("reveal");
    
    // 정답 공개 시 음성 자동 재생 (공부 편의성)
    speak(currentQuiz.answer);
}

// ====================
// 시작
// ====================

async function loadData(){
    // 로컬 백업 데이터가 존재하는 경우 즉시 초기화하여 앱이 멈추지 않게 함
    if (isDataReady) {
        updateWeekSelect();
        buildQuiz();
        showPage("menu");
    }

    try {
        const wordCSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRTUWrzsscnZ3sHRvSenqLY4o1c-mkvZLYV9GDTdhjvwkyBI7AYjkIRGFKX3Qjdftb7NL5m6HGnAYwS/pub?gid=0&single=true&output=csv";
        const patternCSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRTUWrzsscnZ3sHRvSenqLY4o1c-mkvZLYV9GDTdhjvwkyBI7AYjkIRGFKX3Qjdftb7NL5m6HGnAYwS/pub?gid=97570951&single=true&output=csv";

        console.log("Fetching word CSV...");
        const wordRes = await fetch(wordCSV);
        if (!wordRes.ok) throw new Error(`단어 데이터를 가져오는데 실패했습니다: ${wordRes.status}`);
        const wordText = await wordRes.text();

        console.log("Fetching pattern CSV...");
        const patternRes = await fetch(patternCSV);
        if (!patternRes.ok) throw new Error(`문형 데이터를 가져오는데 실패했습니다: ${patternRes.status}`);
        const patternText = await patternRes.text();

        wordData = parseCSV(wordText);
        patternData = parsePatternCSV(patternText);

        updateWeekSelect();
        buildQuiz();
        isDataReady = true;
        
        // 데이터가 새로 동기화되면 뷰를 업데이트함
        const activePage = document.querySelector(".page.active");
        if (activePage) {
            if (activePage.id === "studyPage") showCard();
            else if (activePage.id === "quizPage" && !currentQuiz) nextQuiz();
        } else {
            showPage("menu");
        }
        console.log("Data loaded and synced successfully from Google Sheets.");
    } catch (error) {
        console.warn("구글 스프레드시트 데이터 동기화 실패 (로컬 백업 데이터 사용):", error.message);
        // 로컬 데이터도 없고 동기화도 실패한 경우에만 경고창 표시
        if (!isDataReady) {
            alert(`데이터를 로딩하는 중 오류가 발생했습니다.\n\n오류 내용: ${error.message}\n\n로컬 서버를 빌드하거나 브라우저 설정을 확인하세요.`);
        }
    }
}

function updateWeekSelect(){
    if (!weekSelect) return;
    
    const weeks = new Set();
    wordData.forEach(item => { if(item.week) weeks.add(item.week); });
    patternData.forEach(item => { if(item.week) weeks.add(item.week); });
    
    const sortedWeeks = Array.from(weeks).sort((a, b) => {
        const numA = parseInt(a, 10);
        const numB = parseInt(b, 10);
        if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
        }
        return String(a).localeCompare(String(b));
    });
    
    let html = '<option value="all">전체보기</option>';
    sortedWeeks.forEach(w => {
        html += `<option value="${w}">${w}주차</option>`;
    });
    
    const previousValue = weekSelect.value;
    weekSelect.innerHTML = html;
    
    if (sortedWeeks.includes(previousValue) || previousValue === "all") {
        weekSelect.value = previousValue;
    } else {
        weekSelect.value = "all";
        currentWeek = "all";
    }
}

function changeWeek(val){
    currentWeek = val;
    buildQuiz();
    currentIndex = 0;
    
    const activePage = document.querySelector(".page.active");
    if (activePage) {
        if (activePage.id === "studyPage") {
            showCard();
        } else if (activePage.id === "quizPage") {
            nextQuiz();
        }
    }
}

function parsePatternCSV(text){

    const rows = text.trim().split("\n").slice(1).filter(line => line.trim() !== "");

    return rows.map(line => {

        const cols = line.split(",").map(v => v.replace(/"/g,"").trim());

        return {
            pattern: cols[0] || "",
            meaning1: cols[1] || "",
            meaning2: cols[2] || "",
            usage: cols[3] || "",
            example1: cols[4] || "",
            reading1: cols[5] || "",
            translation1: cols[6] || "",
            example2: cols[7] || "",
            reading2: cols[8] || "",
            translation2: cols[9] || "",
            week: cols[10] || ""
        };
    });
}

function parseCSV(text){

    const rows = text.trim().split("\n").slice(1).filter(line => line.trim() !== "");

    return rows.map(line => {

        const cols = line.split(",").map(v => v.replace(/"/g,"").trim());

        return {
            word: cols[0] || "",
            furigana: cols[1] || "",
            meaning1: cols[2] || "",
            meaning2: cols[3] || "",
            example1: cols[4] || "",
            reading1: cols[5] || "",
            translation1: cols[6] || "",
            example2: cols[7] || "",
            reading2: cols[8] || "",
            translation2: cols[9] || "",
            week: cols[10] || ""
        };
    });
}

loadData();
