let store = {
  track_id: undefined,
  player_id: undefined,
  race_id: undefined,
};

const disneyFolks = {
  'Racer 1': 'Elsa',
  'Racer 2': 'Hercules',
  'Racer 3': 'Mulan',
  'Racer 4': 'Pocahontas',
  'Racer 5': 'Simba',
};

document.addEventListener('DOMContentLoaded', function () {
  onPageLoad();
  setupClickHandlers();
});

function renderErrorMessage(error) {
  const footer = document.querySelector('footer');
  footer.style.color = 'white';
  footer.style.fontSize = '36px';
  footer.innerHTML = error;
}

async function onPageLoad() {
  try {
    getTracks().then((tracks) => {
      const html = renderTrackCards(tracks);
      renderAt('#tracks', html);
    });

    getRacers().then((racers) => {
      const html = renderRacerCars(racers);
      renderAt('#racers', html);
    });
  } catch (error) {
    renderErrorMessage('Problem getting tracks and racers ::', error.message);
  }
}

function setupClickHandlers() {
  document.addEventListener(
    'click',
    function (event) {
      const { target } = event;

      if (target.matches('.card.track')) {
        handleSelectTrack(target);
      }

      if (target.matches('.card.podracer')) {
        handleSelectPodRacer(target);
      }

      if (target.matches('#submit-create-race')) {
        event.preventDefault();
        handleCreateRace();
      }

      if (target.matches('#gas-peddle')) {
        handleAccelerate(target);
      }
    },
    false
  );
}

async function delay(ms) {
  try {
    return await new Promise((resolve) => setTimeout(resolve, ms));
  } catch (error) {
    renderErrorMessage("an error shouldn't be possible here", error);
  }
}

async function handleCreateRace() {
  const disneyTracks = [
    'Zootopia',
    'Neverland',
    "Riley's Head",
    'Kingdom of Corona',
    "Ramone's House of Body Art",
    'Agrabah',
  ];

  const { player_id, track_id } = store;

  if (!track_id || !player_id) {
    renderErrorMessage(`Please select track and racer to start the race!`);
    return;
  }

  let raceNameChange = '';
  switch (track_id) {
    case '1':
      raceNameChange = disneyTracks[0];
      break;
    case '2':
      raceNameChange = disneyTracks[1];
      break;
    case '3':
      raceNameChange = disneyTracks[2];
      break;
    case '4':
      raceNameChange = disneyTracks[3];
      break;
    case '5':
      raceNameChange = disneyTracks[4];
      break;
    default:
      raceNameChange = disneyTracks[5];
      break;
  }

  try {
    const race = await createRace(player_id, track_id);

    race.Track.name = raceNameChange;

    renderAt('#race', renderRaceStartView(race.Track, race.Cars));
    store.race_id = race.ID - 1;

    await runCountdown();
    await startRace(store.race_id);
    await runRace(store.race_id);
  } catch (err) {
    renderErrorMessage(`Something went wrong while creating a race: ${err}`);
  }
}

function runRace(raceID) {
  return new Promise((resolve) => {
    const raceInterval = setInterval(() => {
      getRace(raceID).then((res) => {
        if (res.status === 'in-progress') {
          renderAt('#leaderBoard', updateResults(res.positions));
        } else if (res.status === 'finished') {
          clearInterval(raceInterval);
          renderAt('#race', resultsView(res.positions));
          resolve(res);
        }
      });
    }, 500);
  }).catch((err) =>
    renderErrorMessage(`Problem with runRace function: ${err.message}`)
  );
}

async function runCountdown() {
  try {
    await delay(1000);
    let timer = 3;

    return new Promise((resolve) => {
      setInterval(() => {
        if (timer > 0) {
          document.getElementById('big-numbers').innerHTML = --timer;
        } else {
          clearInterval();
          resolve();
        }
      }, 1000);
    });
  } catch (error) {
    renderErrorMessage(`Error during runCountdown: ${error}`);
  }
}

function handleSelectPodRacer(target) {
  const selected = document.querySelector('#racers .selected');
  if (selected) {
    selected.classList.remove('selected');
  }

  target.classList.add('selected');

  store.player_id = parseInt(target.id);
}

function handleSelectTrack(target) {
  const selected = document.querySelector('#tracks .selected');
  if (selected) {
    selected.classList.remove('selected');
  }

  target.classList.add('selected');

  store.track_id = target.id;
}

function handleAccelerate() {
  try {
    accelerate(store.race_id);
  } catch (error) {
    renderErrorMessage('Problem with handleAccelerate ::', error);
  }
}

function renderRacerCars(racers) {
  if (!racers.length) {
    return `
			<h4>Loading Racers...</4>
		`;
  }

  const results = racers.map(renderRacerCard).join('');

  return `
		<ul id="racers">
			${results}
		</ul>
	`;
}

function renderRacerCard(racer) {
  const { id, driver_name, top_speed, acceleration, handling } = racer;

  return `
		<li id="${id}" class="card podracer">
			<h3>${driver_name}</h3>
			<p>${top_speed}</p>
			<p>${acceleration}</p>
			<p>${handling}</p>
		</li>
	`;
}

function renderTrackCards(tracks) {
  if (!tracks.length) {
    return `
			<h4>Loading Tracks...</4>
		`;
  }

  const results = tracks.map(renderTrackCard).join('');

  return `
		<ul id="tracks">
			${results}
		</ul>
	`;
}

function renderTrackCard(track) {
  const { id, name } = track;

  return `
		<li id="${id}" class="card track">
			<h3>${name}</h3>
		</li>
	`;
}

function renderCountdown(count) {
  return `
		<h2>Race Starts In...</h2>
		<p id="big-numbers">${count}</p>
	`;
}

function renderRaceStartView(track, racers) {
  return `
		<header>
			<h1>Race: ${track.name}</h1>
		</header>
		<main id="two-columns">
			<section id="leaderBoard">
				${renderCountdown(3)}
			</section>

			<section id="accelerate">
				<h2>Directions</h2>
				<p>Click the button as fast as you can to make your racer go faster!</p>
				<button id="gas-peddle">Click Me To Win!</button>
			</section>
		</main>
		<footer></footer>
	`;
}

function resultsView(positions) {
  positions.sort((a, b) => (a.final_position > b.final_position ? 1 : -1));

  return `
		<header>
			<h1>Race Results</h1>
		</header>
		<main>
			${updateResults(positions)}
			<a href="/race">Start a new race</a>
		</main>
	`;
}

function raceProgress(positions) {
  let racers = renameRacers(positions);

  let userPlayer = racers.find((racer) => racer.id === store.player_id);
  userPlayer.driver_name += ' (you)';

  racers = racers.sort((a, b) => (a.segment > b.segment ? -1 : 1));
  let count = 1;

  return racers
    .map((p) => {
      let completion = `${((p.segment / 201) * 100).toFixed(0)}%`;
      let final = '';

      if (completion === '100%') {
        switch (p.final_position) {
          case 1:
            final = '1st';
            break;
          case 2:
            final = '2nd';
            break;
          case 3:
            final = '3rd';
            break;
          case 4:
            final = '4th';
            break;
          case 5:
            final = '5th';
            break;
          default:
            final = 'Waiting for results...';
            break;
        }
        completion = `${final} place`;
      }

      return `
			<tr>
				<td>
					<h3>${count++} - ${p.driver_name} - ${completion}</h3>
				</td>
			</tr>
		`;
    })
    .join('');
}

const updateResults = (results) => {
  const newResults = raceProgress(results);

  return `
		<main>
			<h3>Leaderboard</h3>
			<section id="leaderBoard">
				${newResults}
			</section>
		</main>
	`;
};

function renderAt(element, html) {
  const node = document.querySelector(element);

  node.innerHTML = html;
}

const SERVER = 'http://localhost:8000';

function defaultFetchOpts() {
  return {
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': SERVER,
    },
  };
}

function renameTracks(tracks) {
  const disneyTracks = [
    'Zootopia',
    'Neverland',
    "Riley's Head",
    'Kingdom of Corona',
    "Ramone's House of Body Art",
    'Agrabah',
  ];

  return tracks.map((track, i) => {
    track.name = disneyTracks[i];
    return track;
  });
}

function getTracks() {
  return fetch(`${SERVER}/api/tracks`, {
    method: 'GET',
    ...defaultFetchOpts(),
  })
    .then((res) => res.json())
    .then((res) => renameTracks(res))
    .catch((err) =>
      renderErrorMessage(`Problem with getTracks request: ${err.message}`)
    );
}

function renameRacers(racers) {
  return racers.map((racer) => {
    racer.driver_name = disneyFolks[racer.driver_name];
    return racer;
  });
}

function getRacers() {
  return fetch(`${SERVER}/api/cars`, {
    method: 'GET',
    ...defaultFetchOpts(),
  })
    .then((res) => res.json())
    .then((res) => renameRacers(res))
    .catch((err) =>
      renderErrorMessage(`Problem with getRacers request: ${err}`)
    );
}

function createRace(player_id, track_id) {
  player_id = parseInt(player_id);
  track_id = parseInt(track_id);
  const body = { player_id, track_id };

  return fetch(`${SERVER}/api/races`, {
    method: 'POST',
    ...defaultFetchOpts(),
    dataType: 'jsonp',
    body: JSON.stringify(body),
  })
    .then((res) => res.json())
    .catch((err) =>
      renderErrorMessage('Problem with createRace request::', err)
    );
}

function getRace(id) {
  return fetch(`${SERVER}/api/races/${id}`, {
    method: 'GET',
    ...defaultFetchOpts(),
  })
    .then((res) => res.json())
    .catch((err) =>
      renderErrorMessage(
        `Trying to get #${id} race info. Problem with getRace request: ${err.message}`
      )
    );
}

function startRace(id) {
  return fetch(`${SERVER}/api/races/${id}/start`, {
    method: 'POST',
    ...defaultFetchOpts(),
  }).catch((err) => renderErrorMessage('Problem with getRace request::', err));
}

function accelerate(id) {
  return fetch(`${SERVER}/api/races/${id}/accelerate`, {
    method: 'POST',
    ...defaultFetchOpts(),
  }).catch((err) =>
    renderErrorMessage(`Problem with accelerate request: ${err.message}`)
  );
}
