const API_URL = "https://v2.jokeapi.dev/joke/Any?safe-mode&format=json";

const button = document.querySelector("#jokeButton");
const status = document.querySelector("#status");
const jokeText = document.querySelector("#jokeText");
const delivery = document.querySelector("#jokeDelivery");
const category = document.querySelector("#jokeCategory");

async function getJoke() {
  button.disabled = true;
  status.textContent = "Finding a good one…";
  jokeText.textContent = "";
  delivery.hidden = true;
  category.hidden = true;

  try {
    const response = await fetch(API_URL, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`Joke service returned ${response.status}`);

    const data = await response.json();
    if (data.error) throw new Error("The joke service could not find a joke.");

    if (data.type === "twopart") {
      jokeText.textContent = data.setup;
      delivery.textContent = data.delivery;
      delivery.hidden = false;
    } else {
      jokeText.textContent = data.joke;
    }

    category.textContent = `Category: ${data.category}`;
    category.hidden = false;
    status.textContent = "Here you go!";
  } catch (error) {
    console.error("Could not load a joke:", error);
    status.textContent = "Couldn't reach the joke service. Check your connection and try again.";
    jokeText.textContent = "";
  } finally {
    button.disabled = false;
  }
}

button.addEventListener("click", getJoke);
