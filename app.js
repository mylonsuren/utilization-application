var express = require('express');
var CSMApp = express(); // declares express app
var port = process.env.PORT || 8080; //sets the port to listen on

//serves the static files
CSMApp.use(express.static('./styles'));
CSMApp.use(express.static('./script'));
CSMApp.use(express.static('./images'));
CSMApp.use(express.static('./views/templates'));
CSMApp.use(express.static('./node_modules'));
CSMApp.use(express.static('./script/Geo_Overview/lib/styles/'));

/*
=====================================================
	ROUTES
=====================================================
*/

CSMApp.get('/favicon.ico', function(req, res) {
	res.sendFile(__dirname + '/favicon.ico');
});

//pages
CSMApp.get('/', function(req, res) {
	res.sendFile(__dirname + '/views/index.html');
});

CSMApp.get('/CSM', function(req, res) {
	res.sendFile(__dirname + '/views/CSMListPage.html');
});

CSMApp.get('/Clients', function(req, res) {
	res.sendFile(__dirname + '/views/ClientListPage.html');
});

CSMApp.get('/Geo', function(req, res) {
	res.sendFile(__dirname + '/views/GeoMap.html');
});

CSMApp.get('/Country', function(req, res) {
	res.sendFile(__dirname + '/views/CountryMap.html');
});

CSMApp.get('/Reports', function(req, res) {
	res.sendFile(__dirname + '/views/Reports.html');
});

CSMApp.get('/CSM/*', function(req, res) {
	res.sendFile(__dirname + '/views/CSMInfoPage.html');
});

CSMApp.get('/Geo/*', function(req, res) {
	res.sendFile(__dirname + '/views/GeoInfoPage.html');
});

CSMApp.get('/Country/*', function(req, res) {
	res.sendFile(__dirname + '/views/CountryInfoPage.html');
});



//PDF pages
CSMApp.get('/Reports/TrialClientsReport', function(req, res) {
	res.sendFile(__dirname + '/views/templates/PDFs/TrialClientsPDF.html');
});

CSMApp.get('/Reports/OverutilizedCSMsReport', function(req, res) {
	res.sendFile(__dirname + '/views/templates/PDFs/OverutilizedCSMsPDF.html');
});

CSMApp.get('/Reports/CSMAssignmentBreakdownReport', function(req, res) {
	res.sendFile(__dirname + '/views/templates/PDFs/CSMAssignmentBreakdownPDF.html');
});

CSMApp.get('/Reports/GlobalReport', function(req, res) {
	res.sendFile(__dirname + '/views/templates/PDFs/GeoPDF.html');
});

CSMApp.get('/Reports/NAReport', function(req, res) {
	res.sendFile(__dirname + '/views/templates/PDFs/GeoPDF.html');
});

CSMApp.get('/Reports/EMEAReport', function(req, res) {
	res.sendFile(__dirname + '/views/templates/PDFs/GeoPDF.html');
});

CSMApp.get('/Reports/APReport', function(req, res) {
	res.sendFile(__dirname + '/views/templates/PDFs/GeoPDF.html');
});


CSMApp.get('/Reports/LAReport', function(req, res) {
	res.sendFile(__dirname + '/views/templates/PDFs/GeoPDF.html');
});

CSMApp.get('/Reports/ClientUsageReport', function(req, res) {

	res.sendFile(__dirname + '/views/templates/PDFs/ClientUsagePDF.html');
});

CSMApp.get('/Reports/OverutilizedGeographiesReport', function(req, res) {
	res.sendFile(__dirname + '/views/templates/PDFs/OverutilizedGeographiesPDF.html');
});

CSMApp.get('/Reports/OverusingClientsReport', function(req, res) {
	res.sendFile(__dirname + '/views/templates/PDFs/OverusingClientsPDF.html');
});

CSMApp.get('/Reports/MissingInfoOnETAReport', function(req, res) {
	res.sendFile(__dirname + '/views/templates/PDFs/MissingInfoOnETAPDF.html');
});

CSMApp.get('/Reports/AvailableCSMsReport', function(req, res) {
	res.sendFile(__dirname + '/views/templates/PDFs/AvailableCSMsPDF.html');
});

CSMApp.get('/Reports/UnassignedClientsReport', function(req, res) {
	res.sendFile(__dirname + '/views/templates/PDFs/UnassignedClientsPDF.html');
});

CSMApp.get('/Reports/MissingInfoOnETAReport', function(req, res) {
	res.sendFile(__dirname + '/views/templates/PDFs/MissingInfoReport.html');
});

CSMApp.get('/Reports/ClientsWithoutPremiumSupportTagReport', function(req, res) {
	res.sendFile(__dirname + '/views/templates/PDFs/ClientsWithoutPremiumSupportTagPDF.html');
});

CSMApp.get('/Reports/CSMsNotLoggedInToETAReport', function(req, res) {
	res.sendFile(__dirname + '/views/templates/PDFs/CSMsNotLoggedInToETAPDF.html');
});

CSMApp.get('/Reports/UpcomingAndEndingContractsReport', function(req, res) {
	res.sendFile(__dirname + '/views/templates/PDFs/UpcomingAndEndingContractsPDF.html');
});

//start server
CSMApp.listen(port, function() {
	console.log("Now listening on port " + port);
});
