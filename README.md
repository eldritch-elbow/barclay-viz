barclay-viz
===========

## Pre-processing steps

- Extract raw data...
- CSV conversion: use Excel to load, then save as CSV
- You may end up with Excel default line endings (^M in vim); convert using:
 
   tr "\r" "\n"  

## Summarize

- Run through summarize.rb - generates Day buckets (or month buckets, with a hack)
- Input / output csv files specified as params

## Create graph data, visualise

- Load CSV into excel
- Filter down to manageable set (top 2k / popular routes; eliminate missing bikes)
- Create edge table: Source, Target, Weight

- Open Gephi
- Go to Data Lab
- Import spreadsheet - straight edge table

- Apply edge and node ranking
- Apply clustering, then use to partition

