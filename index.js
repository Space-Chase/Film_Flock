const morgan = require("morgan");
const express = require("express");
const app = express();
const port = 5500;

app.use(morgan("combined"));

app.get("/movies", (req, res) => {
  const topMovies = [
    { title: "The Godfather", Genre: "Drama", rating: 9.6 },
    { title: "The Shawshank Redemption", Genre: "Drama", rating: 8.2 },
    { title: "Pulp Fiction", Genre: "Action", rating: 8.7 },
    {
      title: "Austin Powers: The Spy Who Shagged Me",
      Genre: "Comedy",
      rating: 7.2,
    },
    { title: "Insidious", Genre: "Horror", rating: 7.1 },
    { title: "Friday The 13th", Genre: "Horror", rating: 6.3 },
    { title: "Spider-man (2002)", Genre: "Action", rating: 8.4 },
    { title: "The Predator", Genre: "Action", rating: 6.5 },
    { title: "The Dark Knight", Genre: "Action", rating: 9.3 },
    { title: "Shrek", Genre: "Comedy", rating: 9.2 },
  ];
  res.json(topMovies);
});

app.get("/", (req, res) => {
  res.send("Welcome to Film Flock!");
});

app.get("/movies/:title", (req, res) => {
  res.send("Return data about a single movie by title");
});

app.get("/genres/:name", (req, res) => {
  res.send("Return data about a genre by name/title");
});

app.get("/directors/:name", (req, res) => {
  res.send("Return data about a director by name");
});

app.post("/users/register", (req, res) => {
  res.send("Allow new users to register");
});

app.patch("/users/:userId", (req, res) => {
  res.send("Allow users to update their user info (username)");
});

app.post("/users/:userId/favorites", (req, res) => {
  res.send("Allow users to add a movie to their favorites");
});

app.delete("/users/:userId/favorites", (req, res) => {
  res.send("Allow users to remove a movie from their favorites");
});

app.delete("/users/:userId", (req, res) => {
  res.send("Allow existing users to deregister");
});

app.use(express.static("public"));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Internal Server Error");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
