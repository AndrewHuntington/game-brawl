const autoCompleteConfig = {
  renderOption(game) {
    const imgSrc = game.background_image;
    return `
      <img src="${imgSrc}" />
      ${game.name} (${game.released.slice(0, 4)})
    `;
  },
  inputValue(game) {
    return game.name;
  },
  async fetchData(searchTerm) {
    const response = await axios.get("https://api.rawg.io/api/games", {
      params: {
        key: "392eacce914141528cd685d219a48823",
        search: searchTerm,
      },
    });

    // How to handle searches that don't return anything or "blank" searches
    // TODO: Improve handling by providing the user a message
    if (response.data.count === 0 || searchTerm === "") {
      return [];
    }

    return response.data.results;
  },
};

createAutoComplete({
  ...autoCompleteConfig,
  root: document.querySelector("#left-autocomplete"),
  onOptionSelect(game) {
    document.querySelector(".tutorial").classList.add("is-hidden");
    onGameSelect(game, document.querySelector("#left-summary"), "left");
  },
});
createAutoComplete({
  ...autoCompleteConfig,
  root: document.querySelector("#right-autocomplete"),
  onOptionSelect(game) {
    document.querySelector(".tutorial").classList.add("is-hidden");
    onGameSelect(game, document.querySelector("#right-summary"), "right");
  },
});

let leftGame;
let rightGame;
const onGameSelect = async (game, summaryElement, side) => {
  console.log("game", game.id.toString());
  const response = await axios.get(
    "https://api.rawg.io/api/games/" + game.id.toString(),
    {
      params: {
        key: "392eacce914141528cd685d219a48823",
      },
    }
  );

  summaryElement.innerHTML = gameTemplate(response.data);

  if (side === "left") {
    leftGame = response.data;
  } else {
    rightGame = response.data;
  }

  if (leftGame && rightGame) {
    runComparison();
  }
};

const runComparison = () => {
  const leftSideStats = document.querySelectorAll(
    "#left-summary .notification"
  );
  const rightSideStats = document.querySelectorAll(
    "#right-summary .notification"
  );

  leftSideStats.forEach((leftStat, index) => {
    const rightStat = rightSideStats[index];

    // All dataset values are stored as strings in the DOM.
    // In order make sure we are properly comparing the items,
    // we should convert the values to numbers.
    const leftSideValue = parseFloat(leftStat.dataset.value);
    const rightSideValue = parseFloat(rightStat.dataset.value);

    if (rightSideValue > leftSideValue) {
      leftStat.classList.remove("is-primary");
      leftStat.classList.add("is-warning");
    } else if (rightSideValue < leftSideValue) {
      rightStat.classList.remove("is-primary");
      rightStat.classList.add("is-warning");
    }
  });
};

const gameTemplate = (gameDetail) => {
  // Game Values
  const metascore = gameDetail.metacritic;
  const playtime = gameDetail.playtime;
  const avgRating = gameDetail.rating;
  const exceptionals = gameDetail.ratings[1].count;
  const twitchCount = gameDetail.twitch_count;
  const youtubeCount = gameDetail.youtube_count;
  let website = "";

  if (gameDetail.slug === "") {
    website = "https://www.google.com/search?q=" + gameDetail.name;
  } else {
    website = "https://rawg.io/games/" + gameDetail.slug;
  }

  // TODO: Add genres
  return `
    <article class="media">
      <figure class="media-left">
        <p class="image">
          <img src="${gameDetail.background_image}" />
        </p>
      </figure>
      <div class="media-content">
        <div class="content">
          <h1>${gameDetail.name}</h1>
          <!-- <h4>${gameDetail.genres}</h4> -->
          <p>${gameDetail.description.slice(
            0,
            125
          )}... <br>[<a href="${website}" target="_blank">Learn More]</a></p>
        </div>
      </div>
    </article>
    <article data-value=${avgRating} class="notification is-primary">
      <p class="title">${avgRating}</p>
      <p class="subtitle">Average Rating on RAWG</p>
    </article>
    <article data-value=${exceptionals} class="notification is-primary">
      <p class="title">${exceptionals}</p>
      <p class="subtitle">Number of Times Voted Exceptional on RAWG</p>
    </article>
    <article data-value=${metascore} class="notification is-primary">
      <p class="title">${metascore}</p>
      <p class="subtitle">Metacritic Score (if available)</p>
    </article>
    <article data-value=${playtime} class="notification is-primary">
      <p class="title">${playtime}</p>
      <p class="subtitle">Playtime (in hours)</p>
    </article>
    <article data-value=${twitchCount} class="notification is-primary">
      <p class="title">${twitchCount}</p>
      <p class="subtitle">Twitch Streams</p>
    </article>
    <article data-value=${youtubeCount} class="notification is-primary">
      <p class="title">${youtubeCount.toLocaleString("en-US")}</p>
      <p class="subtitle">YouTube Videos</p>
    </article>
  `;
};
