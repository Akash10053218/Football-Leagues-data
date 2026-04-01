
var url = "https://www.thesportsdb.com/api/v1/json/3";

// PART 1: Get all soccer leagues

fetch(url + "/all_leagues.php")
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    // filter only soccer leagues from the list
    var soccerLeagues = data.leagues.filter(function (league) {
      return league.strSport === "Soccer";
    });

    console.log("Total Soccer Leagues: " + soccerLeagues.length);
    console.log("First 5:");

    // print the first 5 leagues
    soccerLeagues.slice(0, 5).forEach(function (league) {
      console.log(" - " + league.idLeague + " | " + league.strLeague);
    });
  });

// PART 2: Get EPL league details

fetch(url + "/lookupleague.php?id=4328")
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    // get the first league from the result
    var league = data.leagues[0];

    console.log("");
    console.log("League Detail:");
    console.log(" Name    : " + league.strLeague);
    console.log(" Country : " + league.strCountry);
    console.log(" Season  : " + league.strCurrentSeason);
    console.log(" Founded : " + league.intFormedYear);
  });

// PART 3: Get all EPL teams

fetch(url + "/search_all_teams.php?l=English%20Premier%20League")
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    var teams = data.teams;

    // if teams is null or undefined, make it empty array
    if (!teams) {
      teams = [];
    }

    console.log("");
    console.log("Total Teams: " + teams.length);
    console.log("First 5:");

    // print first 5 teams
    teams.slice(0, 5).forEach(function (team) {
      console.log(" - " + team.strTeam + " | " + team.strStadium);
    });
  });

// PART 4: Get EPL matches for 2024-2025 season

fetch(url + "/eventsseason.php?id=4328&s=2024-2025")
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    var matches = data.events;

    // if matches is null or undefined, make it empty array
    if (!matches) {
      matches = [];
    }

    console.log("");
    console.log("Total Matches: " + matches.length);
    console.log("First 5:");

    // print first 5 matches
    matches.slice(0, 5).forEach(function (match) {
      console.log(" - " + match.dateEvent + " | " + match.strHomeTeam + " " + match.intHomeScore + " - " + match.intAwayScore + " " + match.strAwayTeam + " | " + match.strStatus);
    });
  });
