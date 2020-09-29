const helmet = require("helmet");
const Joi = require("joi"); // This returns a class, npm joi, for validation
const logger = require("./logger"); // custom middlewre function
const auth = require("./auth");
const express = require("express");
const app = express();

console.log(`NODE_ENV is: ${process.env.NODE_ENV}`);
console.log(`app: ${app.get("env")}`);
// MIDDLEWARE FUNCTIONS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public")); // serve static content from root of the site
app.use(helmet); // third party middleware
// morgan also
app.use(logger);
app.use(auth);

const courses = [
  { id: 1, name: "course1" },
  { id: 2, name: "course2" },
  { id: 3, name: "course3" },
];

/************* ROUTES *************/

// A new route is created with app.get() or app.post()
// which takes 2 arguments, url and callback function

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/api/courses", (req, res) => {
  res.send(courses);
});

// HTTP POST REQUEST, to add course

app.post("/api/courses", (req, res) => {
  // Validation
  const { error } = validateCourse(req.body); // deconstructed object = result.error
  if (error) {
    res.status(400).send(error.details[0].message); // if error send 400 bad request
    return;
  }
  // New course
  const course = {
    id: courses.length + 1, // later will be assigned by the db
    name: req.body.name,
  };
  // Add course
  courses.push(course);
  res.send(course);
});

// HTTP PUT REQUEST, to update a course

app.put("/api/courses/:id", (req, res) => {
  // Look up the course
  const course = courses.find((c) => c.id === parseInt(req.params.id));
  if (!course)
    return res.status(404).send("The course with the given id was not found"); // if not existing, return 404

  // Validate
  const { error } = validateCourse(req.body); // result.error
  if (error) {
    return res.status(400).send(error.details[0].message); // if error send 400 bad request
  }
  // Update course
  course.name = req.body.name;
  res.send(course); // return the updated course
});

// HTTP DELETE REQUEST, to delete a course

app.delete("/api/courses/:id", (req, res) => {
  // Look up the course
  const course = courses.find((c) => c.id === parseInt(req.params.id));
  if (!course)
    return res.status(404).send("The course with the given id was not found"); // if not exisisting,return 404
  // Delete course
  const index = courses.indexOf(course); //Get index of the course
  courses.splice(index, 1); // take of course from the array

  //Return the same course
  res.send(course);
});

// VALIDATION FUNCTION
function validateCourse(course) {
  const schema = {
    name: Joi.string().min(3).required(), // Validation: minimum 3 chars and required
  };

  return Joi.validate(course, schema);
}

// HTTP GET REQUEST, to get a single course ID

app.get("/api/courses/:id", (req, res) => {
  // The req.params.id return a string, therefore to work properly
  // therefore we need to parse it
  const course = courses.find((c) => c.id === parseInt(req.params.id));
  // if the course does not exist we responde with 404
  if (!course)
    return res.status(404).send("The course with the given id was not found");
  res.send(course);
});

// to get date of a post (multiple parameters example)

app.get("/api/posts/:year/:month", (req, res) => {
  res.send(req.params); // use sort by (query parameters)
});

// ENVIRONMENT VARIABLE
// called PORT instead of 3000
// assign port from terminal with:  export PORT=portNumber
const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Listening on port ${port}...`));
