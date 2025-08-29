let questions = [];
let currentQuestionIndex = 0;
let scores = {};
let currentAnswer = null;
let previousAnswers = [];
let languageInfo = {};

let quizContainer = document.querySelector(".quiz-container");
let startScreen = document.getElementById("start-screen");
let startBtn = document.getElementById("start-btn");

const questionContainer = document.getElementById("question-container");
const answersContainer = document.getElementById("answers-container");
const nextBtn = document.getElementById("next-btn");
const prevBtn = document.getElementById("prev-btn");
const progress = document.getElementById("progress");
const resultContainer = document.getElementById("result-container");
const languageButtonsContainer = document.getElementById("language-buttons");
const chartContainer = document.getElementById("chart-container");

const popup = document.getElementById("info-popup");
const popupTitle = document.getElementById("popup-title");
const popupList = document.getElementById("popup-list");
const popupJob = document.getElementById("popup-job");
const closePopupBtn = document.getElementById("close-popup");

// Fragen laden
fetch("questions.json")
  .then(res => res.json())
  .then(data => {
    questions = data.questions;
    languageInfo = data.languages;

    // Punkte initialisieren
    for (let lang in languageInfo) scores[lang] = 0;
    initChart();

    // Startbutton aktiv
    startBtn.addEventListener("click", () => {
      startScreen.style.display = "none";
      quizContainer.style.display = "block";
      showQuestion();
    });
  })
  .catch(err => console.error("Fehler beim Laden der Fragen:", err));

// Diagramm initialisieren
function initChart() {
  chartContainer.innerHTML = "";
  for (let lang in scores) {
    const bar = document.createElement("div");
    bar.classList.add("bar");
    bar.id = `bar-${lang}`;
    bar.style.height = "0px";
    bar.innerHTML = `<span>${lang}</span>`;
    chartContainer.appendChild(bar);
  }
}

// Diagramm aktualisieren
function updateChart() {
  const maxHeight = 150;
  const maxPoints = Math.max(...Object.values(scores), 1);
  for (let lang in scores) {
    const bar = document.getElementById(`bar-${lang}`);
    const height = (scores[lang] / maxPoints) * maxHeight;
    bar.style.height = `${height}px`;
    bar.style.background = "#8b5cf6";
  }
}

// Frage anzeigen
function showQuestion() {
  const q = questions[currentQuestionIndex];
  questionContainer.innerText = q.question;
  answersContainer.innerHTML = "";

  q.answers.forEach(answer => {
    const btn = document.createElement("button");
    btn.innerText = answer.text;
    btn.onclick = () => selectAnswer(answer, btn);
    answersContainer.appendChild(btn);
  });

  progress.innerText = `Frage ${currentQuestionIndex + 1} von ${questions.length}`;

  // Buttons immer sichtbar
  prevBtn.style.display = "inline-block";
  nextBtn.style.display = "inline-block";

  // Buttons deaktivieren/aktivieren
  prevBtn.disabled = currentQuestionIndex === 0;
  nextBtn.disabled = currentAnswer ? false : true;

  // Bereits gewählte Antwort wieder aktivieren
  const prev = previousAnswers[currentQuestionIndex];
  currentAnswer = prev || null;

  if (prev) {
    Array.from(answersContainer.children).forEach(b => {
      if (b.innerText === prev.text) b.disabled = true;
    });
    nextBtn.disabled = false;
  }

  updateChart();
}

// Auswahl einer Antwort
function selectAnswer(answer, btn){
  const prevAnswer = previousAnswers[currentQuestionIndex];
  if(prevAnswer){
    for(let lang in prevAnswer.points) scores[lang] -= prevAnswer.points[lang];
  }

  currentAnswer = answer;

  for(let lang in answer.points){
    scores[lang] += answer.points[lang];
  }

  previousAnswers[currentQuestionIndex] = answer;

  // Buttons aktualisieren
  Array.from(answersContainer.children).forEach(b => b.disabled = false);
  btn.disabled = true;
  nextBtn.disabled = false;

  updateChart();
}

// Weiter-Button
nextBtn.addEventListener("click", () => {
  currentAnswer = null;
  currentQuestionIndex++;
  if(currentQuestionIndex < questions.length) showQuestion();
  else showResult();
});

// Zurück-Button
prevBtn.addEventListener("click", () => {
  if(currentQuestionIndex === 0) return;

  const prevAnswer = previousAnswers[currentQuestionIndex];
  if(prevAnswer){
    for(let lang in prevAnswer.points) scores[lang] -= prevAnswer.points[lang];
  }

  currentQuestionIndex--;
  currentAnswer = null;
  showQuestion();
});

// Ergebnis anzeigen
function showResult() {
  quizContainer.style.display = "none";
  resultContainer.style.display = "block";

  const sorted = Object.entries(scores).sort((a,b)=>b[1]-a[1]);
  languageButtonsContainer.innerHTML = "";

  sorted.forEach(([lang, score], i)=>{
    const btn = document.createElement("button");
    btn.classList.add("lang-btn");
    btn.innerText = `${i<3?"⭐ ":""}${lang} (${score} Punkte)`;
    btn.addEventListener("click", ()=>showLanguageInfo(lang));
    languageButtonsContainer.appendChild(btn);
  });

  updateChart();
}

// Popup anzeigen
function showLanguageInfo(lang){
  popupTitle.innerText = lang;
  popupList.innerHTML = "";
  languageInfo[lang].usage.forEach(item=>{
    const li = document.createElement("li");
    li.innerText = item;
    popupList.appendChild(li);
  });
  popupJob.innerText = languageInfo[lang].job;
  popup.style.display = "block";
}

// Popup schließen / Fade-Out
closePopupBtn.addEventListener("click", ()=>{
  popup.style.opacity = "1";
  let fade = setInterval(() => {
    if(popup.style.opacity > 0){
      popup.style.opacity -= 0.1;
    } else {
      clearInterval(fade);
      popup.style.display = "none";
      popup.style.opacity = "1";
    }
  }, 20);
});




