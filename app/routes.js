//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()
const path = require('path')

// Add your routes here

router.get('/version-15/data/local-authority-districts.geojson', (req, res) => {
	const geojsonPath = path.join(
		__dirname,
		'data',
		'Local_Authority_Districts_May_2023_UK_BGC_V2_-612691324625764623.geojson'
	)

	res.sendFile(geojsonPath)
})

router.get('/version-16/data/local-authority-districts.geojson', (req, res) => {
	const geojsonPath = path.join(
		__dirname,
		'data',
		'Local_Authority_Districts_May_2023_UK_BGC_V2_-612691324625764623.geojson'
	)

	res.sendFile(geojsonPath)
})

router.get('/version-16/data/air-quality-management-areas.geojson', (req, res) => {
	const geojsonPath = path.join(
		__dirname,
		'data',
		'air-quality-management-area.geojson'
	)

	res.sendFile(geojsonPath)
})
