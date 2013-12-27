#!/usr/bin/env ruby

require 'csv'

total = 0
total_skipped = 0

journeys = {}


CSV($stdin, { :headers => true })  { |csv_in|  csv_in.each { |raw_journey| 

	# Validate
	if raw_journey.size != 19
		total_skipped += 1
		next
	end
	
	# Basic summation	
	total += 1

	# Extract key information. 
	# Needs refactoring - date extraction is messy

	#puts Date.parse raw_journey["Start Date"]

	jny_start_date = raw_journey["Start Date"].slice(0,10)
	jny_start = raw_journey["StartStation Name"]
	jny_end = raw_journey["EndStation Name"]

	if jny_start == "NA, NA" || jny_end == "NA, NA"
		next
	end

	# Aggregate journey into stats
	jny_text = "#{jny_start} to #{jny_end}"

	journeys[jny_text] ||= {:start => jny_start, :end => jny_end, :total => 0}

	journey_record = journeys[jny_text]
	journey_record[:total] += 1

} }

# Create CSV object for writing summary results
csv_out = CSV.open(ARGV[0], "wb")
csv_out << ["Date", "StartStation", "EndStation", "JourneyText", "JourneyTotal" ]

journeys.each do |jny_text, journey_data|
	csv_out << [ "06/01/2013", journey_data[:start], journey_data[:end], jny_text, journey_data[:total] ]
end

puts "Processed #{total} records, skipped #{total_skipped}"