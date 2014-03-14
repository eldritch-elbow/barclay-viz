# Top customers
-- select 
-- 	customer_record_number, 
-- 	count(rental_id) as c 
-- from journeys 
-- group by customer_record_number 
-- order by c DESC 
-- limit 600000;

# Top journeys
select distinct 
	start_station_logical_term, 
	end_station_logical_term, 
	count(rental_id) 
from journeys
group by start_station_id, end_station_id
order by count(rental_id) DESC
limit 1000000;

