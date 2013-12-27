#!/usr/bin/env ruby

require 'csv'
require 'set'

class BojoSummarizer

	# Functions that understand the months that should be detected / recorded. This isn't pretty but anything more will be overkill for now

	def initialize
		@expected_months = ["07-2012", "08-2012", "09-2012", "10-2012", "11-2012", "12-2012", "01-2013", "02-2013" ]
		@uniq_bad_locs = Set.new
	end

	def date_array_idx(raw_date_string)
		month = raw_date_string.slice(3,2).to_i # Get the month number
		idx = month - 7
		idx = month + 5 if idx < 0
		idx 
	end

	# General helper function for validating locations
	# Known invalid cases: "NA" and "NA, NA"
	def invalid_location loc
		invalid = loc.nil? || 
						  loc.length == 0 || 
						  (loc.start_with?("NA") && (loc.length > 2 || loc.length < 6))
		@uniq_bad_locs.add(loc) if invalid
		invalid
	end


	def summarize outfile

		# Variables for totals, and for storing journeys
		total = 0
		invalid_column_count = 0
		invalid_locations = 0
		journeys = {}

		# Process STDIN as csv
		CSV($stdin, { :headers => true })  { |csv_in|  csv_in.each { |raw_journey| 

			puts "#{total} processed, #{invalid_column_count} bad records, #{invalid_locations} bad locations" if (total % 50000 == 0)

			# Basic summation	
			total += 1

			# Validate
			if raw_journey.size != 19
				invalid_column_count += 1
				next
			end

			# Extract key information - use indices for slight performance increase
			# jny_date = raw_journey["Start Date"]
			# jny_start = raw_journey["StartStation Name"]
			# jny_end = raw_journey["EndStation Name"]
			jny_date = raw_journey[11]
			jny_start = raw_journey[14]
			jny_end = raw_journey[9]

			# Correct but slow date extraction	
				#jny_start_date = Date.parse raw_journey["Start Date"]
				#jny_month = jny_start_date.strftime("%m-%Y")		

			if invalid_location(jny_start) || invalid_location(jny_end)
				invalid_locations += 1
				next
			end

			# Aggregate journey into stats
			jny_text = "#{jny_start} to #{jny_end}"

			journeys[jny_text] ||= 
				{ :start => jny_start, :end => jny_end, 
					:total => 0, 
					:month_totals => Array.new(@expected_months.size, 0) }

			journey_record = journeys[jny_text]
			journey_record[:total] += 1
			journey_record[:month_totals][date_array_idx(jny_date)] += 1 

		} }


		# Create CSV object for writing summary results
		csv_out = CSV.open(outfile, "wb")
		csv_out << [["StartStation", "EndStation", "JourneyText" ], @expected_months,  ["JourneyTotal"]].flatten

		journeys.each do |jny_text, jdata|
			csv_out << [
				[ jdata[:start], jdata[:end], jny_text ],
				jdata[:month_totals],
				[ jdata[:total] ]
			].flatten
		end

		puts "Processed #{total} records"
		puts " - #{invalid_column_count} with invalid #columns"
		puts " - #{invalid_locations} with at least one bad location"
		puts
		puts "Bad location strings: #{@uniq_bad_locs.to_a}"

	end

end

BojoSummarizer.new.summarize ARGV[0]