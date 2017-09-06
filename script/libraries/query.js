/* =============================================================================
POSSIBLE THINGS YOU MIGHT WANT TO DO IN THE APPLICATION

**USE CONVERTDATA ON ETA DATA BEFORE FILTERING DATA USING filterCSMS OR filterClients**

FILTERCSMS
	applies a filter on csms data by geo, market, csm name, client name, and by how much the csm is overutilized

calc total geo util:
		1. Use convertData and pass in teams, clients, users and otherWorks data from ETA
		2. Use filterCSMS and pass in result from convert data, and geo as a filter parameter
		3. Pass in the return value of filterCSMS to the data parameter in the calculateUtilization function
		4. Pass in date as the current date. Can pass in future date if you want to calculate util for a future date

array of CSMs in a given country :
 	1. use filterCSM and pass in the country name in the country filter parameter

array of CSMs in a given geo
	1. use filterCSM and pass in the geo name in the geo filter parameter

filter all overutilized CSMs
	1. use filterCSM and pass in true for the isOverutilized filter parameter

calc individual CSM util
	1. use filterCSMS and pass in the individual csm name in the csm filter parameter
	2. pass in the return value to the data parameter in the calculateUtilization function


FILTERCLIENTS
	find active clients, past clients, future clients : use status filter parameter
	array of clients in a given country : set the country filter parameter
	array of clients in a given geo : set the geo filter parameter
	overusing clients : set overutilizingClients filter parameter to true (NOT IMPLEMENTED YET)
	all current trial accounts : set isTrial to true in the filter parameter

total purchased by a given client : use totalPurchased function

================================================================================


================================================================================
TO USE THIS LIBRARY, MUST INCLUDE THE DATES AND USEFUL FUNCTIONS LIBRARIES
================================================================================
*/

var regions = {
	   "North America" : ["NA", "nacan", "nacomm", "nadist", "nafed", "nafss", "naind", "napub", "na", "Americas", "North America"],
		"Latin America" : ["LA", "br", "la", "mx", "Latin-America", "Latin America"],
	   "Asia Pacific" : ["AP", "JP", "anz", "asean", "ap", "gcg", "isa", "jp", "korea", "Asia-Pacific", "Asia Pacific"],
	   "EMEA" : ["EU", "EMEA", "benelux", "cee", "dach", "eu", "fr", "it", "mea", "nordics", "spgi", "ssa", "uki"]
   };


function Query() {

	var dates = new Dates();
	var library = new UsefulFunctions();

	this.convertData = function(teams, clients, users, otherWorks) {

		var csmList = [];
		for (var i = 0; i < teams.length; i++) {
			for (var j = 0 ; j < teams[i].csmInfo.length; j++) {

				var start;
				var end;

				var date = new Date();

				if(!teams[i].csmInfo[j].csmExit) {
					end = new Date(date.getYear()+1910, date.getMonth(), date.getDay());
				} else end = new Date(teams[i].csmInfo[j].csmExit);

				if(!teams[i].csmInfo[j].csmOnboard) {
					start = new Date(date.getYear()+1890, date.getMonth(), date.getDay());
				} else start = new Date(teams[i].csmInfo[j].csmOnboard);

				var clientObj = {};
				clientObj.id = teams[i].clientId;
				clientObj.accountID = teams[i]._id;
				clientObj.clientName = this.fetchClientNameFromID(clients, teams[i].clientId);
				clientObj.clientCapacity = teams[i].csmInfo[j].csmCapacity;
				if (teams[i].csmInfo[j].csmPercentTimeSpent === undefined) {
					teams[i].csmInfo[j].csmPercentTimeSpent = 0;
				}
				clientObj.percentTimeSpent = teams[i].csmInfo[j].csmPercentTimeSpent ? teams[i].csmInfo[j].csmPercentTimeSpent : teams[i].csmInfo[j].csmCapacity; //if the work effort is blank, assume it is the capacity
				clientObj.clientMarket = teams[i].clientRegion;
				clientObj.clientRegion = this.mapMarketToRegion(teams[i].clientRegion);
				clientObj.clientSentiment = teams[i].clientSentiment;
				clientObj.clientStart = start.toISOString();
				clientObj.clientEnd = end.toISOString();
				clientObj.isTrial = teams[i].csmInfo[j].contractType;

				clientObj.report = {};
				clientObj.report.nextSteps = teams[i].nextSteps;
				clientObj.report.projectSummary = teams[i].projectSummary;
				clientObj.report.goals = teams[i].goals;

				clientObj.csm = teams[i].csmInfo[j].name;
				clientObj.role = teams[i].csmInfo[j].csmRole.toUpperCase();
				clientObj.milestone = teams[i].milestoneInfo;
				clientObj.issue = teams[i].issueInfo;
				clientObj.country = this.mapShortNameToCountry(teams[i].csmInfo[j].csmRegion);

				if (library.contains(teams[i].csmInfo[j].name, csmList, "csmName") > -1) {
					csmList[library.contains(teams[i].csmInfo[j].name, csmList, "csmName")].clients.push(clientObj);
				} else {
					var csmObj = {};
					csmObj.csmName = teams[i].csmInfo[j].name;
					csmObj.id = this.mapCSMNameToID(csmObj.csmName, users, teams[i].csmInfo[j].uid);
					csmObj.clients = [];
					var otherWork = this.addOtherWorkToClients(csmObj.id, otherWorks);
					for(var k = 0; k < otherWork.length; k++) {
						otherWork[k].csm = teams[i].csmInfo[j].name;
						csmObj.clients.push(otherWork[k]);
					}
					csmObj.csmCapacity = 100 - this.sumOtherWork(csmObj.id, otherWorks);
					csmObj.region = this.mapMarketToRegion(this.getRegion(csmObj.id, clientObj, users));

					csmObj.status = this.getStatus(csmObj.id, users);
					csmObj.clients.push(clientObj);
					csmObj.otherWork = this.sumOtherWork(csmObj.id, otherWorks);
					csmList.push(csmObj);
				}
			}
		}
		for(var i = 0; i < csmList.length; i++) {
			csmList[i].assigned = this.calculateCSMAssigned([csmList[i]], new Date());
			csmList[i].workEffort = this.calculateWorkEffort([csmList[i]], new Date());
			csmList[i].utilization = this.calculateUtilization([csmList[i]], new Date());
		}
		csmList = this.filterCSMS(csmList, {hasActiveClient: true});
		return csmList;
	}

	this.getMarket = function (id, clientObj, users){
		for(var i = 0; i < users.length; i++) {
			if(users[i]._id === id) {
				return users[i].market;
			}
		}
		return clientObj.clientRegion;
	}

	this.getRegion = function (id, clientObj, users){
		for(var i = 0; i < users.length; i++) {
			if(users[i]._id === id) {
				return users[i].region;
			}
		}
		return clientObj.clientRegion;
	}

	this.getStatus = function (id, users){
		for(var i = 0; i < users.length; i++) {
			if(users[i]._id === id) {
				return users[i].userStatus;
			}
		}
	}

	this.mapCSMIdToName = function(id, users) {
		for(var i = 0; i < users.length; i++) {
			if(users[i]._id === id) {
				var fn = this.capitalizeFirstLetter(users[i].fn.toLowerCase());
				var ln = this.capitalizeFirstLetter(users[i].ln.toLowerCase());
				var space = " ";
				var name = fn.concat(space).concat(ln);
				return name;
			}
		}
	}

	this.mapCSMNameToID = function(name, users, uid) {
		if (uid) return uid;
		else {
			for(var i = 0; i < users.length; i++) {
				var fn = this.capitalizeFirstLetter(users[i].fn.toLowerCase());
				var ln = this.capitalizeFirstLetter(users[i].ln.toLowerCase());
				var space = " ";
				var dataName = fn.concat(space).concat(ln);
				if(dataName === name) {
					return users[i]._id;
				}
			}
		}
	}

	this.addOtherWorkToClients = function(id, otherWorks){
		var clients = [];
		for(var i = 0; i < otherWorks.length; i++) {
			if (otherWorks[i].userId === id) {
				otherWorkObj = {};
				otherWorkObj.clientCapacity = otherWorks[i].percentTimeSpent;
				otherWorkObj.clientName = otherWorks[i].description;
				otherWorkObj.clientStart = otherWorks[i].startDate;
				otherWorkObj.clientEnd = otherWorks[i].endDate;
				otherWorkObj.role = "Other";
				clients.push(otherWorkObj);
			}
		}
		return clients;
	}

	this.sumOtherWork = function(id, otherWorks) {
		var sum = 0;
		for(var i = 0; i < otherWorks.length; i++) {
			if (otherWorks[i].userId === id) {
				sum += otherWorks[i].percentTimeSpent;
			}
		}
		return sum;
	}

	this.mapShortNameToCountry = function(countryName) {
		var table = {
			'chile' : 'Chile',
			'aus' : 'Australia',
			'philippines' : 'Philippines',
			'india' : 'India',
			'spain' : 'Spain',
			'uk' : 'United Kingdom',
			'malaysia' : 'Malaysia',
			'nz' : 'New Zealand',
			'germany' : 'Germany',
			'canada' : 'Canada',
			'us' : 'United States',
			'br' : 'Brazil',
			'fr' : 'France',
			'jp' : 'Japan',
			'korea' : 'Korea',
			'mx' : 'Mexico'
		};
		return table[countryName];
	}

	this.capitalizeFirstLetter = function(string) {
	    return string.charAt(0).toUpperCase() + string.slice(1);
	}

	this.filterCSMS = function(csmList, filter) {
		/* =====================================================================
			DOCUMENTATION
		========================================================================
		data : the data from the CSM schema
		filter : is an object of params with the following properties
			geo (string) : filter by geo
			geos (array of strings) : filter by geos
			market (string): filter by market
			markets (array of markets) : filter by markets
			exceptMarkets (array of markets): ignore CSM's in these markets
			csm : filter by the CSM name
			csms : filter by CSM names
			client (string) : filter which CSMs are associated with a given client
				i.e. "American Airlines"
			isOverutilized (boolean) :
				if true : filters for CSMs that are overutilized
			isUnderutilized (boolean):
				if true: filters for CSMs that are underutilized
			hasActiveClient (boolean):
				if true: filters for CSMs that have an active clients
		return value : an array of all CSM objects identical to the CSM schema that meet all of the filter criteria

		========================================================================
			END OF DOCUMENTATION
		========================================================================*/
		var results = [];
		for(var i = 0; i < csmList.length; i++) {
			//go through each CSM in the array and apply each filter. If any one of the filters does not apply, go to the next iteration in the for loop

			//check geo filter
			if(filter.geo && filter.geo !== 'Global' && csmList[i].region !== filter.geo) {
				continue;
			}

			//check geos filter
			if(filter.geos && library.contains(csmList[i].region, filter.geos) === -1) {
				continue;
			}

			//check market filter
			if(filter.market && csmList[i].market !== filter.market) {
				continue;
			}

			//check markets filter
			if(filter.markets && library.contains(csmList[i].market, filter.markets) === -1) { //NOT SUPPORTED BY ETA
				continue;
			}

			//check exceptCountries filter
			if(filter.exceptMarkets && library.contains(csmList[i].market, filter.exceptMarkets) !== -1) {
				continue;
			}

			//check csm filter
			if(filter.csm && csmList[i].csmName !== filter.csm) {
				continue;
			}

			//check csms filter
			if(filter.csms && library.contains(csmList[i].csmName, filter.csms) === -1) {
				continue;
			}

			//check the client filter
			if(filter.client && library.contains(filter.client, csmList[i].clients, "clientName") === -1) {
				continue;
			}

			//check overutilized filter
			if(filter.isOverutilized) {
				if ((csmList[i].assigned <= csmList[i].csmCapacity) && ((csmList[i].workEffort <= csmList[i].csmCapacity) || (isNaN(csmList[i].workEffort)))) {
					continue;
				}
			}

			//check underutilized filter
			if(filter.isUnderutilized && (csmList[i].assigned >= csmList[i].csmCapacity)) {
				continue;
			}

			//check MaxUtilizedfilter
			if(filter.isMaxUtilized && (csmList[i].assigned != csmList[i].csmCapacity)) {
				continue;
			}

			if(filter.hasActiveClient && csmList[i].assigned === 0) {
				continue;
			}

			//passed through all of the filters, so can push into results array
			results.push(csmList[i]);
		}
		return results;
	}

	this.isEngagementCurrent = function(start, end) {
		/* =====================================================================
			DOCUMENTATION
		========================================================================
		start: (JavaScript Date) start date of the engagement
		end: (JavaScript Date) end date of the engagement
		return value : a boolean to state whether or not the engagement with the stated start and end dates is current
		========================================================================
			END OF DOCUMENTATION
		========================================================================*/
		var current = new Date();
		if (start <= current && end >= current) return true;
		return false;
	}

	this.calculateCSMAssigned = function(csm, date) {
		/* =====================================================================
			DOCUMENTATION
		========================================================================
		csm : an array of CSMS from which you want to calculate the assignment. For example, if you want to calculate the total assigned for Americas, call filterCSMs with Americas as the geo filter and pass in the results to the data param of this function
		date (Date) : the date to find all of the active assignments
		return value : an integer which is the sum of all assignments for the CSMs in data
		========================================================================
			END OF DOCUMENTATION
		========================================================================*/
		var capacity = 0;
		for (var i = 0; i < csm.length; i++) {
			for (var j = 0; j < csm[i].clients.length; j++) {
				var today = new Date();
				if(csm[i].clients[j].role !== "Other" && dates.checkDate(today, dates.parseMongoDate(csm[i].clients[j].clientStart), dates.parseMongoDate(csm[i].clients[j].clientEnd)) === 'current') {
					capacity += csm[i].clients[j].clientCapacity;

				}
			}
		}
		return capacity;
	}

	this.calculateAssigned = function(csm, date) {
		/* =====================================================================
			DOCUMENTATION
		========================================================================
		csm (Array of CSMS) : an array of CSMS from which you want to calculate the assignment. For example, if you want to calculate the total assigned for Americas, call filterCSMs with Americas as the geo filter and pass in the results to the data param of this function
		date (Date) : the date to find all of the active assignments
		return value : an integer which is the sum of all current assignments for the CSMs in csm array
		========================================================================
			END OF DOCUMENTATION
		========================================================================*/
		var assigned = 0;
		var filter = {};
		filter.date = date;
		filter.status = 'current';
		filter.removeOthers = true;
		var engagements = this.filterClients(csm, filter);
		for (var i = 0; i < engagements.length; i++) {
				assigned += engagements[i].clientCapacity;
		}
		return assigned;
	}

	this.calculateWorkEffort = function(csm, date) {
		/* =====================================================================
			DOCUMENTATION
		========================================================================
		csm (Array of CSMS) : an array of CSMS from which you want to calculate the workEffort. For example, if you want to calculate the total workEffort for Americas, call filterCSMs with Americas as the geo filter and pass in the results to the data param of this function
		date (Date) : the date to find all of the active workEffort
		return value : an integer which is the sum of all workEffort for the CSMs in data
		========================================================================
			END OF DOCUMENTATION
		========================================================================*/
		var workEffort = 0;
		for (var i = 0; i < csm.length; i++) {
			for (var j = 0; j < csm[i].clients.length; j++) {
				var today = new Date();

				if(csm[i].clients[j].role !== 'Other' && dates.checkDate(today, dates.parseMongoDate(csm[i].clients[j].clientStart), dates.parseMongoDate(csm[i].clients[j].clientEnd)) === 'current') {
					if(csm[i].clients[j].percentTimeSpent && csm[i].clients[j].percentTimeSpent != 0) workEffort += csm[i].clients[j].percentTimeSpent;
					else workEffort += csm[i].clients[j].clientCapacity; //if the CSM did not fill out their work Effort, assume that is it equal to the contract's capacity
				}
			}
		}
		return workEffort;
	}

	this.calculateCSMWorkEffort = function(csms) {
		/* =====================================================================
			DOCUMENTATION
		========================================================================
		csms (Array of CSMS) : an array of CSMS from which you want to calculate the workEffort. For example, if you want to calculate the total workEffort for Americas, call filterCSMs with Americas as the geo filter and pass in the results to the data param of this function
		return value : an integer which is the sum of all work effort of the assignments for the CSMs in csms
		========================================================================
			END OF DOCUMENTATION
		========================================================================*/
		var workEffort = 0;
		for(var i = 0; i < csms.length; i++) {
			if(csms[i].workEffort) workEffort += csms[i].workEffort;
		}

		return workEffort;
	}

	this.calculateCapacity = function(data) {
		/* =====================================================================
			DOCUMENTATION
		========================================================================
		data (Array of CSMS) : an array of CSMS from which you want to calculate the capacity. For example, if you want to calculate the total capacity for Americas, call filterCSMs with Americas as the geo filter and pass in the results to the data param of this function
		date (Date) : the date to find all of the active assignments
		return value : an integer which is the sum of all assignments for the CSMs in data
		========================================================================
			END OF DOCUMENTATION
		========================================================================*/
		var capacity = 0;
		for(var i = 0; i < data.length; i++) {
			capacity += data[i].csmCapacity;
		}
		return capacity;
	}

	this.calculateUtilization = function(data, date) {
		/* =====================================================================
			DOCUMENTATION
		========================================================================
		data (Array of CSMS) : an array of CSMS from which you want to calculate the utilization. For example, if you want to calculate the total assigned for Americas, call filterCSMs with Americas as the geo filter and pass in the results to the data param of this function
		date (Date) : the date to find all of the active assignments
		return value : an float which is the capacity of all CSMs in data, rounded to two decimal places
		========================================================================
			END OF DOCUMENTATION
		========================================================================*/

		if (this.calculateCapacity(data) === 0 || this.calculateCapacity(data) === null) {
			return 0;
		}

		return this.calculateCSMWorkEffort(data)/this.calculateCapacity(data) * 100;

	}

	this.calculateAssignedUtilization = function(data, date) {
		/* =====================================================================
			DOCUMENTATION
		========================================================================
		data (Array of CSMS) : an array of CSMS from which you want to calculate the assigned utilization. For example, if you want to calculate the total assigned for Americas, call filterCSMs with Americas as the geo filter and pass in the results to the data param of this function
		date (Date) : the date to find all of the active assignments
		return value : an float which is the capacity of all CSMs in data, rounded to two decimal places
		========================================================================
			END OF DOCUMENTATION
		========================================================================*/

		if (this.calculateCapacity(data) === 0 || this.calculateCapacity(data) === null) {
			return 0;
		}

		return this.calculateCSMAssigned(data)/this.calculateCapacity(data) * 100;
	}

	this.mapMarketToRegion = function (market) {
		/* =====================================================================
			DOCUMENTATION
		========================================================================
		PURPOSE: maps all of ETA's "markets" to our "regions" ("North America", "Latin America", "EMEA" or "Asia-Pacific")
		market (String): a String that holds an ETA "market"
		regions (Object): an object (declared at the top of the file) that map keys (regions) to arrays (array of markets)
		keys (Array of Strings): an array that holds all the keys (i.e., "North America") for the regions object
		return value : a String with the appropriate region this market maps to ("Americas", "EMEA", "Asia-Pacific") OR null
		========================================================================
			END OF DOCUMENTATION
		========================================================================*/
		var keys = Object.keys(regions);
		for (var i = 0; i < keys.length; i++) {
			for(var j = 0; j < regions[keys[i]].length; j++) {
				if(regions[keys[i]][j] === market) {
					return keys[i];
				}
			}
		}
		return null;
	}

	this.isMarketInRegion = function (clients, marketsAccepted) {
		/* =====================================================================
			DOCUMENTATION
		========================================================================
		PURPOSE: NOT USED??
		market : a String that holds an ETA "market"
		keys : an array that holds all the keys for the "regions" array ("Americas", "EMEA", or "Asia-Pacific")
		return value : a String with the appropriate region ("Americas", "EMEA", "Asia-Pacific") OR null
		========================================================================
			END OF DOCUMENTATION
		========================================================================*/
		for(var i = 0; i < clients.length; i++) {
			if(library.contains(clients[i].clientMarket, marketsAccepted) > -1) {
				return true;
			}
		}
		return false;
	}

	this.isMarketInRegions = function(clients, regionsAccepted) {
		/* =====================================================================
			DOCUMENTATION
		========================================================================
		PURPOSE: NOT USED??
		regionsRequired (ARRAY OF STRINGS): one or more of "Americas", "Asia-Pacific" or "EMEA"
		regions (Array of Geo Objects): (declared at the top of this file) an array that maps all etaRegions to their respective geos
		return value : a boolean that states whether the etaRegion is actually in the geo
		========================================================================
			END OF DOCUMENTATION
		========================================================================*/
		for (var i = 0; i < regionsAccepted.length; i++) {
			if(this.isMarketInRegion(clients, regions[regionsAccepted[i]])) return true;
		}
		return false;
	}

	this.filterClients = function(csmList, filter) {
		/* =====================================================================
			DOCUMENTATION
		========================================================================
		data : the data from the CSM schema
		filter : is an object of params with the following properties
			name (string) : filter by the client name
			csmGeo (string) : filter by the geo of the client
			geo (string) : filter by the geo of the client
			geos (array of strings) : filter by geos of the client in the array
			country (string): filter by country of the client
			countries (array of countries) : filter by countries of the clients
			csmCountry (string) : filter by the country of the client
			date (Date) : set the date for which clients past, current and futrue will be compared to
			endDate (Date) : if specified, filter clients who have contracts active from date to endDate (NOT IMPLEMENTED YET)
			statuses (Array of Strings) date FILTER VARIABLE MUST BE SPECIFIED : An array which can include 'past', 'current' or 'future'. Will filter clients based on this
			status (string) : can either be 'past', 'current' or 'future'
			overusing (boolean) : if true, returns all clients that are overusing (NOT IMPLEMENTED YET)
			isTrial (boolean) : if true, returns all clients on a trial account √
			removeOthers (boolean) : if true, will filter out non-CSM work, other CSM work, Other Watson Duties, etc √
			removeDuplicates (boolean) : if true, will not add in a client with
				the same name to the return value array. Instead, it will add a
				field call "associated CSMs" and add the CSM. It will also add
				to the cap variable the total premium support purchased by the
				client
		return value : an array of all client objects that meet all of the filter criteria
		========================================================================
			END OF DOCUMENTATION
		========================================================================*/

		var results = [];
		for(var i = 0; i < csmList.length; i++) {
			var clients = [];
			for(var j = 0; j < csmList[i].clients.length; j++) {
				//check for removeOthers filter
				if(filter.removeOthers && csmList[i].clients[j].role === 'Other') { //THIS NEEDS TO BE UPDATED WHEN ETA GETS USER PROFILE
					continue;
				}

				if (filter.onlyOthers && csmList[i].clients[j].role !== 'Other') {
					continue;
				}

				if(filter.name && csmList[i].clients[j].clientName !== filter.name) {
					continue;
				}

				//check for isTrial filter
				if(filter.isTrial && csmList[i].clients[j].isTrial !== "trial") {
					continue;
				}

				if (filter.ignoreTrial && csmList[i].clients[j].isTrial !== "premsupp") {
					continue;
				}

				if(filter.country && filter.country !== csmList[i].clients[j].country) { //NOT SUPPORTED BY ETA
					continue;
				}

				if(filter.countries && library.contains(csmList[i].clients[j].clientCountry, filter.countries) === -1) { //NOT SUPPORTED BY ETA
					continue;
				}

				if(filter.geo && filter.geo !== 'Global' && filter.geo !== csmList[i].clients[j].clientRegion) {
					continue;
				}

				if(filter.geos && library.contains(csmList[i].clients[j].clientRegion, filter.geos) === -1) {
					continue;
				}

				//filter for client dates
				//check if the start Date passed in the filter corresponds to the status passed inside the filter the start and end date of the client contract
				if(filter.status && filter.date && dates.checkDate(filter.date, dates.parseMongoDate(csmList[i].clients[j].clientStart), dates.parseMongoDate(csmList[i].clients[j].clientEnd)) !== filter.status) {
					continue;
				}

				if(filter.statuses && filter.date && library.contains(dates.checkDate(filter.date, dates.parseMongoDate(csmList[i].clients[j].startDate), dates.parseMongoDate(csmList[i].clients[j].endDate)), filter.statuses) === -1) {
					continue;
				}

				//removeDuplicates must be the last filter
				if(filter.removeDuplicates) {
					var index = library.contains(csmList[i].clients[j].id, results, "id");
					if(index !== -1) { //if client has already been added to results, update totalPurchased and numberOfContracts
						results[index].totalPurchased += csmList[i].clients[j].clientCapacity;
						results[index].numberOfContracts += 1;
						var csmNameIndex = library.contains(csmList[i].csmName, results[index].associatedCSMS.split(','));
						if(csmNameIndex === -1) {
							results[index].associatedCSMS += ",";
							results[index].associatedCSMS += csmList[i].csmName;
						}

						results[index].csms.push({
													name: csmList[i].csmName,
													start: new Date(csmList[i].clients[j].clientStart),
													end: new Date(csmList[i].clients[j].clientEnd),
													timeSpent: csmList[i].clients[j].percentTimeSpent,
													market: csmList[i].market,
													region: csmList[i].region,
													assigned: csmList[i].clients[j].clientCapacity,
													percentTimeSpent: csmList[i].clients[j].percentTimeSpent
												});
						// else {
						// 	results[index].csms[csmNameIndex].assigned += csmList[i].clients[j].clientCapacity;
						// }

						continue;
					} else {
						csmList[i].clients[j].totalPurchased = csmList[i].clients[j].clientName;
						csmList[i].clients[j].totalPurchased = csmList[i].clients[j].clientCapacity;
						csmList[i].clients[j].associatedCSMS = csmList[i].csmName;
						csmList[i].clients[j].numberOfContracts = 1;
						csmList[i].clients[j].csms = [{
													name: csmList[i].csmName,
													start: new Date(csmList[i].clients[j].clientStart),
													end: new Date(csmList[i].clients[j].clientEnd),
													timeSpent: csmList[i].clients[j].percentTimeSpent,
													market: csmList[i].market,
													region: csmList[i].region,
													assigned: csmList[i].clients[j].clientCapacity,
													percentTimeSpent: csmList[i].clients[j].percentTimeSpent
												}];
					}
				}
				results.push(csmList[i].clients[j]);
			}
		}
		return results;
	}

	this.fetchClientNameFromID = function(clients, clientID) {
		/* =====================================================================
			DOCUMENTATION
		========================================================================
		clients : data from the clients api
		clientID : id from the teams api
		return value (string) : The name of the client from the given Id
		========================================================================
			END OF DOCUMENTATION
		========================================================================*/
		for(var i = 0; i < clients.length; i++) {
			if(clientID === clients[i]._id) {
				return clients[i].name;
			}
		}
		return undefined;
	}

	this.fetchIDFromClientName = function(clients, clientName) {
		/* =====================================================================
			DOCUMENTATION
		========================================================================
		clients : data from the clients api
		clientName : name found in clients collection
		return value (string) : ID of the given clientName
		========================================================================
			END OF DOCUMENTATION
		========================================================================*/
		for(var i = 0; i < clients.length; i++) {
			if(clientName === clients[i].name) {
				return clients[i]._id;
			}
		}
		return undefined;
	}

	this.filterCountries = function(data, filter) {
		/* =====================================================================
			DOCUMENTATION
		========================================================================
		data : data from CSM schema
		filter : parameters to filter by
			geo : the geo for which you want to filter by
			geos  : the geos for which you want to filter by
			country : the country for which you want to filter by
			countries : the countries for which you want to filter by
		return value : array of country objects with the following properties
			name (string) : name of country
			capacity (number) : aggregate capacity of the country
			assignments (number) : aggregate assignments of the country
			numberOfContracts (number) : total number of contracts for that country
			numberOfCSMS (number) : total number of CSMs for that country
		========================================================================
			END OF DOCUMENTATION
		========================================================================*/
		var results = [];
		for(var i = 0; i < data.length; i++) {
			if(filter.geo && filter.geo !== data[i].region) {
				continue;
			}

			if(filter.country && filter.country !== data[i].country) {
				continue;
			}

			if (filter.exceptCountries && library.contains(data[i].country, filter.exceptCountries) !== -1) {
				continue;
			}

			var obj = {};
			var index = library.contains(data[i].country, results, "name");
			if(index === -1) {
				obj.name = data[i].country;
				obj.numberOfContracts = this.filterClients([data[i]], {geo: 'LA', status: 'current', date: new Date, removeOthers: true}).length
				// obj.contracts = this.filterClients([data[i]], {country: data[i].country, status: 'current', date: new Date, removeOthers: true});
				obj.numberOfCSMS = 1;
				obj.capacity = data[i].cap;
				obj.assignments = this.calculateAssigned([data[i]], new Date());
				results.push(obj);
			} else {
				// results[index].numberOfContracts += data[i].clients.length;

				results[index].numberOfCSMS += 1;
				results[index].capacity += data[i].cap;
				results[index].assignments += this.calculateAssigned([data[i]], new Date());
			}
		}

		return results;


	}

	this.totalPurchased = function(data, client) {
		/* =====================================================================
			DOCUMENTATION
		========================================================================
		client (string) : the name of the client
		return value : returns the total amount of Premium support purchased for the given client name
		========================================================================
			END OF DOCUMENTATION
		========================================================================*/
		var engagements = this.filterClients(data, {name: client});
		var amountPurchased = 0;
		for(var i = 0;  i < engagements.length; i++) {
			amountPurchased += engagements[i].cap;
		}

		return amountPurchased;
	}
};
