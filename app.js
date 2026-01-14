const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const connectDB = require('./config/db');
const path = require('path');
const handlebars = require('express-handlebars')
const indexRouter = require('./routes/index');


connectDB();


const staticPath = path.join(__dirname, 'public');
const layoutPath = path.join(__dirname, 'views/layouts');
const partialsPath = path.join(__dirname, 'views/partials');
const frontendpages = path.join(__dirname, 'views/frontend-pages');
const helpers = require('./helpers/hbs-helpers');

console.log('Static Path:', frontendpages);

app.engine('hbs', handlebars.engine({
  extname: '.hbs',
  layoutsDir: layoutPath,
  partialsDir: partialsPath,
  defaultLayout: 'layout',
  helpers: helpers
}))


app.use(express.json());
app.use(express.static(staticPath));

app.set('view engine', 'hbs');
app.set('views', frontendpages);



// Routes
app.use('/', indexRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});