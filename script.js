const STORAGE_KEY = "q-and-s-questions";

const starterQuestions = [
  {
    id: "starter-1",
    title: "HTMLだけでボタンをクリックできるようにするには？",
    body: "ボタンを押したときにJavaScriptで処理を実行したいです。どんな書き方がありますか？",
    category: "テクノロジー",
    answers: ["HTMLのbutton要素にonclick属性を使うか、addEventListenerでイベントを登録できます。"],
    createdAt: new Date().toISOString()
  },
  {
    id: "starter-2",
    title: "集中して勉強するおすすめの方法は？",
    body: "スマートフォンが気になって集中できません。試せる方法があれば教えてください。",
    category: "学習",
    answers: ["タイマーを使ったポモドーロ法がおすすめです。スマホは別の部屋に置くと効果的です。"],
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

function loadQuestions() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(starterQuestions));
    return starterQuestions;
  }

  try {
    return JSON.parse(saved);
  } catch {
    return starterQuestions;
  }
}

let questions = loadQuestions();

const questionList = document.querySelector("#questionList");
const questionCount = document.querySelector("#questionCount");
const dialog = document.querySelector("#questionDialog");
const template = document.querySelector("#questionTemplate");

function saveQuestions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
}

function formatDate(isoDate) {
  const date = new Date(isoDate);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function escapeHTML(value) {
  const element = document.createElement("div");
  element.textContent = value;
  return element.innerHTML;
}

function render(filter = "") {
  const keyword = filter.trim().toLowerCase();
  const filtered = questions.filter((question) => {
    const searchable = `${question.title} ${question.body} ${question.category}`.toLowerCase();
    return searchable.includes(keyword);
  });

  questionList.replaceChildren();
  questionCount.textContent = `${filtered.length}件`;

  if (filtered.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "該当する質問が見つかりませんでした。";
    questionList.append(empty);
    return;
  }

  filtered.forEach((question) => {
    const fragment = template.content.cloneNode(true);
    const card = fragment.querySelector(".question-card");

    fragment.querySelector(".category").textContent = question.category;
    fragment.querySelector("h3").textContent = question.title;
    fragment.querySelector(".question-body").textContent = question.body;
    fragment.querySelector(".answer-count").textContent = `回答 ${question.answers.length}件`;
    fragment.querySelector("time").textContent = formatDate(question.createdAt);

    const answers = fragment.querySelector(".answers");
    if (question.answers.length === 0) {
      answers.innerHTML = '<p class="answer">まだ回答がありません。</p>';
    } else {
      answers.innerHTML = question.answers
        .map((answer) => `<p class="answer">${escapeHTML(answer)}</p>`)
        .join("");
    }

    const answerForm = fragment.querySelector(".answer-form");
    answerForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = answerForm.elements.answer;
      const answer = input.value.trim();
      if (!answer) return;

      question.answers.push(answer);
      saveQuestions();
      render(document.querySelector("#searchInput").value);
    });

    questionList.append(fragment);
  });
}

function openQuestionForm() {
  if (typeof dialog.showModal === "function") {
    dialog.showModal();
  } else {
    dialog.setAttribute("open", "");
  }
}

function closeQuestionForm() {
  if (typeof dialog.close === "function") {
    dialog.close();
  } else {
    dialog.removeAttribute("open");
  }
}

document.addEventListener("click", (event) => {
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (action === "open-form") openQuestionForm();
  if (action === "close-form") closeQuestionForm();
  if (action === "show-questions") {
    document.querySelector(".questions-section").scrollIntoView({ behavior: "smooth" });
  }
});

document.querySelector("#questionForm").addEventListener("submit", (event) => {
  event.preventEvent?.();
  event.preventDefault();

  const title = document.querySelector("#questionTitle").value.trim();
  const body = document.querySelector("#questionBody").value.trim();
  const category = document.querySelector("#questionCategory").value;
  if (!title || !body) return;

  questions.unshift({
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    title,
    body,
    category,
    answers: [],
    createdAt: new Date().toISOString()
  });

  saveQuestions();
  event.currentTarget.reset();
  closeQuestionForm();
  render(document.querySelector("#searchInput").value);
});

document.querySelector("#searchForm").addEventListener("submit", (event) => {
  event.preventDefault();
  render(document.querySelector("#searchInput").value);
});

render();
