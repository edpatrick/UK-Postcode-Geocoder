/**
* This application allows you to convert UK postcodes into their 
* relevant latitude and longitude coordinates.
*/


/**
* Runs automatically when a user installs an add-on
*
* @param {Object} e
*/
function onInstall(e) {
  onOpen(e);
}

/**
* Runs automatically when a user opens a spreadsheet
*
* @param {Object} e
*/
function onOpen(e) {
  var menu = SpreadsheetApp.getUi().createAddonMenu();
  menu.addItem('Geocode selection', 'writeOutput');
  menu.addItem('About', 'openAboutDialog');
  menu.addToUi();
}


/**
* returns html output from file passed as paramater
*
* @param {String} filename
*/
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
  .getContent(); 
}



/**
* Prints message to the screen
*
*/
function printUserMessage(msg) {
  var ui = SpreadsheetApp.getUi();
  ui.alert(msg); 
}

/**
* Opens 'About' page
*
*/
function openAboutDialog() {
  var html = HtmlService.createTemplateFromFile('about')
  .evaluate()
  .setSandboxMode(HtmlService.SandboxMode.IFRAME)
  .setHeight(500)
  .setWidth(700);
  var ui = SpreadsheetApp.getUi() 
  .showModalDialog(html, 'About UK Postcode Geocoder');
}




/**
* Gets user selected data from sheet and converts
* to array to be sent to API
*
* @return {array} data
*/
function getUserInput() {
  var range = SpreadsheetApp.getActiveRange();
  var data = range.getValues();
  /*create api array from input*/  
  var apiLimit = 100;
  
  data = convertTwoToOneDimArray(data);
  /*filter empty elements*/
  data = data.filter(isNotEmpty);
  data = createAPIArray(data, apiLimit);
  
  return data;
}

/*
* checks to see if parameter is an empty string
*
* @param {String} e
*
* @return {boolean}
*/
function isNotEmpty(e) {
  if (e == '') {
    return false;
  } else {
    return true; 
  }
}

/**
* Writes data retrieved from API to dialogue box
*
*/
function writeOutput() {
  
  /*get input*/
  try {
    var input = getUserInput();
  }
  catch(e) {
    printUserMessage("Error: could not get data from the sheet. Please try again.");
  }
  /*if user input is empty*/
  if (input.length < 1) {
    printUserMessage("Error: please select at least one cell with data");
  } else {
    
    /*get output */
    
    var output = getLatLng(input);
    
    /*add headers*/
    var headers = ['Postcodes', 'Latitude', 'Longitude'];
    output.unshift(headers);
    
    //write output
    try {
      //create timestamp
      var d = new Date();
      var day = d.getDate();
      var month = d.getMonth();
      var year = d.getFullYear();
      var hour = d.getHours(); 
      var min = d.getMinutes();
      var sec = d.getSeconds();
      var timestamp = day +":"+ month +":"+ year +" | "+ hour +":"+ min +":"+ sec;
      //write to new sheet
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      ss.insertSheet("Postcode Geocodes: " + timestamp);
      var sheet = ss.getActiveSheet();
      
      var outputRange = sheet.getRange(1, 1, output.length, 3);
      outputRange.setValues(output);
      
    }
    catch(e) {
      printUserMessage("Error: could not print results. Please try again.");
    }  
  }
}

/**
* Creates 2 dim array of postcodes data for api call with
* number of elements in each array index limited by api limit
*
* @param {Array} postcodes
* @param {Number} apiLimit
*
* @return {Array} apiData 
*/
function createAPIArray(postcodes, apiLimit) {
  var postcodesLength = postcodes.length;
  var apiData = [];
  var store = [];
  var count = 0;
  var numberOfLoops = 0;
  
  for (i = 0; i < postcodesLength; i += 1) {
    
    store.push(postcodes[i]);
    count +=1;
    if (count == apiLimit - 1) {
      apiData[numberOfLoops] = store;
      numberOfLoops += 1;
      store = [];
      count = 0;
    }
    
    apiData[numberOfLoops] = store;
    
  }
  
  return apiData;
  
}

/**
* Converts a two dimensional array to a one dimensional array
*
* @param {Array} twoDimArray
*
* @return {Array} oneDimArray
*/
function convertTwoToOneDimArray(twoDimArray) {
  "use strict";
  var oneDimArray, outputArrayCount, i, k, j, m;
  oneDimArray = [];
  outputArrayCount = 0;
  for (i = 0, k = twoDimArray.length; i < k; i = i + 1) {
    
    for (j = 0, m = twoDimArray[i].length; j < m; j = j + 1)
    {
      
      oneDimArray[outputArrayCount] = twoDimArray[i][j];
      outputArrayCount = outputArrayCount + 1;
      
    }
  }
  
  return oneDimArray;
  
}

/**
* Gets latitude and longitude data
*
* @param {Array} postcodes 
* @return {Array} output
*/

function getLatLng(postcodes) {
  
  var lat, lng, payload, headers, options;
  var postcodesLength = postcodes.length;
  var data = [];
  var output = [];
  var count = 0;
  for (i = 0; i < postcodesLength; i += 1) {   
    
    /*create json object for api call*/
    data[i] = {"postcodes" : postcodes[i]};
    payload = JSON.stringify(data[i]);
    headers = {'Content-type': 'application/json', 'Accept': 'text/plain'};
    options =
      {
        'method': 'post',
        'headers': headers,
        'payload': payload,   
        "followRedirects" : true,
        "muteHttpExceptions": true
      };  
    
    var url = "https://api.postcodes.io/postcodes"    
    
    /*call api*/
    try{
      var result = UrlFetchApp.fetch(url, options).getContentText(); 
      var params = JSON.parse(result);
      
      var resultLength = params['result'].length;
      
      /*convert result for output*/
      
      for (j =0; j < resultLength; j+=1) {
        if (params['result'][j]['result'] == null) {
          output[count] = (
            [params['result'][j]['query'], 
             'not a valid postcode', 
             'not a valid postcode']
          );
        } else {
          output[count] = (
            [params['result'][j]['result']['postcode'], 
             params['result'][j]['result']['latitude'], 
             params['result'][j]['result']['longitude']]
          );
        }
        
        
        count += 1;
        
        
      }
    }
    catch(e) {
      printUserMessage("Error: could not get postcode data from postcodes.io API. Please try again.");
    } 
  }
  return output;
}

