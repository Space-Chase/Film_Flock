const mongoose = require("mongoose");
const Models = require("./models.js");
const Movies = Models.Movie;
const Users = Models.User;
const morgan = require("morgan");
const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const cors = require("cors");
let allowedOrigins = ["http://localhost:5501", "https://nameless-basin-66959-08ab77b73096.herokuapp.com"];
const { check, validationResult } = require("express-validator");

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        let message =
          "The CORS policy for this application doesn’t allow access from origin " +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  })
);
let auth = require("./auth")(app);
const passport = require("passport");
require("./passport");

mongoose.connect("mongodb+srv://MyFlixDbAdmin:Higy6ninja@cluster0.dclgdwc.mongodb.net/MyFlixDB?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
app.use(morgan("combined"));

app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.find()
      .then((movies) => {
        res.status(200).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

app.get(
  "/movies/details/genre/:genre",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const genre = req.params.genre;

    try {
      const moviesByGenre = await Movies.find({ "details.genre": genre });
      res.status(200).json(moviesByGenre);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error: " + err);
    }
  }
);

app.get(
  "/movies/details/director/:director",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const director = req.params.director;

    try {
      const moviesByDirector = await Movies.find({ "details.director": director });
      res.status(200).json(moviesByDirector);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error: " + err);
    }
  }
);


app.patch("/users/:userId", (req, res) => {
  res.send("Allow users to update their user info (username)");
});

/*app.post("/users/:userId/favorites/:movies",
passport.authenticate("jwt", { session: false }),
async (req, res) => {
  await Users.findOne({ _id: req.params.userId })
  .then(async (user) => {
    //Got user - move on to adding favorite movies
    await Movies.findOne({ _id: req.params.movies })
    .then((movie) => {
  
  
  
    })
    })
  
  
  res.send("Allow users to add a movie to their favorites");
  
});

// Add a movie to a user's list of favorites
app.post('/users/:Username/movies/:MovieID', async (req, res) => {
  await Users.findOneAndUpdate({ Username: req.params.Username }, {
     $push: { FavoriteMovies: req.params.MovieID }
   },
   { new: true }) // This line makes sure that the updated document is returned
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send(‘Error: ’ + err);
  });
}); */

app.post(
  "/users/:userId/favorites/:movies",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const userId = req.params.userId;
    const movieId = req.params.movies;

    try {
      // Check if the user exists
      const user = await Users.findById(userId);
      if (!user) {
        return res.status(404).send("User not found");
      }

      // Check if the movie exists
      const movie = await Movies.findById(movieId);
      if (!movie) {
        return res.status(404).send("Movie not found");
      }

      // Check if the movie is already in the user's favorites
      if (user.Favorites.includes(movieId)) {
        return res.status(400).send("Movie already in favorites");
      }

      // Add the movie to the user's favorites
      user.Favorites.push(movieId);
      await user.save();

      res.status(201).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error: " + error);
    }
  }
);


app.post(
  "/users",        
  [
    check("Username", "Username 5 characters minimum is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  async (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    await Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + " already exists");
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send("Error: " + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

app.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.find()
      .then((users) => {
        res.status(201).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

app.get(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.findOne({ Username: req.params.Username })
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

app.put(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let hashedPassword = Users.hashPassword(req.body.Password);
    await Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        },
      },
      { new: true }
    )
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

app.put(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    if (req.user.Username !== req.params.Username) {
      return res.status(400).send("Permission denied");
    }
    await Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        },
      },
      { new: true }
    )
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("Error: " + err);
      });
  }
);

app.delete(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.findOneAndRemove({ Username: req.params.Username })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.Username + " was not found");
        } else {
          res.status(200).send(req.params.Username + " was deleted.");
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

app.use(express.static("public"));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Internal Server Error");
});

const port = process.env.PORT || 5501;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});
