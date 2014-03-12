#!/usr/bin/ruby

require 'nokogiri'
require 'csv'

station_xml_fields = ["id", "name", "terminalName", "lat", "long", "installed", "locked", "installDate", "removalDate", "temporary", "nbBikes", "nbEmptyDocks", "nbDocks"]

csv_out = CSV.open(ARGV[0], "wb")
csv_out << station_xml_fields

def extract_fields station_el, field_names

	fields = []

	field_names.each do |field_name|
		fields << station_el.search("./#{field_name}").first.content
	end

	fields
end

Nokogiri::XML(STDIN).xpath("/stations/station").each do |stn|

	csv_out << extract_fields(stn, station_xml_fields)

end
