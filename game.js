const MAX_LIVES = 10;

const CHARACTERS = [
  { name: "Frodo Pytlík", hint: "Nositel Prstenu z Kraje" },
  { name: "Samvěd Křepelka", hint: "Věrný zahradník a přítel" },
  { name: "Gandalf", hint: "Šedý, později bílý čaroděj" },
  { name: "Aragorn", hint: "Dědic Isildurův a král" },
  { name: "Legolas", hint: "Elfský lučištník z Temného hvozdu" },
  { name: "Gimli", hint: "Trpasličí válečník syn Glóinův" },
  { name: "Boromir", hint: "Syn správce Gondoru" },
  { name: "Faramir", hint: "Kapitán z Ithilienu" },
  { name: "Gollum", hint: "Bývalý nositel Prstenu" },
  { name: "Sauron", hint: "Temný pán Mordoru" },
  { name: "Saruman", hint: "Bílý čaroděj z Železného pasu" },
  { name: "Elrond", hint: "Pán Roklinky" },
  { name: "Galadriel", hint: "Paní Lothlórienu" },
  { name: "Arwen", hint: "Večernice, dcera Elrondova" },
  { name: "Éowyn", hint: "Štítová panna z Rohanu" },
  { name: "Théoden", hint: "Král Rohanu" },
  { name: "Éomer", hint: "Maršál marky" },
  { name: "Bilbo Pytlík", hint: "Hobit, který našel Prsten" },
  { name: "Stromovous", hint: "Nejstarší z Entů" },
  { name: "Tom Bombadil", hint: "Starý pán z Hvozdna" },
  { name: "Isildur", hint: "Ten, kdo sňal Prsten Sauronovi" },
  { name: "Smaug", hint: "Drak z Osamělé hory" },
  { name: "Červivec", hint: "Rádce krále, který šeptá jed" },
  { name: "Meriadoc Brandorád", hint: "Hobit z Rádovska" },
  { name: "Peregrin Bral", hint: "Zvědavý hobit z rodu Bralů" },
];

const KEYS = "aábcčdďeéěfghiíjklmnňoópqrřsštťuúůvwxyýzž".split("");

const wordEl = document.getElementById("word");
const usedEl = document.getElementById("used");
const ringsEl = document.getElementById("rings");
const livesCountEl = document.getElementById("lives-count");
const letterCountEl = document.getElementById("letter-count");
const hintEl = document.getElementById("hint");
const formEl = document.getElementById("guess-form");
const inputEl = document.getElementById("letter-input");
const guessBtn = document.getElementById("guess-btn");
const messageEl = document.getElementById("message");
const overlayEl = document.getElementById("overlay");
const modalEyebrow = document.getElementById("modal-eyebrow");
const modalTitle = document.getElementById("modal-title");
const modalText = document.getElementById("modal-text");
const newGameBtn = document.getElementById("new-game-btn");
const keyboardEl = document.getElementById("keyboard");

const state = {
  name: "",
  hint: "",
  lives: MAX_LIVES,
  guessed: new Set(),
  over: false,
};

function normalize(letter) {
  return letter
    .toLocaleLowerCase("cs")
    .normalize("NFC");
}

function isLetter(char) {
  return /[a-záäčďéěíňóöřšťúůüýž]/i.test(char);
}

function pickCharacter() {
  return CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
}

function updateWorld() {
  const darkness = (MAX_LIVES - state.lives) / MAX_LIVES;
  document.body.style.setProperty("--mordor", String(darkness));
  document.body.classList.toggle("is-won", state.over && isWon());
  document.body.classList.toggle("is-lost", state.over && !isWon() && state.lives <= 0);
}

function startGame() {
  const character = pickCharacter();
  state.name = character.name;
  state.hint = character.hint;
  state.lives = MAX_LIVES;
  state.guessed = new Set();
  state.over = false;

  hintEl.textContent = character.hint;
  letterCountEl.textContent = [...character.name].filter(isLetter).length;
  messageEl.textContent = "Začni písmenem. Mezery ve jméně jsou už odhalené.";
  messageEl.className = "message";
  overlayEl.classList.add("hidden");
  guessBtn.disabled = false;
  inputEl.disabled = false;
  inputEl.value = "";
  inputEl.focus();

  updateWorld();
  renderRings();
  renderWord();
  renderUsed();
  renderKeyboard();
}

function renderRings() {
  livesCountEl.textContent = String(state.lives);
  ringsEl.innerHTML = "";
  for (let i = 0; i < MAX_LIVES; i += 1) {
    const ring = document.createElement("span");
    ring.className = "ring" + (i >= state.lives ? " lost" : "");
    ringsEl.appendChild(ring);
  }
}

function renderWord() {
  wordEl.innerHTML = "";
  for (const char of state.name) {
    const box = document.createElement("span");
    if (!isLetter(char)) {
      box.className = "space";
      box.textContent = char === " " ? "" : char;
    } else {
      const revealed = state.guessed.has(normalize(char));
      box.className = "letter" + (revealed ? " revealed" : "");
      box.textContent = revealed ? char : "";
    }
    wordEl.appendChild(box);
  }
}

function renderUsed() {
  usedEl.innerHTML = "";
  [...state.guessed].forEach((letter) => {
    const chip = document.createElement("span");
    const hit = nameContains(letter);
    chip.className = "chip " + (hit ? "hit" : "miss");
    chip.textContent = letter.toLocaleUpperCase("cs");
    usedEl.appendChild(chip);
  });
}

function renderKeyboard() {
  keyboardEl.innerHTML = "";
  KEYS.forEach((letter) => {
    const key = document.createElement("button");
    key.type = "button";
    key.className = "key";
    key.textContent = letter.toLocaleUpperCase("cs");
    if (state.guessed.has(letter)) {
      key.classList.add(nameContains(letter) ? "hit" : "miss");
    }
    key.addEventListener("click", () => guessLetter(letter));
    keyboardEl.appendChild(key);
  });
}

function nameContains(letter) {
  const target = normalize(letter);
  return [...state.name].some((char) => isLetter(char) && normalize(char) === target);
}

function isWon() {
  return [...state.name].every((char) => !isLetter(char) || state.guessed.has(normalize(char)));
}

function guessLetter(raw) {
  if (state.over) return;

  const letter = normalize(String(raw || "").trim());
  if (!letter || letter.length !== 1 || !isLetter(letter)) {
    setMessage("Zadej jedno písmeno.", "error");
    return;
  }

  if (state.guessed.has(letter)) {
    setMessage("Tohle písmeno už jsi zkoušel.", "error");
    return;
  }

  state.guessed.add(letter);

  if (nameContains(letter)) {
    setMessage("Správně — písmeno je ve jméně.", "success");
  } else {
    state.lives -= 1;
    setMessage("Vedle. Jeden život pryč.", "error");
  }

  updateWorld();
  renderRings();
  renderWord();
  renderUsed();
  renderKeyboard();

  if (isWon()) {
    endGame(true);
  } else if (state.lives <= 0) {
    endGame(false);
  }
}

function endGame(won) {
  state.over = true;
  guessBtn.disabled = true;
  inputEl.disabled = true;
  updateWorld();
  overlayEl.classList.remove("hidden");
  modalEyebrow.textContent = won ? "Vítězství" : "Konec cesty";
  modalTitle.textContent = won ? "Prsten je tvůj" : "Temnota zvítězila";
  modalText.textContent = won
    ? `Uhodl jsi postavu: ${state.name}.`
    : `Došly životy. Hledaná postava byla ${state.name}.`;
}

function setMessage(text, type) {
  messageEl.textContent = text;
  messageEl.className = "message" + (type ? ` ${type}` : "");
}

formEl.addEventListener("submit", (event) => {
  event.preventDefault();
  guessLetter(inputEl.value);
  inputEl.value = "";
  inputEl.focus();
});

newGameBtn.addEventListener("click", startGame);

startGame();
