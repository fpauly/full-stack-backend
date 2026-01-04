const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require('cors')

app.use(cors())

app.use(express.json());
// app.use(morgan('tiny'))

morgan.token("request-body", function (req, res) {
  if (req.method === "POST") return JSON.stringify(req.body);
  return "";
});

// app.use(
//   morgan(function (tokens, req, res) {
//     return [
//       tokens.method(req, res),
//       tokens.url(req, res),
//       tokens.status(req, res),
//       tokens.res(req, res, "content-length"),
//       "-",
//       tokens["response-time"](req, res),
//       "ms",
//       tokens["request-body"](req, res),
//     ].join(" ");
//   })
// );

app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :request-body"
  )
);

let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

const generateId = () => {
  let id = 0;
  do {
    id = Math.floor(Math.random() * 100000000);
  } while (persons.find((p) => p.id === id.toString()));
  return id.toString();
};

app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>");
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  const person = persons.find((p) => p.id === id);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  persons = persons.filter((p) => p.id !== id);
  response.status(204).end();
});

app.get("/info", (request, response) => {
  const date = new Date();
  response.send(`<p>Phonebook has info for ${persons.length} people</p>
    <p>${date}</p>`);
});
app.post("/api/persons", (request, response) => {
  // const id = generateId();
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "The name or number is missing",
    });
  }

  if (persons.find((p) => p.name === body.name)) {
    return response.status(400).json({
      error: "The name already exists in the phonebook",
    });
  }
  const person = {
    id: generateId(),
    name: body.name,
    number: body.number,
  };
  // const person = request.body;
  // console.log(request.body.name)
  // person.id = id;
  persons = persons.concat(person);
  response.json(person);
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const PORT = 3008;
app.listen(PORT);
console.log(`Server running on port ${PORT}`);
