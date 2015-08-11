# UK-Postcode-Geocoder

Google Sheets addon that allows you to convert UK postcodes into geographic information, including latitude/longitude coordinates, country, region and constituency.

## Installation

You can install the addon to Google Sheets via the [Google Sheets store](https://chrome.google.com/webstore/detail/uk-postcode-geocoder/bjkecdilmiedfkihpgfhfikchkghliia).

## How do I use it?

Select cells containing postcode data and click “Add-ons > UK Postcode Geocoder > Geocode selection” to convert the data into latitude/longitude.

Results will be displayed in a new sheet.

## What do you mean by 'UK postcodes'?

The application currently will only provide latitude and longitude coordinates for active (i.e. currently in use and no discontinued) UK postcodes according to the ONS' Postcode Directory for November 2014 via postcodes.io: http://postcodes.io/about

Postcodes can be upper or lower case and contain no spaces or 1 space before the last 3 characters (see examples below). Other formatting is likely to return an error.

 - wc1e 6bt
 - wc1e6bt
 - SW4 0BY
 - SW40BY

Postcodes or zip codes from other countries will return a 'not a valid postcode' error.


## Where is your data from?

This application uses UK postcode data under the Open Government Licence for public sector information: http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/

The data is pulled from the postcodes.io API: https://postcodes.io/

## Licensing
  
Please see the file called LICENSE.
