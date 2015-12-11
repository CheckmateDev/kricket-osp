/*
*     categories.js
*     Used to display categories shortcuts in emoji tag view
*/
categories=function(){
      this._categories = [
      {category:"refugee",id:"catRefugee",img:"/svg/categories/karmaStore.svg"},
      {category:"people",id:"catPeople",img:"/svg/categories/faces_cat.svg"},
      {category:"activity",id:"catActivities",img:"/svg/categories/action_cat.svg"},
      {category:"celebration",id:"catCelebration",img:"/svg/categories/party_cat.svg"},
      {category:"fooddrink",id:"catFoodAndDrink",img:"/svg/categories/food_cat.svg"},
      {category:"nature",id:"catNature",img:"/svg/categories/nature_cat.svg"},
      {category:"misc",id:"catMisc",img:"/svg/categories/symbols_cat.svg"},
      {category:"karmaStore",id:"catKarma",img:"/svg/categories/karmaStore.svg",avoidCssLoad:true}
      ];

      this.getCategories = function(){
            return this._categories;
      }

      this.listOfCategories =function(){
            //return $(this._categories).map(function(){return this.category;});
            return this._categories.map(function(e){return e.category;})
      }
      this.getOrder= function(category){
            return this._categories.map(function(e){return e.category;}).indexOf(category);
      }
}
