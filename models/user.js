var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/CafeDB');
var item=require('../models/item.js');
var Schema=mongoose.Schema;

var UserSchema = new Schema({
    userId : String,
    password: String,
    firstName : String,
    lastName : String,
    emailAddress : String,
    address1Field : String,
    address2Field : String,
    city : String,
    state : String,
    zipCode : String,
    country : String
});

var User=mongoose.model('users',UserSchema);

var UserItemsSchema= new Schema(
  {
    userId: String,
    itemCode: String,
    itemName:String,
    catalogCategory : String,
    rating: String,
    triedIt:String
  }
);
var UserItems =mongoose.model('useritems',UserItemsSchema);

module.exports.getAllUsers=function(){
  var query=User.find();
  return query;
}

module.exports.getUser=function(pId){
  var query=User.find({userId:pId});
  return query;
}
module.exports.getUserbyUsernamePswd = function(username,password) {
  var query=User.find({userId:username,password:password});
  return query;
}

module.exports.getUserItems= function(pId){
  var query=UserItems.find({userId:pId});
  return query;
}

module.exports.removeItem = function(pItemCode,pUserId){
  var query=UserItems.remove({itemCode:pItemCode,userId:pUserId});
  return query;
}

module.exports.updateItem = function(itemCode,pUserId,myRating,triedIt){
  var query=UserItems.update({userId:pUserId,itemCode:itemCode},{$set :{rating:myRating,triedIt:triedIt}});
  return query;
}

module.exports.addItem = async function(itemCode,pUserId,itemName,catalogCategory){
  var lObj = {userId:pUserId,itemCode:itemCode,rating:"0",triedIt:"No",itemName:itemName,catalogCategory:catalogCategory};
    UserItems.create(lObj,function(err,lObj){
      if(err){
        throw err;
      }
      else{
        return true;
      }
    });
}

module.exports.addItemRating = function(itemCode,pUserId,myRating){
  var query=UserItems.update({userId:pUserId,itemCode:itemCode},{$set :{rating:myRating}});
  return query;
}

module.exports.addTriedIt = function(itemCode,pUserId,triedIt){
  var query=UserItems.update({userId:pUserId,itemCode:itemCode},{$set :{triedIt:triedIt}});
  return query;
}

module.exports.getUpdateItemObj = function(itemCode,currentUserItems,allItems){
  console.log("inside getUpdateItemObj function to get item full details");
  for(i=0;i<currentUserItems.length;i++){
    if(currentUserItems[i].itemCode==itemCode){
      for(j=0;j<allItems.length;j++){
        if(currentUserItems[i].itemCode == allItems[j].itemCode){
           currentUserItems[i].description = allItems[j].description;
           currentUserItems[i].image = allItems[j].image;
        }
      }
      console.log(currentUserItems[i]);
      return currentUserItems[i];
    }
  }
}
