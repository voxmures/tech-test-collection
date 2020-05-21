const express = require('express')
var bodyParser = require('body-parser');

const app = express()

app.use(bodyParser.json());

const data = require('./data.json')
const submissions = [
	{ score: 2 },
	{ score: 1 },
	{ score: 1 },
	{ score: 2 },
	{ score: 1 },
	{ score: 1 },
	{ score: 3 },
	{ score: 3 },
	{ score: 2 },
	{ score: 1 },
	{ score: 0 },
	{ score: 0 }
]

const betterThan = (score) => {
	const belowPlayers = submissions
		.map(s => s.score)
		.filter(s => s < score)
		.sort().length
	return (belowPlayers / submissions.length) * 100
}

app.get('/', (req, res) => {
	const steps = data.steps.map(step => {
		return {
			question: step.question,
			answers: step.answers.map(answer => answer.text)
		}
	})
	res.json(steps)
})

app.post('/', (req, res) => {
	const selection = req.body.selection;
	const score = data.steps.reduce((scr, step, i) => {
		if (step.answers.findIndex(answer => answer.correct) === selection[i])
			++scr
		return scr
	}, 0)

	submissions.push({ score: score })
		
	res.json({
		score: score,
		betterThan: betterThan(score)
	})
})

module.exports = {
	path: '/api/quiz',
	handler: app
}