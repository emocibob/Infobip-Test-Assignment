# Script info

The script `scrape-expo-data.js` collects data about the exhibitors from the Mobile World Congress website.

After the script is finished running the user will be presented with a pop-up window asking to save a csv file with the data.

## Running the script

1. To run the script open [https://www.mobileworldcongress.com/](https://www.mobileworldcongress.com/) in your browser.
2. Press F12 to open the developer tools and there select the *Console* tab.
3. Copy the content of `scrape-expo-data.js`, paste it into the console and press Enter.
4. Wait for the script to finish and save the csv file.

## Output file

After the script is finished running and you saved the `mobileworldcongress.csv` file on your computer, you can open it in MS Excel, LibreOffice Calc or any text editor.

The file has the following columns:

- `number` - row number
- `name` - company name
- `country` - company's country
- `expo location` - company's booth/location at Mobile World Congress
- `products` - company's product categories
- `more info url` - Link with more information about the company (Mobile World Congress website)
	
Data for all columns is quoted with `"` and `,` is used as a delimiter.
The file has UTF-8 encoding.

### MS Excel

Opening the csv file in Excel:

1. Open a new worksheet and select the *Data* tab.
2. There select *From Text*.
3. Choose the saved `mobileworldcongress.csv` file.
4. In the first step of the wizard select **Delimited** for *Original data type*, **1** for *Start import at row*, **65001 : Unicode (UTF-8)** for *File origin* and check *My data has headers*. Click *Next*.
5. In the second step check only **Comma** for *Delimiters* and select **"** for *Text qualifier*. Click *Next*.
6. In the third step you can set a data format for each column (the first column has numerical data and the rest is text). Here you can leave **General** for all columns. Click *Finish*.
7. In the next window you can choose where to place the data (existing or new worksheet).