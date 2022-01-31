var express = require("express");
var router = express.Router();
//var router = require("../routes");
var dbcon = require('../lib/db.js');

//Display books page

router.get('/',function(req,res,next){

    dbcon.query('SELECT * FROM books ORDER BY id desc',function(err,rows){
        if(err){
            req.flash('error',err);
        }
        else{
            res.render('books',{data:rows});
        }
    });
});

//display add book page

router.get('/add',function(req,res,next){
    //render add.ejs

    res.render('books/add',{
        name: '',
        author:'',
        reserved:'',
        classification:''
    });
});

//add a new book

router.post('/add',function(req,res,next){

    let name = req.body.name;
    let author = req.body.author;
    let reserved = req.body.reserved;
    let classification = req.body.classification;

    let errors = false;

    if(name.length == 0|| author.length == 0){

        errors = true;

        //set flash msg
        req.flash('error',"Please enter name and author");
        //render to add.ejs with flash msg

        res.render('books/add',{
            name:name,
            author:author,
            reserved:reserved,
            classification:classification

        });
    }

    //if no error
    if(!errors){

        var form_data ={
            name:name,
            author:author,
            reserved:reserved,
            classification:classification
        }
        //insert into db
        console.log("form "+JSON.stringify(form_data));
        dbcon.query("INSERT INTO books SET ?",form_data,function(err,result){//INSERT INTO books SET ? instead of VALUES SYNTAX

            if(err){
                req.flash('error',err)

                //render to add.ejs
                res.render('books/add',{
                    name:form_data.name,
                    author:form_data.author,
                    reserve:form_data.reserve,
                    classification:form_data.classification
                });
            }
            else{
                req.flash('success','Book -'+name+'- successfully added');
                res.redirect('/books');
            }
        });
    }
});


//display edit book page

router.get('/edit/(:id)',function(req,res,next){

    let id = req.params.id;

    dbcon.query('SELECT * FROM books WHERE id = '+id,function(err,rows,fields){

        if(err) throw err;

        if(rows.length<=0){
            req.flash('error','Book not found with id = '+id);
            res.redirect('/books');

        }
        else{
            res.render('books/edit',{
                title:'Edit Book',
                id: rows[0].id,
                name:rows[0].name,
                author:rows[0].author,
                reserved:rows[0].reserved,
                classification:rows[0].classification
            })
        }

    });
});

//Update book data

router.post('/update/(:id)',function(req,res,next){

    let id = req.params.id;
    let name = req.body.name;
    let author = req.body.author;

    let errors = false;
    //console.log("name ="+name.length);
    //console.log("auuth = "+author.length);
    if(name.length == 0 ||author.length == 0){//name.length == 0 ||author.length == 0
        errors = true;
        //set flash msg
        req.flash('error','Please enter name and author');
        //render to add.ejs with flash msg
        res.render('books/edit',{
            id: req.params.id,
            name : name,
            author : author
        })
    }
    
    if(!errors){
        var form_data ={
            name:name,
            author:author
        }

        //Update query

        dbcon.query("UPDATE books SET ? WHERE id = "+id, form_data,function(err,result){

            if(err){
                req.flash('error');

                res.render('books/edit',{
                    id : req.params.id,
                    name : form_data.name,
                    author:form_data.author
                })
            }
            else{

                req.flash('success','Book successfully updated');
                res.redirect('/books');
            }
        })
    }

})

//Delete book
router.get('/delete/:id/:name',function(req,res,next){

    let id = req.params.id;
    let name = req.params.name;
    //let author = req.body.author;

    console.log("name "+name);
    dbcon.query("DELETE FROM books WHERE id = "+id,function(err,result){

        if(err){
            req.flash('error');
            res.redirect('/books');

        }
        else
        {
            req.flash('success',"Book -'"+name+"'- has been succcessfully deleted");
            res.redirect('/books');
        }

    })

})

module.exports = router;