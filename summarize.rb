#!/usr/bin/env ruby

require 'csv'

# Function definitions for calculating distances between lat/long coordinates

def power(num, pow)
	num ** pow
end

def haversine(lat1, long1, lat2, long2)
  dtor = Math::PI/180
  r = 6378.14*1000
 
  rlat1 = lat1 * dtor 
  rlong1 = long1 * dtor 
  rlat2 = lat2 * dtor 
  rlong2 = long2 * dtor 
 
  dlon = rlong1 - rlong2
  dlat = rlat1 - rlat2
 
  a = power(Math::sin(dlat/2), 2) + Math::cos(rlat1) * Math::cos(rlat2) * power(Math::sin(dlon/2), 2)
  c = 2 * Math::atan2(Math::sqrt(a), Math::sqrt(1-a))
  d = r * c
 
  return d
end


total = 0
total_skipped = 0

buckets = []
curr_bucket = nil

# Create CSV object for writing summary results
csv_out = CSV.open(ARGV[1], "wb")
csv_out << ["Date", "StartStation", "EndStation", "JourneyText", "JourneyTotal"]

# Open CSV for reading
CSV.foreach( ARGV[0], { :headers => true } ) do |raw_journey|

	# Validate
	if raw_journey.size != 19
		total_skipped += 1
		next
	end
	
	# Basic summation	
	total += 1

	# Extract key information
	jny_start_date = raw_journey[11].slice(0,10)
	jny_start = raw_journey[14]
	jny_end = raw_journey[9]

	if jny_start == "NA, NA" || jny_end == "NA, NA"
		next
	end

	# Initialize day stats, for new days
	if curr_bucket.nil? # || curr_bucket[:date] != jny_start_date

		unless curr_bucket.nil?
			buckets << curr_bucket
		end

		curr_bucket = {}
		curr_bucket[:date] = jny_start_date
		curr_bucket[:total] = 0
		curr_bucket[:journeys] = {}

		puts "Processing #{curr_bucket[:date]}"
	end

	# Aggregate journey into day stats
	jny_text = "#{jny_start} to #{jny_end}"

	curr_bucket[:total] += 1

	curr_bucket[:journeys][jny_text] ||= {:start => jny_start, :end => jny_end, :total => 0}
	curr_bucket[:journeys][jny_text][:total] += 1

end

# Record final day
buckets << curr_bucket

# Dump out the resulting summary
buckets.each do |bucket|

	puts "#{bucket[:date]}: #{bucket[:total]}"

	bucket[:journeys].each do |jny_text, journey_data|
		csv_out << [ bucket[:date], journey_data[:start], journey_data[:end], jny_text, journey_data[:total] ]
	end

end



puts "Processed #{total} records, skipped #{total_skipped}"
