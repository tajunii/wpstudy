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
let currentWeek = 1;
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

// ====================
// 페이지 전환 (핵심)
// ====================

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
        if(!currentQuiz) {
            nextQuiz();
        }
    }
}

function getStudyData(){
    return {
        words: wordData,
        patterns: patternData
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
        <div class="card-japanese">${item.word} <span>(${item.furigana})</span></div>
        <div class="card-meanings">
            <div class="meaning-item"><span class="meaning-badge">1</span> ${item.meaning1}</div>
            ${item.meaning2 ? `<div class="meaning-item"><span class="meaning-badge">2</span> ${item.meaning2}</div>` : ''}
        </div>
        <div class="card-divider"></div>
        <div class="card-examples">
            <div class="example-block">
                <div class="ex-ja">${item.example1}</div>
                <div class="ex-reading">(${item.reading1})</div>
                <div class="ex-ko">${item.translation1}</div>
            </div>
            <div class="example-block">
                <div class="ex-ja">${item.example2}</div>
                <div class="ex-reading">(${item.reading2})</div>
                <div class="ex-ko">${item.translation2}</div>
            </div>
        </div>
        `;
    } else {
        card.innerHTML = `
        <div class="card-japanese">${item.pattern}</div>
        <div class="card-meanings">
            <div class="meaning-item"><span class="meaning-badge">1</span> ${item.meaning1}</div>
            ${item.meaning2 ? `<div class="meaning-item"><span class="meaning-badge">2</span> ${item.meaning2}</div>` : ''}
        </div>
        <div class="card-usage">💡 활용법: ${item.usage}</div>
        <div class="card-divider"></div>
        <div class="card-examples">
            <div class="example-block">
                <div class="ex-ja">${item.example1}</div>
                <div class="ex-reading">(${item.reading1})</div>
                <div class="ex-ko">${item.translation1}</div>
            </div>
            <div class="example-block">
                <div class="ex-ja">${item.example2}</div>
                <div class="ex-reading">(${item.reading2})</div>
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

    wordData.forEach(w=>{
        quizData.push({
            question:w.translation1,
            answer:w.example1,
            reading:w.reading1
        });

        quizData.push({
            question:w.translation2,
            answer:w.example2,
            reading:w.reading2
        });
    });

    patternData.forEach(p=>{
        quizData.push({
            question:p.translation1,
            answer:p.example1,
            reading:p.reading1
        });

        quizData.push({
            question:p.translation2,
            answer:p.example2,
            reading:p.reading2
        });
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
        <div>${currentQuiz.answer}</div>
        <div class="answer-reading">(${currentQuiz.reading})</div>
    `;
    answer.classList.add("reveal");
}

// ====================
// 시작
// ====================

async function loadData(){
    // 로컬 백업 데이터가 존재하는 경우 즉시 초기화하여 앱이 멈추지 않게 함
    if (isDataReady) {
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
