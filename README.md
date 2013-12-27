barclay-viz
===========

## Where to find the raw data

http://www.tfl.gov.uk/tfl/businessandpartners/syndication/feed.aspx?email=jim@jamessiddle.net&feedId=21

## Pre-processing steps

- Extract raw data...
- CSV conversion: use Excel to load, then save as CSV
- You may end up with Excel default line endings (^M in vim); convert using:

    tr "\r" "\n"  

## Summarize

- Run through summ_by_X.rb
- Scripts for day versus journey summaries
- Input read from STDIN
- Specify output CSV file as first param
- Day script requires records ordered by timestamp

## Create graph data, visualise

- Load CSV into excel
- Filter down to manageable set (top 2k / popular routes; eliminate missing bikes)
- Create edge table: Source, Target, Weight
- Open Gephi
- Go to Data Lab
- Import spreadsheet - straight edge table
- Apply edge and node ranking
- Apply clustering, then use to partition

