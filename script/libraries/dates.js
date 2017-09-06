function Dates() {
	this.monthName = function(month, useShortName) {
		/* =====================================================================
			DOCUMENTATION
		========================================================================
		month : a number 0 - 11 that is passed on by the javascript date object
		useShortName: a boolean. If true, use month short names rather than the full name
		return value : returns the name of the given month
		========================================================================
		END OF DOCUMENTATION
		=======================================================================*/
		var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
		var monthShortNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		return useShortName ? monthShortNames[month] :  months[month];
	}

	this.dayName = function(day) {
		/* =====================================================================
			DOCUMENTATION
		========================================================================
		day : a number from 0 - 6 that is passed on by the javscript date object
		return value : returns the name of the day of the week
		========================================================================
		END OF DOCUMENTATION
		=======================================================================*/
		var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
		return days[day];
	}

	this.getEndOfMonth = function(month, year) {
		/* =====================================================================
			DOCUMENTATION
		========================================================================
		month : a number from 0 - 11 that is passed on by the javscript date object
		return value : either 28, 29, 30 or 31 depending on the month
		========================================================================
		END OF DOCUMENTATION
		=======================================================================*/
		var endDates = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

		if(year % 4 === 0) {
			endDates[1] = 29;
		}

		return endDates[month];
	}

	this.getQuarter = function(param) {
		/* =====================================================================
			DOCUMENTATION
		========================================================================
		params : object of parameters
			date (Date)
			month (int)
		return value : object with "Month" and "Quarter" labels
		========================================================================
		END OF DOCUMENTATION
		=======================================================================*/
		var month;
		if(typeof param === 'object') {
			month = param.getMonth() + 1;
		} else if(typeof param === 'number') {
			month = param + 1;
		}
		return Math.ceil(month/3);
	}

	this.formatDate = function(date, format) {
		/* =====================================================================
			DOCUMENTATION
		========================================================================
		format (string) : the formats are below:
			'MM/DD/YYYY'
			'YYYY/MM/DD'
			'M Y' (i.e. July 2017)
			'fullDate' (i.e. Monday, January 18, 2017)
			'MM-YYYY' where MM is the name of the month in short for (short names for months are listed above)
		========================================================================
		END OF DOCUMENTATION
		=======================================================================*/
		if(typeof date === 'string') date = new Date(date);

		var month = date.getMonth();
		var year = date.getFullYear();
		var day = date.getDate();
		var dayOfTheWeek = date.getDay();

		if(format === 'MM/DD/YYYY') {
			return `${month}/${day}/${year}`;
		} else if(format === 'YYYY/MM/DD') {
			return `${year}/${month}/${date}`;
		} else if(format === 'M Y') {
			return `${this.monthName(month)} ${year}`;
		} else if(format === 'fullDate') {
			return `${this.dayName(dayOfTheWeek)}, ${this.monthName(month)} ${day}, ${year}`;
		} else if(format === 'MM-YYYY') {
			return `${this.monthName(month, true)}-${year}`
		} else {
			console.log("Unspecified format");
		}
	}

	this.compareDates = function(date1, date2) {
		//returns 'before' if date1 comes before date2, 'after' if date1 comes after date2 and 'on' if date1 = date2
		var date1_year = date1.getFullYear();
		var date1_month = date1.getUTCMonth();
		var date1_day = date1.getUTCDate();

		var date2_year = date2.getFullYear();
		var date2_month = date2.getUTCMonth();
		var date2_day = date2.getUTCDate();

		//compare years
		if(date1_year < date2_year) {
			return 'before';
		} else if(date1_year > date2_year) {
			return 'after';
		}

		//if years are the same, compare months
		if(date1_month < date2_month) {
			return 'before';
		} else if(date1_month > date2_month) {
			return 'after';
		}

		//if months are the same, compare days
		if(date1_day < date2_day) {
			return 'before';
		} else if(date1_day > date2_day) {
			return 'after';
		}

		return 'on';
	}

	this.checkDate = function(date, startDate, endDate) {
		/* =====================================================================
			DOCUMENTATION
		========================================================================
		date (Date): the date you want to check
		startDate (Date), endDate (Date) : the date range to be checked
		return value (string) :
			'past' if date is past date range
			'future' if date is future date range
			'current' if date is in the date range
		========================================================================
		END OF DOCUMENTATION
		=======================================================================*/
		var date_year = date.getFullYear();
		var date_month = date.getUTCMonth();
		var date_day = date.getUTCDate();

		var startDate_year = startDate.getFullYear();
		var startDate_month = startDate.getUTCMonth();
		var startDate_day = startDate.getUTCDate();

		var endDate_year = endDate.getFullYear();
		var endDate_month = endDate.getUTCMonth();
		var endDate_day = endDate.getUTCDate();

		if(this.compareDates(date, startDate) === 'before') {
			return 'future';
		} else if(this.compareDates(date, endDate) === 'after') {
			return 'past';
		} else {
			return 'current';
		}
	}

	this.generateXAxisLabels = function(params) {
		/* =====================================================================
			DOCUMENTATION
		========================================================================
		this function is used to generate the xAxisLabels on the line graph
		params : object of paramaters for generating x axis labels
			start (Date) : start Date. If not specified, takes current date
			end (Date) : end Date
			months (int) : number of months
			quarters (int) : number of quarters
		return value : object with "Month" and "Quarter" labels
		========================================================================
		END OF DOCUMENTATION
		=======================================================================*/
		var xAxisLabels = {};
		var months = [];
		var quarters = [];

		var year = params.start ? params.start.getFullYear() : new Date().getFullYear();
		var month = params.start ? params.start.getMonth() : new Date().getMonth();
		var counter;

		if(params.months) {
			counter = params.months;
		} else if(params.quarters) {
			counter = params.quarters*3;
		} else if(params.end) {
			counter = params.end.getMonth*(params.end.getFullYear() - year) - month;
		}

		for(var i = month; i < counter + month; i++) {
			if(i % 12 === 11) {
				year++;
			}
			if(i % 12 === 0) {
				months.push(this.monthName(i % 12) + ' | ' + year);
				quarters.push(this.getQuarter(i % 12).toString() + ' | ' + year);
			} else {
				if(i % 3 === 0) {
					quarters.push(this.getQuarter(i % 12).toString());
				}
				months.push(this.monthName(i % 12));
			}
		}

		xAxisLabels["Month"] = months;
		xAxisLabels["Quarter"] = quarters;
		return xAxisLabels;
	}

	this.parseMongoDate = function(mongoDate) {
		/* =====================================================================
			DOCUMENTATION
		========================================================================
		mongoDate : date format created by Mongo which is a string
		return value : function parses the string and returns a date object
		========================================================================
		END OF DOCUMENTATION
		=======================================================================*/

		// var date = new Date(mongoDate);
		// date.setHours(0);
		// date.setMinutes(0);
		// date.setSeconds(0);
		// date.setFullYear(parseInt(mongoDate.slice(0, 4)));
		// date.setMonth(parseInt(mongoDate.slice(5, 7)));
		// date.setDate(parseInt(mongoDate.slice(8, 10)));
		var date = new Date(mongoDate);

		var day = date.getUTCDate(date);
		var month = date.getUTCMonth(date);
		var year = date.getUTCFullYear(date);
		//
		date = new Date(year, month, day);

		return date;
	}
}
