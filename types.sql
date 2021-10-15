
CREATE TABLE types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(31)
);
  
INSERT INTO types VALUES(DEFAULT, 'city');
INSERT INTO types VALUES(DEFAULT, 'town');
INSERT INTO types VALUES(DEFAULT, 'municipality');
INSERT INTO types VALUES(DEFAULT, 'city and borough');
INSERT INTO types VALUES(DEFAULT, 'borough');
INSERT INTO types VALUES(DEFAULT, 'village');
INSERT INTO types VALUES(DEFAULT, 'unified government');
INSERT INTO types VALUES(DEFAULT, 'consolidated government');
INSERT INTO types VALUES(DEFAULT, '(nothing)');
INSERT INTO types VALUES(DEFAULT, 'urban county');
INSERT INTO types VALUES(DEFAULT, 'metro government');
INSERT INTO types VALUES(DEFAULT, 'metropolitan government');
INSERT INTO types VALUES(DEFAULT, 'corporation');