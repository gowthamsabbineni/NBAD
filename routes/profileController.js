var express=require('express')
var app=express();
var router =express.Router();
var bodyParser= require('body-parser');
var urlencodedParser= bodyParser.urlencoded({extended:false});
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/CafeDB');
var userUtil = require('../models/user.js');
var itemUtil=require('../models/item.js');
var validator = require('express-validator');
app.use(validator());
router.get('/myitems', async function(req,res,next){
  var action=req.query.action
  //var Session_User=req.session.theUser;
  if(!req.session.theUser){
    console.log("entered no session")
    res.render('login',{firstname:"",status:"view"})
  }else{
  //  var currentUserItems=req.session.currentUserItems;
    var lActiveUserId = req.session.theUser.userId;
    console.log(lActiveUserId);
    if(action==undefined){
      console.log('session active')
      userUtil.getUserItems(lActiveUserId).exec(function(err,respUserItems){
        if(err) throw err;
        req.session.currentUserItems = respUserItems;
        res.render('myitems',{userItems:respUserItems,firstname:req.session.theUser.firstName});
      })
    }
    else if(action=="delete"){
      console.log('delete');
      req.check('itemCode').notEmpty().isAlphanumeric();
      var errors = req.validationErrors();
      if(!errors){
      var lItemCode=req.query.itemCode;
      userUtil.removeItem(lItemCode,lActiveUserId).exec(function(err,response){
          if (err) throw err;
          userUtil.getUserItems(lActiveUserId).exec(function(err,respUserItems){
            req.session.currentUserItems = respUserItems;
            res.render('myitems',{userItems:respUserItems,firstname:req.session.theUser.firstName});
          })
        })
      }
      else{
        res.render('myitems',{userItems:respUserItems,firstname:req.session.theUser.firstName});
      }
    }
    else if(action=="update"){
      console.log("update");
      req.check('itemCode').notEmpty().isAlphanumeric();
      var errors = req.validationErrors();
      if(!errors){
      var itemCode = req.query.itemCode;
      var currentUserItems=req.session.currentUserItems;
      var lAllItems = req.session.allItems;
      var lupdateItemObj = userUtil.getUpdateItemObj(itemCode,currentUserItems,lAllItems);
      if(lupdateItemObj){
        res.render('feedback',{updateItemObj:lupdateItemObj,firstname:req.session.theUser.firstName});
      }
      else{
        res.redirect('/myItems');
      }
    }
    else{
     //res.render('myitems',{userItems:respUserItems,firstname:req.session.theUser.firstName});
     res.redirect('/myItems');
    }
    }
    else if(action=='saveIt'){
       var lAlreadyExists = false;

       req.check('itemCode').notEmpty().isAlphanumeric();
       req.check('itemName').notEmpty();
       req.check('catalogCategory').notEmpty();
       var errors = req.validationErrors();
       if(!errors){
         console.log("no errors in save it" )
       var lItemCode = req.query.itemCode;
       var lItemName = req.query.itemName;
       var lCatalogCategory = req.query.catalogCategory;
       console.log("inside saveit")
       if(req.session.currentUserItems.length){
       for(var i=0;i<req.session.currentUserItems.length;i++){
         if(lItemCode == req.session.currentUserItems[i].itemCode){
            lAlreadyExists = true;
         }
       }
       if(lAlreadyExists){
         console.log("Item already exists");
         itemUtil.getItembyCode(lItemCode).exec(function(err,item){
           if(err) throw err;
             res.render('item', {item:item[0],firstname:req.session.theUser.firstName,message:'Item Already Added'});
         })
       }else{
         console.log('calling add Item')
         await userUtil.addItem(lItemCode,lActiveUserId,lItemName,lCatalogCategory);
         res.redirect('/myItems');
       }
     }else{
       console.log('no items exists for user. calling add Item')
       await userUtil.addItem(lItemCode,lActiveUserId,lItemName,lCatalogCategory);
       res.redirect('/myItems');
     }
   }
   else{
     res.redirect('/categories');
   }
    }
    else if(action=='rateIt'){
      req.check('itemCode').notEmpty().isAlphanumeric();
      req.check('itemName').notEmpty();
      req.check('catalogCategory').notEmpty();
      var errors = req.validationErrors();
      if(!errors){
      var lItemCode = req.query.itemCode;
      var lItemName = req.query.itemName;
      var lCatalogCategory = req.query.catalogCategory;
      var lCurrentUserItems=req.session.currentUserItems;
      var lAllItems = req.session.allItems;
      console.log("inside rate it");
      if(req.session.currentUserItems.length){
          for(var i=0;i<req.session.currentUserItems.length;i++){
            if(lItemCode == req.session.currentUserItems[i].itemCode){
               lAlreadyExists = true;
            }
          }
          if(lAlreadyExists){
            console.log("Item already exists");
            var lupdateItemObj = userUtil.getUpdateItemObj(lItemCode,lCurrentUserItems,lAllItems);
            res.render('feedback',{updateItemObj:lupdateItemObj,firstname:req.session.theUser.firstName});
          }
          else{
            console.log('calling add Item')
            await userUtil.addItem(lItemCode,lActiveUserId,lItemName,lCatalogCategory);
            console.log(lItemCode);
            userUtil.getUserItems(lActiveUserId).exec(function(err,respUserItems){
              if(err) throw err;
              var lupdateItemObj = userUtil.getUpdateItemObj(lItemCode,respUserItems,lAllItems);
              if(lupdateItemObj){
                console.log(lupdateItemObj);
              res.render('feedback',{updateItemObj:lupdateItemObj,firstname:req.session.theUser.firstName});
            }
            else{
              res.redirect('categories');
            }
            })

          }
      }else{
        console.log('no items exists for user. calling add Item')
        await userUtil.addItem(lItemCode,lActiveUserId,lItemName,lCatalogCategory);
        userUtil.getUserItems(lActiveUserId).exec(function(err,respUserItems){
          if(err) throw err;
          var lupdateItemObj = userUtil.getUpdateItemObj(lItemCode,respUserItems,lAllItems);
          res.render('feedback',{updateItemObj:lupdateItemObj,firstname:req.session.theUser.firstName});
        })
      }
    }else{
      res.redirect("categories");
    }
  }
}
});

router.post('/action*',urlencodedParser,function(req,res,next){
  console.log('in post as action');
      var lActiveUserId = req.session.theUser.userId;
      var action=req.query.action;
     console.log('requested action: '+action);
     req.check('itemCode').notEmpty().isAlphanumeric();
     req.check('triedIt').notEmpty().isAlpha();
     req.check('myRating').notEmpty().isNumeric();
     var errors = req.validationErrors();
     if(!errors){
      if(action=='feedback'){
        userUtil.updateItem(req.query.itemCode,lActiveUserId,req.body.myRating,req.body.triedIt).exec(function(err,response){
            if (err) throw err;
            userUtil.getUserItems(lActiveUserId).exec(function(err,respUserItems){
              req.session.currentUserItems = respUserItems;
              res.render('myitems',{userItems:respUserItems,firstname:req.session.theUser.firstName});
            })
          })
   }
 }
 else{
   res.redirect('myitems');
 }
 });

 router.get('/signin', function(req,res,next){
   if(req.session.theUser){
     res.render('myitems',{userItems: req.session.currentUserItems,firstname:req.session.theUser.firstName,user:req.session.theUser});
   }
   else{
     res.render('login',{firstname:"",status:"view"});
   }
 })

 router.post('/signin',urlencodedParser,function(req,res,next){
   if(req.session.theUser){
     res.render('myitems',{userItems: req.session.currentUserItems,firstname:req.session.theUser.firstName,user:req.session.theUser});
   }
   else{
     console.log(req.body.Username);
     console.log(req.body.Password);
     req.check('Username').notEmpty().isAlphanumeric();
     req.check('Password').notEmpty().isLength({min:5});
     var errors=req.validationErrors();
     if(errors){
       console.log("errors");
       console.log(errors);
       res.render('login',{firstname:"",status:"failed"})
     }
     else{
       userUtil.getUserbyUsernamePswd(req.body.Username,req.body.Password).exec(function(err,result){
         if(result.length!==0){
           result.forEach(function (i) {
             userUtil.getUser(i.userId).exec(function(err,result){
                if(err) throw err;
                userUtil.getUserItems(i.userId).exec(function(err,respUserItems){
                  if(err) throw err;
                  itemUtil.getAllItems().exec(function(err,allItems){
                    if(err) throw err;
                  req.session.theUser= result[0];
                  console.log(req.session.theUser);
                  req.session.currentUserItems = respUserItems;
                  req.session.allItems = allItems;
                  res.render('myitems',{userItems:respUserItems,firstname:req.session.theUser.firstName,user:req.session.theUser});
                 })
                })
             })
           })
         }
         else{
           res.render('login',{firstname:"",status:"failed"})
         }
       })
     }
   }
 })

 router.get('/logout',function(req,res,next){
     req.session.destroy();
     console.log('session ended');
     res.render('index',{firstname:""})

 })

 router.get('/categories',function(req,res,next){
     itemUtil.getCategories().exec(function(err,categories){
       if(err) throw err;
       itemUtil.getAllItems().exec(function(err,allItems){
         if(err) throw err;
         console.log(categories);
         console.log(allItems);
         if(req.session.theUser){
           res.render('categories', {categories:categories, items:allItems,firstname:req.session.theUser.firstName});
         }
           else{
                res.render('categories', {categories:categories, items:allItems,firstname:""});
           }
       })
     })
 });

 router.get('/categories/item',function(req,res){
   console.log("inside get Item");
    var itemCode = req.query.itemCode;
    req.check('itemCode').notEmpty().isAlphanumeric();
    var errors = req.validationErrors();
    if(!errors){
    itemUtil.getItembyCode(itemCode).exec(function(err,item){
      if(err) throw err;
      console.log(item);
      if(item.length>0){
      if(req.session.theUser){
          res.render('item', {item:item[0],firstname:req.session.theUser.firstName,message:''});
      }
        else{
          res.render('item', {item:item[0],firstname:"",message:''});
        }
      }
      else{
        res.redirect('/categories');
      }
    })
  }
  else{
    res.redirect('/categories');
  }
 });

 router.get('/about',function(req,res){
   if(req.session.theUser){
     res.render('about',{firstname:req.session.theUser.firstName});
   }
   else{
     res.render('about',{firstname:''});
   }
 });

 router.get('/contact',function(req,res){
   if(req.session.theUser){
     res.render('contact',{firstname:req.session.theUser.firstName});
   }
   else{
     res.render('contact',{firstname:''});
   }
 });

 router.get('/index',function(req,res){
   if(req.session.theUser){
     res.render('index',{firstname:req.session.theUser.firstName});
   }
   else{
     res.render('index',{firstname:''});
   }
 });

 router.get('/*',function(req,res){
   if(req.session.theUser){
     res.render('index',{firstname:req.session.theUser.firstName});
   }
   else{
     res.render('index',{firstname:''});
   }
 });
module.exports= router;
