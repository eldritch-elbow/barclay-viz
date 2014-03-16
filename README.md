barclay-viz
===========

## Where to find the raw data

[TFL download link](http://www.tfl.gov.uk/tfl/businessandpartners/syndication/feed.aspx?email=dataviz@jamessiddle.net&feedId=21)

## Pre-processing steps

- Extract raw data.
- CSV conversion: use Excel or LibreOffice to load, then save as CSV.
- You may end up with Excel default line endings (^M in vim); convert in Linux/Mac OS using:

    `tr "\r" "\n"`

- When building an aggregated dataset, remember to strip headers from the CSV files


## Data processing

### Generate list of Boris Stations

#### Option 1 (derive from recent list)

1. `cat inputs/boris_station_snapshot.xml | ./parse_stations.rb outputs/boris_stations.csv`
2. `csvfix sql_insert -t stations -f 1:logical_terminal,2:full_name src_stations.03.uniq.clean.csv > src_stations.sql`

#### Option 2 (derive from source data)

1. `csvfix order -f 9,10 aggregated_data.csv > src_stations.01.orig.csv`
2. `csvfix order -f 14,15 aggregated_data.csv >> src_stations.01.orig.csv`
3. `cat src_stations.01.orig.csv | sort | uniq > src_stations.02.uniq.csv`
4. Remove leading zeros - Edit / sed / Google refine 
5. Change non-numeric terminal IDs to numeric
6. `cat src_stations.02.uniq_edit.csv | sort | uniq > src_stations.03.uniq.clean.csv`
7. `csvfix sql_insert -t stations -f 1:logical_terminal,2:full_name src_stations.03.uniq.clean.csv > src_stations.sql`
8. Remove duplicates caused by changed names (cross reference recent list of stations)

#### Notes

Option 2 yields a number of duplicate names, which are rejected on DB insertion. In each case, there are reasonable replacements in the recent data suggesting that the logical terminal IDs have been retained for modified or renamed stations. The differences are:

* Marylebone Flyover -> Paddington Green Police Station
* Gloucester Slips Car Park -> London Zoo Car Park
* Wapping Lane 2 -> Wapping Lane
* 6 -> Mechanical Workshop PS

Comparing a sample of 10 records between the two suggests the downloaded source can be used reliably as a list of logical terminal IDs. However it should be augmented with additional records from source data, such as `NA`, `0`, `Tabletop1`.

9. Load into the DB (use SQL workbench or similar) 

1. `mysql -utfl -f tfl_bike < stations.downloaded.sql`
2. `mysql -utfl -f tfl_bike < stations.source.sql`

Duplicates will be filtered from the second file by the 'force' option.

### Generate journey data

1. Ensure schema is loaded into MySQL DB
2. Fix references non-numeric terminal IDs

`csvfix edit -f 9,14 -e 's/^Tabletop1$/-2/' aggregated_data.csv  > aggregated_data.01.fix_table.csv`
`csvfix edit -f 9,14 -e 's/^NA$/-1/' aggregated_data.01.fix_table.csv > aggregated_data.02.fixed.csv`

3. Fix up dates for insertion

`csvfix edit -f 7,12 -e "s|\(.*\)|STR_TO_DATE('\1', '%e/%c/%Y %T')|" aggregated_data.02.fixed.csv > aggregated_data.03.date_func.csv`

4. Use csvfix to generate SQL statements.

`csvfix sql_insert -t journeys -f 1:rental_id,2:billable_duration,3:duration,4:customer_record_number,5:subscription_id,6:bike_id,7:end_timestamp,8:end_station_id,9:end_station_logical_term,11:end_station_priority_id,12:start_timestamp,13:start_station_id,14:start_station_logical_term,16:start_station_priority_id,17:end_hour_category_id,18:start_hour_category_id,19:bike_user_type_id -nq 7,11 aggregated_data.03.date_func.csv > aggregated_data.import.sql`

5. Load into the DB

`mysql -utfl -f tfl_bike < aggregated_data.import.sql > import.out 2>&1 &`

### CSV hacks

#### Summarize journeys directly from CSV

- Run through summ_by_X.rb
- Scripts for day versus journey summaries
- Input read from STDIN
- Specify output CSV file as first param
- Day script requires records ordered by timestamp

#### Generate ranked list of customers (for filtering)

`awk -F"," '{print $4}' inputs/csv/*.csv | sort | uniq -c | sort > outputs/riders/top_customer.ids`



## Creating Gephi vizualizations

### Prepare data for Gephi (non-DB)

- Filter journeys down to manageable set (e.g. top 2k / popular routes; eliminate missing bikes)
- Create edge table: 'Source', 'Target', 'Weight' columns. Other attributes can be added for partitioning, etc.
- Prepare for import - e.g. store as CSV for import into Gephi.
- Extract boris station list for Gephi use. Must have `id` column.

### Import data into Gephi

- Open Gephi, go to Data Lab
- Import spreadsheet - straight edge table
- Import spreadsheet - node list
- Check for added duplicates (sort by name, look for blank lat/long)
- Generate area labels (copy using regex). Step 1 == ',.*$' ... Step 2 == '[^,].*' 

### Visualize

- Apply edge and node ranking ...
- Apply clustering, then use to partition ...

### Notes

Labels in the gephi_project/complete_viz/bojo_viz3_areas_deletions.gephi vizualization have been merged for consistency.


## TODOs

### Web vizualization

0a. Try google maps tiles in leaflet
0b. Make all popups hover
1. Parameterize based on named dataset
2. Add Canary Wharf commuter(s)
3. Convert spinner to slider
4. Add sliding window for time
5. Try fixed-range scaling for edges (2-20?)
6. Try different edge opacity
7. Try edge colour range based on weight
8. Scale nodes?
9. Add optional arrows
10. Add detailed info pane





