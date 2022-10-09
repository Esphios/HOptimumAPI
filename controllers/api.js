const path = require('path');

//GET '/api'
const getAllObj = (req, res, next) => {
    res.json({message: "GET all api"});
};

//POST '/api'
const newObj = (req, res, next) => {
    res.json({message: "POST new api"});
};

//DELETE '/api'
const deleteAllObj = (req, res, next) => {
    res.json({message: "DELETE all api"});
};

//GET '/api/:name'
const getOneObj = (req, res, next) => {
    res.json({message: "GET 1 api"});
};

//POST '/api/:name'
const newComment = (req, res, next) => {
    res.json({message: "POST 1 api comment"});
};

//DELETE '/api/:name'
const deleteOneObj = (req, res, next) => {
    res.json({message: "DELETE 1 api"});
};

//export controller functions
module.exports = {
    getAllObj,
    newObj,
    deleteAllObj,
    getOneObj,
    newComment,
    deleteOneObj
};