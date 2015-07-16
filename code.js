/**
* Script converts postcode data from a single spreadsheet column
* into latitude and longitude coordinates.
* These are inserted into the first empty column of the same spreadsheet.
* The user selects which column to convert via a prompt from
* the Google Sheets add-on menu.
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
* @return (array) data
*/
function getUserInput() {
  var range = SpreadsheetApp.getActiveRange();
  var data = range.getValues();
  
  /*create api array from input*/  
  var apiLimit = 100;
  
  data = convertTwoToOneDimArray(data);
  
  data = createAPIArray(data, apiLimit);
  
  return data;
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
  /*get output */
  
  var output = getLatLng(input);
  
  /*add headers*/
  var headers = ['Postcodes', 'Latitude', 'Longitude'];
  output.unshift(headers);
 
  
  
  //write output
  try {
    
    var t = HtmlService.createTemplateFromFile('index');
    t.data = output;
    var html = t.evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME)
    .setTitle('Results');
    SpreadsheetApp.getUi()
    .showSidebar(html);
        
  }
  catch(e) {
    printUserMessage("Error: could not print results. Please try again.");
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
* @param {Array} data 
* @return {Array} values
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

