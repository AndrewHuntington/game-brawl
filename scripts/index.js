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
  const response = await axios.get("https://api.rawg.io/api/games", {
    params: {
      key: "392eacce914141528cd685d219a48823",
      search: game.name,
    },
  });

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
  const dollars = parseInt(
    movieDetail.BoxOffice.replace(/\$/g, "").replace(/,/g, "")
  );
  const metascore = parseInt(movieDetail.Metascore);
  const imdbRating = parseFloat(movieDetail.imdbRating);
  const imdbVotes = parseInt(movieDetail.imdbVotes.replace(/,/g, ""));

  const awards = movieDetail.Awards.split(" ").reduce((prev, word) => {
    const value = parseInt(word);

    if (isNaN(value)) {
      return prev;
    } else {
      return prev + value;
    }
  }, 0);

  return `
    <article class="media">
      <figure class="media-left">
        <p class="image">
          <img src="${movieDetail.Poster}" />
        </p>
      </figure>
      <div class="media-content">
        <div class="content">
          <h1>${movieDetail.Title}</h1>
          <h4>${movieDetail.Genre}</h4>
          <p>${movieDetail.Plot}</p>
        </div>
      </div>
    </article>
    <article data-value=${awards} class="notification is-primary">
      <p class="title">${movieDetail.Awards}</p>
      <p class="subtitle">Awards</p>
    </article>
    <article data-value=${dollars} class="notification is-primary">
      <p class="title">${movieDetail.BoxOffice}</p>
      <p class="subtitle">Box Office</p>
    </article>
    <article data-value=${metascore} class="notification is-primary">
      <p class="title">${movieDetail.Metascore}</p>
      <p class="subtitle">Metascore</p>
    </article>
    <article data-value=${imdbRating} class="notification is-primary">
      <p class="title">${movieDetail.imdbRating}</p>
      <p class="subtitle">IMDB Rating</p>
    </article>
    <article data-value=${imdbVotes} class="notification is-primary">
      <p class="title">${movieDetail.imdbVotes}</p>
      <p class="subtitle">IMDB Votes</p>
    </article>
  `;
};
