barclay-viz
===========

## Where to find the raw data

http://www.tfl.gov.uk/tfl/businessandpartners/syndication/feed.aspx?email=jim@jamessiddle.net&feedId=21

## Pre-processing steps

- Extract raw data.
- CSV conversion: use Excel to load, then save as CSV.
- You may end up with Excel default line endings (^M in vim); convert using:

    tr "\r" "\n"  

## Summarize journeys

- Run through summ_by_X.rb
- Scripts for day versus journey summaries
- Input read from STDIN
- Specify output CSV file as first param
- Day script requires records ordered by timestamp

## Generate CSV list of boris stations

cat inputs/boris_station_snapshot.xml | ./parse_stations.rb outputs/boris_stations.csv

## Generate ranked list of customers (for filtering)

awk -F"," '{print $4}' inputs/csv/*.csv | sort | uniq -c | sort > outputs/riders/top_customer.ids

## Prepare data for Gephi

- Load CSV of journeys into your Spreadsheet software
- Filter down to manageable set (e.g. top 2k / popular routes; eliminate missing bikes)
- Create edge table: 'Source', 'Target', 'Weight' columns. Store for use in Gephi.
- Copy boris station list for Gephi use
- If Source and Target are station names (rather than IDs), change 'name' column name to 'id' in the node list

## Import data into Gephi

- Open Gephi, go to Data Lab
- Import spreadsheet - straight edge table
- Import spreadsheet - node list
- Check for duplicates (sort by name, look for blank lat/long)

## Visualize

- Apply edge and node ranking ...
- Apply clustering, then use to partition ...

