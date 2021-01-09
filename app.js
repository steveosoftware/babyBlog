const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const expressSanitizer = require('express-sanitizer');
const methodOverride = require('method-override');
const mongoose = require('mongoose');

//APP CONFIG
mongoose.connect('mongodb://localhost/blog_app');
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride('_method'));

//MONGOOSE/MODEL CONFIG
let blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
})
let Blog = new mongoose.model("Blog", blogSchema);

 Blog.create({
     title: 'test blog',
     image: 'https://www.happyfamilyorganics.com/wp-content/uploads/2018/05/homepage_lifestage_baby.jpg',
     body: 'This is a baby blog post',
 })

//RESTFUL ROUTES

app.get('/', function(req, res){
    res.redirect('/blogs');
});

//New Route
app.get('/blogs/new', function(req, res){
    res.render('new');
});

//Create Route    //later sanitize with new code
app.post('/blogs', function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
      Blog.create(req.body.blog, function(err, newBlog){
           if(err){
               res.render('new');
           } else {
               res.redirect('/blogs');
           }
       })
});

app.get('/blogs', function(req, res){
    Blog.find({}, function(err, blogs){
        if(err){
            console.log(err);
        } else {
            res.render('index', {blogs: blogs});
        }
    });
});

//SHOW ROUTE
app.get('/blogs/:id', function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect('/blogs');
        } else {
            res.render('show', {blog: foundBlog});
        }
    })
})
//EDIT ROUTE
app.get('/blogs/:id/edit', function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect('/blogs');
        } else {
            res.render('edit', {blog: foundBlog});
        }
    });
});

//UPDATE ROUTE
app.put('/blogs/:id', function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if(err){
            res.render('/blogs');
        } else {
            res.redirect('/blogs/' + req.params.id);
        }
    })
});

//DELETE ROUTE

app.delete('/blogs/:id', function(req, res){
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect('/blogs');
        } else {
            res.redirect('/blogs');
        };
    });
});

app.listen(3000, function(req, res){
    console.log("yo yo, server works mang");
})