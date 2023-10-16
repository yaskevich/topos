// https://www.npmjs.com/package/sqlite
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import path from 'path'
import express from 'express'
import compression from 'compression'
import bodyParser from 'body-parser'
import session from 'cookie-session'
import passport from 'passport'
import passportLocal from 'passport-local'
import dotenv from 'dotenv'

dotenv.config();

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const LocalStrategy = passportLocal.Strategy;

const QUERY_RENAMINGS = 'select id, lat, lon, ren_date, name_be, names_pre_be from belren where lon > 0 and ren_date > 0';
const QUERY_TOP_CITIES = 'SELECT beltop.id,  beltop.name_be, beltop.coordinates,beltop.lat,beltop.lon FROM beladmdiv JOIN beltop ON beladmdiv.osm_id_rel = beltop.osm_wayrel_id';
const QUERY_CITIES = "SELECT substr(belcities.wiki_coat_img_path, -4, 4) as ext, belren.names_pre_be, belcities.place_id, belcities.name_be, belcities.est_date, belcities.magd_date, belcities.pop, beltop.lat, beltop.lon, beltop.name_ru, ifnull(beltop.histname_be, '') as histname_be FROM belcities INNER JOIN beltop ON belcities.place_id = beltop.id left JOIN belren ON belcities.place_id = belren.place_id";
const QUERY_DISTRICTS = 'SELECT beltop.name_be as capital_be, beladmdiv.id, beladmdiv.name_be, beladmdiv.name_ru, beladmdiv.pop, beladmdiv.nat_lang_pc_be, beladmdiv.nat_lang_pc_ru, beladmdiv.home_lang_pc_be, beladmdiv.home_lang_pc_ru FROM beladmdiv join beltop on beladmdiv.place_id = beltop.id WHERE adm_lvl =2 and is_area = 1';
const QUERY_DATA = 'SELECT beltop.id, beltop.name_ru, beltop.name_be, beltop.lat, beltop.lon, beladmdiv.place_id, beladmdiv.name_be as district_be, (SELECT e.name_be FROM beltop e WHERE e.id = beladmdiv.place_id) AS capital_be FROM beltop join beladmdiv on beltop.district_id = beladmdiv.id where beltop.lat is not null and beltop.lat <> 0';

(async () => {
    const db = await open({ filename: path.join('.', 'data', 'top.db'), driver: sqlite3.cached.Database })
	const app = express();
	const port = process.env.PORT || 4000;
	const ren = await db.all(QUERY_RENAMINGS);
	const topct = await db.all(QUERY_TOP_CITIES);
	const grd = await db.all(QUERY_CITIES);
	const districtsArr = await db.all(QUERY_DISTRICTS);
	const districts = Object.assign({}, ...districtsArr.map(x => ({[x.id]: x})));
	const data = await db.all(QUERY_DATA);
	
	passport.use(new LocalStrategy(
	  function(id, password, done) {
		let user = {"id": id};
		if (id === process.env.USER_ID && password === process.env.USER_PASSWORD) {
			console.log("user " + id + " authenticated");
			return done(null, user);		
		} else {
			console.log("logging in attempt as user " + id + " [" + password + "]");
			done(null,false);
		}
	  }
	));
	passport.serializeUser(function(user, cb) { cb(null, user.id); });
	passport.deserializeUser(async function(id, cb) {
	  let user = {"id": id};
	  cb(null, user);
	});
	app.use(session({
	  secret: 'dfgsdg3465t54gsvjcinjbn32edx',
	  resave: false,
	  saveUninitialized: true,
	  cookie: { secure: true }
	}));
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(express.static('public'));
	// ['path', 'altPath'].forEach(function(path) {
	  // app.get(path, function(req, res) { etc. });
	// });
	app.get('/ren.js', async (req,res) => { res.json(ren) });
	app.get('/topct.js', async (req,res) => { res.json(topct) });
	app.get('/grd.js', async (req,res) => { res.json(grd) });
	app.get('/districts.js', async (req,res) => { res.json(districts) });
	app.post('/data.js', async(req,res) => {
		let result  = [];
		// console.log(req.body);
		const raw = req.body.r;
		let query  = raw.replace('@', '')
		const lang = raw === query ? 'name_ru' : 'name_be';
		const rulesArr = query.split('#');
		// console.log(`raw ${raw} query [${query}] ${lang} ${rulesArr.length}`);		
		if (rulesArr.length > 1) {
			const regExpArr = rulesArr.map( (x)  => new RegExp(x, 'i') );
			data.forEach(function(datum) {
				let group = null;
				for (let i = 0; i < regExpArr.length; ++i) {
					if (datum[lang].match(regExpArr[i])){
						group = rulesArr[i];
						break;
					}
				}
				if (group) {
					datum["group"] = group;
					result.push(datum);
				}
			});
		} else {
			// God bless JavaScript – \b doesn't work with non-ASCII strings!
			query  = query.replace('!', (x, y, z) => y === 0 ? '(?<=\\s|^)' : y === z.length-1 ? '(?=\\s|$)' : '' );
			result = data.filter(x => x[lang].match(new RegExp(query, 'i')));
		}
		console.log(raw, result.length);
		res.json(result) 
	});	
	// app.get('/', async(req,res) => {
		// res.sendFile(path.join(__dirname, 'public', 'index.html'));
	// });
	app.get('/full', async(req,res) => {
		if (req.isAuthenticated()){
			res.sendFile(path.join(__dirname, 'public', 'indexAll.html'));
		} else {
			res.redirect('/login');
		}
	});

	// app.get('/login', passport.authenticate('local', { successRedirect: '/full' }));
	app.get('/login', function(req, res, next) {
	  passport.authenticate('local', function(err, user, info) {
		if (err) { return next(err); }
		console.log(user, info);
		if (!user) { 
			return res.sendFile(path.join(__dirname, 'public', 'login.html'));
			// return res.redirect('/login'); 
		}
		req.logIn(user, function(err) {
		  if (err) { return next(err); }
		  return res.redirect('/full');
		});
	  })(req, res, next);
});

	app.get('/logout', (req, res) => {
		console.log("logging out");
		req.logout();
		res.redirect('/login');
	});

	app.listen(port);  
	console.log("Running at Port "+ port);
})()


// 2.83 s query in Perl, 44 ms in NodeJS, 730 ms vs 23 ms