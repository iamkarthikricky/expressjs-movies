const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "moviesData.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

const convertDbObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertDbObjectToResponseObjectDirector = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

app.get("/movies/", async (request, response) => {
  const movieName = `SELECT movie_name FROM movie`;
  const movieNameArray = await database.all(movieName);
  response.send(
    movieNameArray.map((eachMovie) =>
      convertDbObjectToResponseObject(eachMovie)
    )
  );
});

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const newDataQuery = `INSERT INTO movie(director_id,movie_name,lead_actor) VALUES (${directorId},'${movieName}','${leadActor}')`;
  const addInfo = await database.run(newDataQuery);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const movieQuery = `SELECT * FROM movie WHERE movie_id=${movieId}`;
  const queryResult = await database.get(movieQuery);
  response.send(convertDbObject(queryResult));
});

app.put("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateQuery = `UPDATE movie 
    SET 
    director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
    WHERE movie_id=${movieId};`;
  await database.run(updateQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `DELETE FROM movie 
    WHERE movie_id=${movieId};`;
  await database.run(deleteQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const directorQuery = `SELECT * FROM director`;
  const directorArray = await database.all(directorQuery);
  response.send(
    directorArray.map((eachDirector) =>
      convertDbObjectToResponseObjectDirector(eachDirector)
    )
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `
    SELECT movie_name FROM movie WHERE director_id=${directorId};`;
  const getDirectorMoviesArray = await database.all(getDirectorMoviesQuery);
  response.send(
    getDirectorMoviesArray.map((movie) =>
      convertDbObjectToResponseObject(movie)
    )
  );
});
module.exports = app;
