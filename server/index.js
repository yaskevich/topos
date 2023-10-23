import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path, { dirname } from 'path';
import fs from 'fs';
import express from 'express';
import compression from 'compression';
import bodyParser from 'body-parser';
import session from 'cookie-session';
import passport from 'passport';
import passportLocal from 'passport-local';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const QUERY_RENAMINGS = 'select id, lat, lon, ren_date, name_be, names_pre_be from belren where lon > 0 and ren_date > 0';
const QUERY_TOP_CITIES = 'SELECT beltop.id, beltop.name_be, beltop.coordinates,beltop.lat,beltop.lon FROM beladmdiv JOIN beltop ON beladmdiv.osm_id_rel = beltop.osm_wayrel_id';
const QUERY_CITIES = "SELECT substr(belcities.wiki_coat_img_path, -4, 4) as ext, belren.names_pre_be, belcities.place_id, belcities.name_be, belcities.est_date, belcities.magd_date, belcities.pop, beltop.lat, beltop.lon, beltop.name_ru, ifnull(beltop.histname_be, '') as histname_be FROM belcities INNER JOIN beltop ON belcities.place_id = beltop.id left JOIN belren ON belcities.place_id = belren.place_id";
const QUERY_DISTRICTS = 'SELECT beltop.name_be as capital_be, beladmdiv.id, beladmdiv.name_be, beladmdiv.name_ru, beladmdiv.pop, beladmdiv.nat_lang_pc_be, beladmdiv.nat_lang_pc_ru, beladmdiv.home_lang_pc_be, beladmdiv.home_lang_pc_ru FROM beladmdiv join beltop on beladmdiv.place_id = beltop.id WHERE adm_lvl =2 and is_area = 1';
const QUERY_DATA = 'SELECT beltop.id, beltop.name_ru, beltop.name_be, beltop.lat, beltop.lon, beladmdiv.place_id, beladmdiv.name_be as district_be, (SELECT e.name_be FROM beltop e WHERE e.id = beladmdiv.place_id) AS capital_be FROM beltop join beladmdiv on beltop.district_id = beladmdiv.id where beltop.lat is not null and beltop.lat <> 0';

const pubDir = path.join(__dirname, '..', 'public');
const dataDir = path.join(__dirname, '..', 'data');
const extDir = path.join(__dirname, '..', '..', 'colours');
const extAssetsDir = path.join(extDir, 'assets');
const extCoatsDir = path.join(extDir, 'coat');

const LocalStrategy = passportLocal.Strategy;
// console.log(process.env.DB_PATH);
if (process.env.DB_PATH && fs.existsSync(process.env.DB_PATH)) {
  const db = await open({ filename: process.env.DB_PATH, driver: sqlite3.cached.Database });
  const app = express();
  const port = process.env.PORT || 8080;
  const changes = await db.all(QUERY_RENAMINGS);
  const top = await db.all(QUERY_TOP_CITIES);
  const cities = await db.all(QUERY_CITIES);
  const districtsArr = await db.all(QUERY_DISTRICTS);
  const districts = Object.assign({}, ...districtsArr.map((x) => ({ [x.id]: x })));
  const data = await db.all(QUERY_DATA);

  const passportMiddleware = (request, response, next) => {
    if (request.session && !request.session.regenerate) {
      request.session.regenerate = (cb) => {
        cb();
      };
    }

    if (request.session && !request.session.save) {
      request.session.save = (cb) => {
        cb();
      };
    }

    next();
  };

  passport.use(new LocalStrategy(
    (id, password, done) => {
      const user = { id };
      if (id === process.env.USER_ID && password === process.env.USER_PASSWORD) {
        console.log(`user ${id} authenticated`);
        return done(null, user);
      }
      console.log(`logging in attempt as user ${id} [${password}]`);
      return done(null, false);
    }
  ));
  passport.serializeUser((user, cb) => { cb(null, user.id); });
  passport.deserializeUser(async (id, cb) => {
    const user = { id };
    cb(null, user);
  });
  app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
  }));
  app.use(compression());
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(express.static(pubDir), express.static(extAssetsDir));
  app.use('/colors', express.static(extDir));
  app.use('/coat', express.static(extCoatsDir));
  app.use('/data', express.static(dataDir));

  // temporary fix https://github.com/jaredhanson/passport/issues/907
  app.use(passportMiddleware);

  app.get('/api/changes.json', async (req, res) => { res.json(req.isAuthenticated() ? changes : {}); });
  app.get('/api/districts.json', async (req, res) => { res.json(req.isAuthenticated() ? districts : {}); });
  app.get('/api/cities.json', async (req, res) => { res.json(req.isAuthenticated() ? cities : {}); });
  app.get('/api/top.json', async (req, res) => { res.json(top); });
  app.post('/api/data.json', async (req, res) => {
    let result = [];
    // console.log(req.body);
    const raw = req.body.r;
    let query = raw.replace('@', '');
    const lang = raw === query ? 'name_ru' : 'name_be';
    const rulesArr = query.split('#');
    // console.log(`raw ${raw} query [${query}] ${lang} ${rulesArr.length}`);
    if (rulesArr.length > 1) {
      const regExpArr = rulesArr.map((x) => new RegExp(x, 'i'));
      data.forEach((datum) => {
        let group = null;
        for (let i = 0; i < regExpArr.length; ++i) {
          if (datum[lang].match(regExpArr[i])) {
            group = rulesArr[i];
            break;
          }
        }
        if (group) {
          // datum.group = group;
          result.push({ ...datum, group });
        }
      });
    } else {
      // God bless JavaScript – \b doesn't work with non-ASCII strings!
      // if ! is put in the beggining or in the end of the query string
      // y is a position of ! in the query
      query = query.replace('!', (x, y) => (y ? '(?=\\s|$)' : '(?<=\\s|^)'));
      // console.log(query);
      result = data.filter((x) => x[lang].match(new RegExp(query, 'i')));
    }
    console.log(raw, result.length);
    res.json(result);
  });
  //   app.get('/', async(req,res) => {
  //   res.sendFile(path.join(pubDir, 'index.html'));
  //   });
  app.get('/full', async (req, res) => {
    if (req.isAuthenticated()) {
      res.sendFile(path.join(pubDir, 'index.html'));
    } else {
      res.redirect('/login');
    }
  });

  // app.get('/login', passport.authenticate('local', { successRedirect: '/full' }));
  app.get('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) { return next(err); }
      console.log(user, info);
      if (!user) {
        return res.sendFile(path.join(pubDir, 'login.html'));
        // return res.redirect('/login');
      }
      req.logIn(user, (err2) => {
        if (err2) { return next(err2); }
        return res.redirect('/full');
      });
    })(req, res, next);
  });

  app.get('/logout', (req, res) => {
    console.log('logging out');
    req.logout();
    res.redirect('/login');
  });

  app.listen(port);
  console.log(`Running at Port ${port}`);
}

// 2.83 s query in Perl, 44 ms in NodeJS, 730 ms vs 23 ms
