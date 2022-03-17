const API_URL = 'http://localhost:5001/v1';

// Load planets and return as JSON.
async function httpGetPlanets() {
  try {
    const response = await fetch(`${API_URL}/planets`);
    const fetchedPlanets = await response.json();
    return fetchedPlanets;
  } catch (error) {
    console.log('httpGetPlanets:', error);
  }
}

// Load launches, sort by flight number, and return as JSON.
async function httpGetLaunches() {
  try {
    const response = await fetch(`${API_URL}/launches`);
    const fetchedLaunches = await response.json();
    return fetchedLaunches.sort((a,b) => {
      return a.flightNumber - b.flightNumber;
    });
  } catch (error) {
    console.log('httpGetLaunches:', error);
  }
}

 // Submit given launch data to launch system.
async function httpSubmitLaunch(launch) {
  try {
    return await fetch(`${API_URL}/launches`, {
      method: 'post',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(launch)
    });
  } catch (error) {
    console.log('httpSubmitLaunch:', error);
    return {
      ok: false
    }
  }
}

 // Delete launch with given ID.
async function httpAbortLaunch(id) {
  try {
    return await fetch(`${API_URL}/launches/${id}`, {
      method: 'delete'
    });
  } catch (error) {
    console.log('httpAbortLaunch:', error);
    return {
      ok: false
    }
  }
}

export {
  httpGetPlanets,
  httpGetLaunches,
  httpSubmitLaunch,
  httpAbortLaunch,
};