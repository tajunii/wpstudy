// ====================
// 데이터
// ====================

let wordData = [];

let patternData = [];

// ====================
// 상태
// ====================

let mode = "word";
let currentIndex = 0;

let quizData = [];
let currentQuiz;
let currentWeek = 1;
let isDataReady = false;

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

    if(page === "menu") menuPage.classList.add("active");
    if(page === "study") studyPage.classList.add("active");
    if(page === "quiz") quizPage.classList.add("active");
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
        <h2>${item.word} (${item.furigana})</h2>
        ① ${item.meaning1}<br>
        ② ${item.meaning2}
        <hr>
        ${item.example1}<br>
        (${item.reading1})<br>
        ${item.translation1}
        <hr>
        ${item.example2}<br>
        (${item.reading2})<br>
        ${item.translation2}
        `;
    } else {
        card.innerHTML = `
        <h2>${item.pattern}</h2>
        ① ${item.meaning1}<br>
        ② ${item.meaning2}
        <hr>
        ${item.usage}
        <hr>
        ${item.example1}<br>
        (${item.reading1})<br>
        ${item.translation1}
        <hr>
        ${item.example2}<br>
        (${item.reading2})<br>
        ${item.translation2}
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
}

function showAnswer(){

    if(!currentQuiz) return;

    answer.innerHTML = `
        ${currentQuiz.answer}
        <br>
        (${currentQuiz.reading})
    `;
}

// ====================
// 시작
// ====================

async function loadData(){

    const wordCSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRTUWrzsscnZ3sHRvSenqLY4o1c-mkvZLYV9GDTdhjvwkyBI7AYjkIRGFKX3Qjdftb7NL5m6HGnAYwS/pub?gid=0&single=true&output=csv";
    const patternCSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRTUWrzsscnZ3sHRvSenqLY4o1c-mkvZLYV9GDTdhjvwkyBI7AYjkIRGFKX3Qjdftb7NL5m6HGnAYwS/pub?gid=97570951&single=true&output=csv";

    const wordRes = await fetch(wordCSV);
    const wordText = await wordRes.text();

    const patternRes = await fetch(patternCSV);
    const patternText = await patternRes.text();

    wordData = parseCSV(wordText);
    patternData = parseCSV(patternText);

    buildQuiz();
    isDataReady = true;
    showPage("menu");
}

function parsePatternCSV(text){

    const rows = text.trim().split("\n").slice(1);

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

    const rows = text.trim().split("\n").slice(1);

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

