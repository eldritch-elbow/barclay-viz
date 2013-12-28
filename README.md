barclay-viz
===========

## Where to find the raw data

http://www.tfl.gov.uk/tfl/businessandpartners/syndication/feed.aspx?email=jim@jamessiddle.net&feedId=21

## Pre-processing steps

- Extract raw data...
- CSV conversion: use Excel to load, then save as CSV
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

## Prepare data for Gephi

- Load CSV of journeys into excel
- Filter down to manageable set (e.g. top 2k / popular routes; eliminate missing bikes)
- Create edge table: 'Source', 'Target', 'Weight' columns. Store for use in Gephi.
- Copy boris station list for Gephi use
- Change 'name' column name to 'id', expected by Gephi 


## Import data into Gephi

- Open Gephi, go to Data Lab
- Import spreadsheet - straight edge table
- Import spreadsheet - node list
- Check for duplicates (sort by name, look for blank lat/long)
- Update Gephi node list, re-import

## Visualize

- Apply edge and node ranking ...
- Apply clustering, then use to partition ...

