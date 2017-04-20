/**
 * Get total number of pages with guest data and start scraping.
 */
function initScript() {
    var tempEl = document.createElement('html'); // Dummy element to hold current page
    tempEl.innerHTML = this.responseText;

    var navDivs = tempEl.querySelectorAll('.page-numbers:not(.next)');
    totalPages = Number(navDivs[navDivs.length - 1].text);
    remainingPages = Number(navDivs[navDivs.length - 1].text) - startingPage + 1;

    scrapeGuests();
}

/**
 * Get data for all guests on the current page.
 * 
 * @param {object} request - XMLHttpRequest request object.
 * @param {number} pageIdx - Index for the current page in the global guestData array.
 */
function scrapeSinglePage(request, pageIdx) {
    console.log('Scraping page ' + String(pageIdx + 1) + '/' + String(totalPages) + ' (' + String(remainingPages) + ' more to go)...');

    var tempEl = document.createElement('html'); // Dummy element to hold current page
    tempEl.innerHTML = request.responseText;
    var guests = tempEl.getElementsByClassName('flex');
    guestData[pageIdx] = [];
    var tempGuest;

    for (var j = 0; j < guests.length; j++) {
        tempGuest = {
            'name'          : (guests[j].querySelector('.flex-contents > h2') === null ? '' : guests[j].querySelector('.flex-contents > h2').innerText),
            'country'       : (guests[j].querySelector('.list-country')       === null ? '' : guests[j].querySelector('.list-country').innerText),
            'expo-location' : (guests[j].querySelector('.list-location')      === null ? '' : guests[j].querySelector('.list-location').innerText),
            'products'      : (guests[j].querySelector('.list-products')      === null ? '' : guests[j].querySelector('.list-products').innerText),
            'more-info-url' : guests[j].firstElementChild.href
        };
        guestData[pageIdx].push(tempGuest);
    }

    remainingPages--;
    if (remainingPages === 0) {
        exportCsv();
    }
}

/**
 * Save data for all guests in the global array guestData.
 * The data is extracted from https://www.mobileworldcongress.com/exhibitors.
 */
function scrapeGuests() {
    var baseUrl = 'https://www.mobileworldcongress.com/exhibitors/page/';  // Base for the pagination links
    var requests = [];
    for (var i = startingPage;  i <= totalPages; i++) {
        (function (i){
            requests[i] = new XMLHttpRequest();
            requests[i].addEventListener('load', function() {
                scrapeSinglePage(this, i - 1);
            });
            requests[i].open('GET', baseUrl + String(i));
            requests[i].send();
        })(i);
    }
}

/**
 * Export guest data from the array guestData in a csv file.
 * The user will be presented with a save/open file pop-up.
 */
function exportCsv() {
    console.log('Exporting data in csv file...');

    var line, counter = 0;
    var fullCsv = 'data:text/csv;charset=utf-8,"number","name","country","expo location","products","more info url"%0A';  // %0A is a new line char
    for (var i = startingPage - 1; i < totalPages; i++) {
        for (var j = 0; j < guestData[i].length; j++) {
            counter++;
            line = '"' + String(counter) + '",'+ '"' + guestData[i][j]['name'] + '",' + '"' + guestData[i][j]['country'] + '",' + '"' + guestData[i][j]['expo-location'] + '",' + '"' + guestData[i][j]['products'] + '",' + '"' + guestData[i][j]['more-info-url'] + '"%0A';  // %0A is a new line char
            fullCsv += line;
        }
    }
    // Create dummy link to download csv
    var a = document.createElement('a');
    a.href = fullCsv;
    a.target = '_blank';
    a.download = 'mobileworldcongress.csv';
    document.body.appendChild(a);
    a.click();
}

var guestData = [];
var totalPages, remainingPages, startingPage = 1;
// Get total number of pages with guest data and start scraping them
var req = new XMLHttpRequest();
req.addEventListener('load', initScript);
req.open('GET', 'https://www.mobileworldcongress.com/exhibitors');
req.send();