barclay-viz
===========

## Processing steps

- Extract raw data
- Run through summarise.rb - generates Day buckets (or month buckets, with a hack)
- Input / output csv files specified as params

- Load CSV into excel
- Filter down to manageable set (top 2k / popular routes; eliminate missing bikes)
- Create edge table: Source, Target, Weight

- Open Gephi
- Go to Data Lab
- Import spreadsheet - straight edge table

- Apply edge and node ranking
- Apply clustering, then use to partition

