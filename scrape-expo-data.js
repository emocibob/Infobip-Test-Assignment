/**
 * Get total number of pages with guest data and start scraping.
 */
function initScript() {
    var tempEl = document.createElement('html'); // Dummy element to hold current page
    tempEl.innerHTML = this.responseText;

    var navDivs = tempEl.querySelectorAll('.page-numbers:not(.next)');
    totalPages = Number(navDivs[navDivs.length - 1].text);
    remainingPages = Number(navDivs[navDivs.length - 1].text);

    scrapeGuests();
}

/**
 * Get data for all guests on the current page.
 * 
 * @param {object} request - XMLHttpRequest request object.
 * @param {number} pageIdx - Index for the current page in the global guestData array.
 */
function scrapeSinglePage(request, pageIdx) {
    console.log('Step 1/3: Collecting guest list | Scraping page ' + String(pageIdx + 1) + '/' + String(totalPages) + ' (' + String(remainingPages) + ' more pages to go)...');

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
        getContactInfo();
    }
}

/**
 * Save data for all guests in the global array guestData.
 * The data is extracted from https://www.mobileworldcongress.com/exhibitors.
 */
function scrapeGuests() {
    var baseUrl = 'https://www.mobileworldcongress.com/exhibitors/page/';  // Base for the pagination links
    var requests = [];
    for (var i = 1;  i <= totalPages; i++) {
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
 * Scrape contact info from a company's page on https://www.mobileworldcongress.com/.
 * 
 * @param {object} request - XMLHttpRequest request object.
 * @param {number} idx     - Index of company in the global array guestAllData.
 * @param {string} url     - URL to company's page on https://www.mobileworldcongress.com/.
 */
function scrapeSingleContactInfo(request, idx, url) {
    console.log('Step 2/3: Collecting contact details | Scraping contact info from ' + url + ' (' + Number(remainingContacts) + ' more contacts to go)...');
    
    var tempEl = document.createElement('html'); // Dummy element to hold current page
    tempEl.innerHTML = request.responseText;

    var contactInfo = null;
    var titleDivs = tempEl.getElementsByClassName('tag-title');
    for (var j = 0; j < titleDivs.length; j++) {
        if (titleDivs[j].innerText === 'Contact Details') {
            contactInfo = titleDivs[j].nextElementSibling.innerText.replace(/\n+/g, ', ').replace(/, $/g, '').replace(/^\s/, '');
            break;
        }
    }
    guestAllData[idx]['contact-info']    = (contactInfo === null ? '' : contactInfo);
    guestAllData[idx]['company-website'] = (tempEl.getElementsByClassName('websitebox').length === 0 ? '' : tempEl.getElementsByClassName('websitebox')[0].href);

    remainingContacts--;
    if (remainingContacts === 0) {
        exportCsv();
    }
}

/**
 * Get contact info for all entries (companies) in the global array guestData.
 */
function getContactInfo() {
    guestAllData = [].concat.apply([], guestData);  // Convert 2D array to 1D
    remainingContacts = guestAllData.length;
    var contactRequests = [];
    for (var i = 0; i < guestAllData.length; i++) {
        (function(i){
            contactRequests[i] = new XMLHttpRequest();
            contactRequests[i].addEventListener('load', function() {
                scrapeSingleContactInfo(this, i, guestAllData[i]['more-info-url']);
            });
            contactRequests[i].open('GET', guestAllData[i]['more-info-url']);
            contactRequests[i].send();
        })(i);
    }
}

/**
 * Export guest data from the array guestAllData in a csv file.
 * The user will be presented with a save/open file pop-up.
 */
function exportCsv() {
    console.log('Step 3/3: Exporting | Saving data to csv file...');

    var line, counter = 0;
    var fullCsv = 'data:text/csv;charset=utf-8,"number","name","country","expo location","products","contact info","website"%0A';  // %0A is a new line char
    for (var i = 0; i < guestAllData.length; i++) {
        counter++;
        line = '"' + String(counter) + '","' + guestAllData[i]['name'] + '","' + guestAllData[i]['country'] + '","' + guestAllData[i]['expo-location'] + '","' + guestAllData[i]['products'] + '","' + guestAllData[i]['contact-info'] + '","' + guestAllData[i]['company-website'] + '"%0A';  // %0A is a new line char
        fullCsv += line;
    }
    // Create dummy link to download csv
    var a = document.createElement('a');
    a.href = fullCsv;
    a.target = '_blank';
    a.download = 'mobileworldcongress.csv';
    document.body.appendChild(a);
    a.click();
}

var guestData = [], guestAllData;
var totalPages, remainingPages, remainingContacts;
// Get total number of pages with guest data and start scraping them
var req = new XMLHttpRequest();
req.addEventListener('load', initScript);
req.open('GET', 'https://www.mobileworldcongress.com/exhibitors');
req.send();