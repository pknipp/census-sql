import fetch from "node-fetch";
import fs from "fs";

const getCensus = async () => {
  const response = await fetch("https://api.census.gov/data/2019/pep/population?get=NAME,POP&for=place:*&key=80014773f354ad0dbf67c1a06a6da26f0b2d4151");
  const data = await response.json();
  let cities = [];
  let types = new Set();
  let states = new Set();
  let excluded = new Set();
  data.slice(1).forEach(city => {
    let nameState = city[0].split("; ").join(", ").split(", ");
    let state = nameState.pop();
    states.add(state);
    let name = nameState.join(", "); // This includes some garbage which must be trimmed.
    if (name.endsWith(")")) { // Trim off the parenthesized portion
      let j = name.lastIndexOf(" (");
      excluded.add(name.slice(j + 1));
      name = name.slice(0, j);
    }
    // Reversing this makes it slightly easier to trim garbage from right end.
    name = name.split(" ").reverse();
    let type = [];
    // Trim stuff from the end of "name" (signifying the "type" of place) until reaching the following:
    // 1) close paren, which signifies something that should be included in name
    // 2) capitalized word, which indicates significance
    // 3) d', which is a contraction of the French preposition for "of" when preceding a proper name
    while (!(name[0].endsWith(")") || name[0][0].toUpperCase() === name[0][0] || name[0].slice(0, 2) === "d'")) {
      type.unshift(name.shift());
    };
    type = type.join(" ") || "(nothing)";
    types.add(type);
    // Now that garbage has been trimmed, re-reverse this.
    name = name.reverse().join(" ");
    // Replace one single-quote with two, to make SQL happy
    name = name.split("'").join("''");
    let population = Number(city[1]);
    cities.push({name, state, population, type});
  });
  types.delete("");
  types.add("(nothing)");
  types = Array.from(types);
  states =Array.from(states).sort();
  cities = cities.map(city => {
    city.stateId = states.indexOf(city.state) + 1;
    city.typeId = types.indexOf(city.type) + 1;
    delete city.state;
    delete city.type;
    return city;
  });
  types = types.map(type => `INSERT INTO types VALUES(DEFAULT, '${type}');`);
  let typesHeader = `
CREATE TABLE types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(31)
);
  `;
  let statesHeader = `
CREATE TABLE states (
  id SERIAL PRIMARY KEY,
  name VARCHAR(31)
);
  `;
  let citiesHeader = `
CREATE TABLE cities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(127),
  population INTEGER,
  stateId INTEGER REFERENCES states,
  typeId INTEGER REFERENCES types
);
  `;
  states=states.map(state=>`INSERT INTO states VALUES(DEFAULT, '${state}');`);
  cities=cities.map(city =>`INSERT INTO cities VALUES(DEFAULT, '${city.name}', ${city.population}, ${city.stateId}, ${city.typeId});`)
  fs.writeFile("types.sql", typesHeader + '\n' + types.join("\n"), "utf8", err => {if (err) console.log(err);});
  fs.writeFile("states.sql",statesHeader+ '\n' + states.join("\n"),"utf8", err => {if (err) console.log(err);});
  fs.writeFile("cities.sql",citiesHeader+ '\n' + cities.join("\n"),"utf8", err => {if (err) console.log(err);});
};
getCensus();
