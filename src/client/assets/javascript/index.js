// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE

// The store will hold all information needed globally
let store = {
  track_id: undefined,
  player_id: undefined,
  race_id: undefined,
};

// We need our javascript to wait until the DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  onPageLoad();
  setupClickHandlers();
});

async function onPageLoad() {
  console.log('on page load');
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
    console.log('Problem getting tracks and racers ::', error.message);
    console.error(error);
  }
}

function setupClickHandlers() {
  console.log('set up click handlers');
  document.addEventListener(
    'click',
    function (event) {
      const { target } = event;

      // Race track form field
      if (target.matches('.card.track')) {
        handleSelectTrack(target);
      }

      // Podracer form field
      if (target.matches('.card.podracer')) {
        handleSelectPodRacer(target);
      }

      // Submit create race form
      if (target.matches('#submit-create-race')) {
        event.preventDefault();

        // start race
        handleCreateRace();
      }

      // Handle acceleration click
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
    console.log("an error shouldn't be possible here");
    console.log(error);
  }
}
// ^ PROVIDED CODE ^ DO NOT REMOVE

// This async function controls the flow of the race, add the logic and error handling
async function handleCreateRace() {
  console.log('handle create race');

  const disneyTracks = [
    'Zootopia',
    'Neverland',
    "Riley's Head",
    'Kingdom of Corona',
    "Ramone's House of Body Art",
    'Agrabah',
  ];

  // TODO - Get player_id and track_id from the store
  const { player_id, track_id } = store;

  if (!track_id || !player_id) {
    alert(`Please select track and racer to start the race!`);
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

  // const race = TODO - invoke the API call to create the race, then save the result
  try {
    const race = await createRace(player_id, track_id);

    race.Track.name = raceNameChange;

    // render starting UI
    renderAt('#race', renderRaceStartView(race.Track, race.Cars));

    // TODO - update the store with the race id
    store.race_id = race.ID - 1;

    // The race has been created, now start the countdown
    // TODO - call the async function runCountdown
    await runCountdown();

    // TODO - call the async function startRace
    await startRace(store.race_id);

    // TODO - call the async function runRace
    await runRace(store.race_id);
  } catch (err) {
    console.log(`Something went wrong while creating a race: ${err}`);
  }
}

function runRace(raceID) {
  console.log('run race');

  return new Promise((resolve) => {
    // TODO - use Javascript's built in setInterval method to get race info every 500ms
    /* 
		TODO - if the race info status property is "in-progress", update the leaderboard by calling:

		renderAt('#leaderBoard', raceProgress(res.positions))
	*/
    /* 
		TODO - if the race info status property is "finished", run the following:

		clearInterval(raceInterval) // to stop the interval from repeating
		renderAt('#race', resultsView(res.positions)) // to render the results view
		reslove(res) // resolve the promise
	*/
    const raceInterval = setInterval(() => {
      getRace(raceID).then((res) => {
        if (res.status === 'in-progress') {
          renderAt('#leaderBoard', updateResults(res.positions));
        } else if (res.status === 'finished') {
          console.log('Race is finished before results view', res.positions);
          //stop the interval from repeating
          clearInterval(raceInterval);
          // render the results view
          renderAt('#race', resultsView(res.positions));
          resolve(res);
        }
      });
    }, 500);
  }).catch((err) =>
    console.log(`Problem with runRace function: ${err.message}`)
  );

  // remember to add error handling for the Promise
}

async function runCountdown() {
  console.log('run countdown');

  try {
    // wait for the DOM to load
    await delay(1000);
    let timer = 3;

    return new Promise((resolve) => {
      // TODO - use Javascript's built in setInterval method to count down once per second
      setInterval(() => {
        if (timer > 0) {
          // DOM manipulation to decrement the countdown for the user
          document.getElementById('big-numbers').innerHTML = --timer;
        } else {
          // if the countdown is done, clear the interval, resolve the promise, and return
          clearInterval();
          resolve();
        }
      }, 1000);
    });
  } catch (error) {
    console.log(`Error during runCountdown: ${error}`);
  }
}

function handleSelectPodRacer(target) {
  console.log('selected a pod', target);

  // remove class selected from all racer options
  const selected = document.querySelector('#racers .selected');
  if (selected) {
    selected.classList.remove('selected');
  }

  // add class selected to current target
  target.classList.add('selected');

  // TODO - save the selected racer to the store
  store.player_id = parseInt(target.id);
}

function handleSelectTrack(target) {
  console.log('selected a track', target);

  // remove class selected from all track options
  const selected = document.querySelector('#tracks .selected');
  if (selected) {
    selected.classList.remove('selected');
  }

  // add class selected to current target
  target.classList.add('selected');

  // TODO - save the selected track id to the store
  store.track_id = target.id;
}

function handleAccelerate() {
  console.log('accelerate button clicked');
  // TODO - Invoke the API call to accelerate
  try {
    accelerate(store.race_id);
  } catch (error) {
    console.log('Problem with handleAccelerate ::', error);
  }
}

// HTML VIEWS ------------------------------------------------
// Provided code - do not remove

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

// step 6
function renderTrackCard(track) {
  const { id, name } = track;

  return `
		<li id="${id}" class="card track">
			<h3>${name}</h3>
		</li>
	`;
}

function renderCountdown(count) {
  console.log('render countdown');

  return `
		<h2>Race Starts In...</h2>
		<p id="big-numbers">${count}</p>
	`;
}

function renderRaceStartView(track, racers) {
  console.log('render race start view');

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
  console.log('results view - before positions sort', positions);

  positions.sort((a, b) => (a.final_position > b.final_position ? 1 : -1));

  console.log('after positions sort', positions);

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
  console.log('race progress');

  let racers = renameRacers(positions);

  let userPlayer = racers.find((e) => e.id === store.player_id);
  userPlayer.driver_name += ' (you)';

  racers = racers.sort((a, b) => (a.segment > b.segment ? -1 : 1));
  let count = 1;

  return racers
    .map((p) => {
      let completion = `${((p.segment / 201) * 100).toFixed(0)}%`;
      let final = '';

      if (completion === '100%') {
        console.log('final_position', p.final_position);
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
  console.log('update results', results);
  const newResults = raceProgress(results);
  console.log('newResults post race progress', newResults);

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
  console.log('render at');

  const node = document.querySelector(element);

  node.innerHTML = html;
}

// ^ Provided code ^ do not remove

// API CALLS ------------------------------------------------

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

// TODO - Make a fetch call (with error handling!) to each of the following API endpoints
function getTracks() {
  console.log('get tracks');

  // GET request to `${SERVER}/api/tracks`
  return fetch(`${SERVER}/api/tracks`, {
    method: 'GET',
    ...defaultFetchOpts(),
  })
    .then((res) => res.json())
    .then((res) => renameTracks(res))
    .catch((err) =>
      console.log(`Problem with getTracks request: ${err.message}`)
    );
}

function renameRacers(racers) {
  const disneyFolks = ['Elsa', 'Hercules', 'Mulan', 'Pocahontas', 'Simba'];

  return racers.map((racer, i) => {
    racer.driver_name = disneyFolks[i];
    return racer;
  });
}

function getRacers() {
  console.log('get racers');

  // GET request to `${SERVER}/api/cars`
  return fetch(`${SERVER}/api/cars`, {
    method: 'GET',
    ...defaultFetchOpts(),
  })
    .then((res) => res.json())
    .then((res) => renameRacers(res))
    .catch((err) => console.log(`Problem with getRacers request: ${err}`));
}

function createRace(player_id, track_id) {
  console.log('create race');

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
    .catch((err) => console.log('Problem with createRace request::', err));
}

function getRace(id) {
  console.log('get race');
  // GET request to `${SERVER}/api/races/${id}`
  return fetch(`${SERVER}/api/races/${id}`, {
    method: 'GET',
    ...defaultFetchOpts(),
  })
    .then((res) => res.json())
    .catch((err) =>
      console.log(
        `Trying to get #${id} race info. Problem with getRace request: ${err.message}`
      )
    );
}

function startRace(id) {
  return fetch(`${SERVER}/api/races/${id}/start`, {
    method: 'POST',
    ...defaultFetchOpts(),
  }).catch((err) => console.log('Problem with getRace request::', err));
}

function accelerate(id) {
  console.log('accelerate');

  // POST request to `${SERVER}/api/races/${id}/accelerate`
  // options parameter provided as defaultFetchOpts
  // no body or datatype needed for this request
  return fetch(`${SERVER}/api/races/${id}/accelerate`, {
    method: 'POST',
    ...defaultFetchOpts(),
  }).catch((err) =>
    console.log(`Problem with accelerate request: ${err.message}`)
  );
}
