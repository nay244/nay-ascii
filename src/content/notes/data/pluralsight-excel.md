## Formatting
Discusses the importance of cell formatting for readability and data interpretation. Key topics include number formatting, cell styles, and custom formats.

### Custom Number Formats
#### Use Cases
* Specific number formatting (Date, Time, Decimals, Accounting, Percentage, etc..)
* Data from csv file need to be formatted for analysis in 3rd party application (Leading Zeros).

![Custom_Number_Format](/static/excel/numberformats.png)

### International Currency Formats
#### Symbols for Different Currency
Accounting Formats (Does not do conversion)
![International Currency](/static/excel/internationalcurrency.png)

## Working with Data
Covers the basics of data entry, manipulation, and sorting. Emphasizes on efficient data management techniques.

### Outline Data
#### Group Data to Create Outlines
Data > Outline > Group/Ungroup
![Outline Pre](/static/excel/outline_pre.jpg)
![Outline Post](/static/excel/outline_post.png)

### Insert Subtotals
#### Get Subtotal Amount for a Specific Group
Data > Outline > Subtotal <br>
First sort list by criteria to subtotal by.
![Subtotal](/static/excel/subtotal.png)

### Insert References
#### References Rows and Columns
* Relative reference example: =sum(C6:F6)
* Absolute reference example: =sum(G7*$F$3) <br>

![References](/static/excel/references.png)

### Reference Data by Using Structured References
#### Reference Data by Use of Table Names
* Count of fields in table Sales: =COUNT(Sales)
* Max Change of values in table Sales: =MAX(Sales[Change]) <br>

![Structured Reference](/static/excel/structured_reference.png)

### Consolidate Data
#### Consolidating Data From Multiple Workbooks
Data > Data Tools > Consolidate <br>
![Consolidate](/static/excel/consolidate.png)

### Configure Data Validation
#### Limit User Inputs
Data > Data Tools > Data Validation <br>
![Data Validation](/static/excel/data_validate.png)


### Analyze Data
#### Extract Information from Data
Home > Analysis > Analyze Data
* Create PivotTables, PivotCharts, Suggestions, etc.. <br>

![Analyze Data](/static/excel/data_analyze.png)


### Look Up Data by Using the XLOOKUP Function
#### Successor to VLOOKUP, HLOOKUP, LOOKUP
Formulas > Function Library > Lookup & Reference > XLOOKUP<br>
* Find return value in same row <br>

![XLOOKUP](/static/excel/xlookup.png)

### Look Up Data by Using the XMATCH Function
#### New Version of MATCH function
Formulas > Function Library > Lookup & Reference > XMATCH<br>
* Perform a lookup and return a horizontal or vertical position<br>

![XMATCH](/static/excel/xmatch.png)

## Power Query
Explains how to use Power Query for advanced data import and transformation. Highlights include merging and cleaning data sets.

### Import, Transform, and Connect to Data
#### Connect Data from Workbooks Using Power Query
Start with brand new workbook to import data to.
* Data > Get Data > From File
* Select Excel data file in Navigator and click Transform Data to open Power Query editor.
* Choose relevant columns
* Create connection by choosing Close & Load to
* Get Data from another workbook: Data > Get Data > From File <br>

![Import Data 1](/static/excel/import_data_1.png)
![Import Data 2](/static/excel/import_data_2.png)


### Combine and Display Data
#### Use Power Query to Combine and Display Data
Data > Get Data > Launch Power Query Editor
* Merge queries together and gather data into a single usable workbook.
* Home > Combine > Merge Queries
* Data > Combine Queries > Merge

![Import Data 2](/static/excel/merge_queries.png)
