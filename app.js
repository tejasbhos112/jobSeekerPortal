require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');


const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const companyAuthRoutes = require('./routes/companyAuth');
const companyRoutes = require('./routes/companies');
const jobRoutes = require('./routes/jobs');
const applicationRoutes = require("./routes/application")


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.use('/api/company/auth', companyAuthRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/jobs', jobRoutes);

app.use('/api/applications', applicationRoutes);




module.exports = app;
