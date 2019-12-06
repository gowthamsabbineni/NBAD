var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/CafeDB');
var Schema=mongoose.Schema;


var ItemSchema=new Schema({
  itemCode : String,
  itemName : String,
  catalogCategory : String,
  description : String,
  avgUserRating : String,
  image : String
});

var Item=mongoose.model('items',ItemSchema);

var CategorySchema= new Schema({
  categoryName: String
});

var Category=mongoose.model('categories',CategorySchema);

module.exports.getAllItems=function(){
  var query = Item.find();
  return query;
}

module.exports.getCategories=function(){
  var query=Category.find();
  return query;
}

module.exports.getItembyCode= function(pItemCode){
  var query = Item.find({itemCode:pItemCode});
  return query;
}
