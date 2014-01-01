#!/usr/bin/env ruby

require 'csv'
require 'set'

filter_jnys = Set.new
filter_jnys.add("191-191")

puts "Filtering STDIN to selected journeys:"
puts filter_jnys.to_a
puts 

# Process STDIN as csv - expects boris bike journeys
total_journeys = 0
total_filtered_in = 0
total_bad_cols = 0
		
headers = nil
filtered_records = []

CSV($stdin, { :headers => true })  { |csv_in|  csv_in.each { |raw_journey|

	puts "Processed #{total_journeys} ..." if (total_journeys % 10000 == 0)

	headers = csv_in.headers if headers.nil?

	total_journeys += 1

	# Validate
	if raw_journey.size != 19
		total_bad_cols += 1
		next
	end

	start_stn = raw_journey["StartStation Id"]
	end_stn = raw_journey["EndStation Id"]

	filtered_records << raw_journey if filter_jnys.member? ("#{start_stn}-#{end_stn}")

}}

puts "Processed #{total_journeys} records"
puts " - #{filtered_records.size} filtered in"
puts " - #{total_bad_cols} with invalid #columns"

puts "Writing to #{ARGV[0]}"

csv_out = CSV.open(ARGV[0], "wb")
csv_out << headers

filtered_records.each do |row|
	csv_out << row
end

