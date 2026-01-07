require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
const baseUrl = '/api/persons'

morgan.token('request-body', function (req) {
  if (req.method === 'POST' || req.method === 'PUT')
    return JSON.stringify(req.body)
  return ''
})

app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms :request-body'
  )
)

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get(baseUrl, (request, response, next) => {
  Person.find({})
    .then((persons) => {
      persons.forEach((person) => {
        console.log(person.name, person.number)
      })
      response.json(persons)
    })
    .catch((error) => next(error))
})

app.get(baseUrl + '/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (!person)
        return response.status(404).json({ error: 'person not found' })
      response.json(person)
    })
    .catch((error) => next(error))
})

app.put(baseUrl + '/:id', (request, response, next) => {
  const body = request.body

  Person.findByIdAndUpdate(
    request.params.id,
    { name: body.name, number: body.number },
    { new: true, runValidators: true , context: 'query' }
  )
    .then((updated) => {
      if (!updated) return response.status(404).json({ error: 'person not found' })
      response.json(updated)
    })
    .catch(next)
})

app.post(baseUrl, (request, response, next) => {
  const body = request.body

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person
    .save()
    .then((savedP) => {
      response.json(savedP)
    })
    .catch((error) => next(error))
})

app.delete(baseUrl + '/:id', (request, response, next) => {
  const id = request.params.id
  Person.findByIdAndDelete(id)
    .then(() => {
      response.status(204).end()
    })
    .catch((error) => {
      // response.status(400).json({ error: "malformatted id" });
      next(error)
    })
})

app.get('/info', (request, response, next) => {
  const date = new Date()

  Person.countDocuments({})
    .then((count) => {
      response.send(`<p>Phonebook has info for ${count} people</p>
    <p>${date}</p>`)
    })
    .catch((error) => next(error))
})

const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return res.status(400).json({ error: 'malformatted id' })
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }

  next(error)
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
