# Crinan street = 22183

# All crinan journeys
#select * from journeys where end_station_logical_term=22183 limit 20000;

# Top journeys to crinan
-- select distinct 
-- 	start_station_logical_term, 
-- 	end_station_logical_term, 
-- 	count(rental_id) 
-- from journeys
-- where end_station_logical_term = 22183
-- group by start_station_id, end_station_id
-- order by count(rental_id) DESC
-- limit 1000000;
-- 

# Top customers who cycle to crinan
-- select 
-- 	customer_record_number, 
-- 	count(rental_id) as c 
-- from journeys 
-- where end_station_logical_term = 22183
-- group by customer_record_number 
-- order by c 
-- DESC limit 600000;

# Crinan commuter
-- select * from journeys 
-- where customer_record_number = 1921951825
-- limit 20000;

# Crinan commuter
select 
  start_station_logical_term, 
  end_station_logical_term, 
  count(rental_id) as jny_count, 
  avg(duration) as avg_duration,
  sum(case end_hour_category_id when 1 then 1 else 0 end) as peak_journeys, 
  sum(case end_hour_category_id when 0 then 1 else 0 end) as off_peak_journeys
from journeys 
where customer_record_number = 1921951825
group by start_station_logical_term, end_station_logical_term
order by weight DESC
limit 10000;