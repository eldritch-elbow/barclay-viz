#!/usr/bin/env ruby

require 'csv'
require 'nokogiri'

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

stations = {}

# CSV.foreach( "inputs/DockingStations.csv", { :headers => true } ) do |station_row|

#   station = { :lat => station_row[2].to_f, :long => station_row[3].to_f, :pods => station_row[4].to_i }
#   stations["#{station_row[0]}, #{station_row[1]}"] = station

# end

file = File.open("inputs/livecyclehireupdates.xml", "rb")
contents = file.read

object_hash = Hash.from_xml(contents)

puts object_hash


# # Open CSV for reading

# max_dist = 0

# CSV.foreach( ARGV[0], { :headers => true } ) do |raw_journey|

#   jny = raw_journey.to_hash

#   start_stn = stations[jny["StartStation Name"]]
#   end_stn = stations[jny["EndStation Name"]]

#   if start_stn.nil? || end_stn.nil? 
#     puts "Missing station data: #{jny["StartStation Name"]}" if start_stn.nil? 
#     puts "Missing station data: #{jny["EndStation Name"]}" if end_stn.nil? 
#     next
#   end

#   distance = haversine(start_stn[:lat], start_stn[:long], end_stn[:lat], end_stn[:lat])
#   max_dist = distance unless max_dist > distance

#   puts max_dist

# end