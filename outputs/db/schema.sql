
DROP TABLE IF EXISTS journeys;
DROP TABLE IF EXISTS stations;
 
CREATE TABLE stations (
  logical_terminal INTEGER NOT NULL,  
  street_name VARCHAR(100),
  village VARCHAR(100),
  full_name VARCHAR(200) NOT NULL,
  latitude FLOAT,
  longitude FLOAT,
  PRIMARY KEY (logical_terminal),
  UNIQUE(full_name)
) DEFAULT CHARSET=utf8 ENGINE=INNODB;

CREATE TABLE journeys (
  rental_id INTEGER NOT NULL,
  billable_duration INTEGER NOT NULL,
  duration INTEGER NOT NULL,
  customer_record_number INTEGER NOT NULL,
  subscription_id INTEGER NOT NULL,
  bike_id INTEGER NOT NULL,
  end_timestamp DATETIME NOT NULL,
  end_station_id INTEGER NOT NULL,
  end_station_logical_term INTEGER NOT NULL,
  end_station_priority_id  INTEGER NOT NULL,
  end_hour_category_id INTEGER NOT NULL,
  start_timestamp DATETIME NOT NULL,
  start_station_id INTEGER NOT NULL,
  start_station_logical_term INTEGER NOT NULL,
  start_station_priority_id  INTEGER NOT NULL,
  start_hour_category_id INTEGER NOT NULL,
  bike_user_type_id INTEGER NOT NULL,
  PRIMARY KEY (rental_id),
  FOREIGN KEY (end_station_logical_term) REFERENCES stations(logical_terminal),
  FOREIGN KEY (start_station_logical_term) REFERENCES stations(logical_terminal)
) DEFAULT CHARSET=utf8 ENGINE=INNODB;


