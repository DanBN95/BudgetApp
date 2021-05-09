//Budjet Project
var budgetModule = (function() {
    
    var Expense = function(id,description,value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentages = function(totalIncome) {
        if(totalIncome > 0) {
        this.percentage = Math.round((this.value / totalIncome) * 100);
        }else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {  return this.percentage; }

    var Income = function(id,description,value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        data.total[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        total: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function(type,des,val) {
            var newItem, id;
        
            // Create new ID 
            if(data.allItems[type].length === 0) {
                id = 1;
            }else {
                id = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }

            // Create new Item depend its 'inc' or 'exp'
            if(type === 'exp') {
                newItem = new Expense(id,des,val);
            } else {
                newItem = new Income(id,des,val);
            }

            // Push the new item into out data structure and update total
            data.allItems[type].push(newItem);
            data.total[type] += newItem.value;

            // Returns the new element
            return newItem;
        },

        deleteItem: function(type,id) {
            var ids, index;

            // map function create array in the same size of allItem
            // but of the inc/exp id's
            ids = data.allItems[type].map((current) => current.id);
            index = ids.indexOf(id);

            if(index !== -1) { //indx = -1 means id not found

                data.allItems[type].splice(index,1); //splice method: splice(begin index to delete,how many values to delete)
            }

        },

        calculateBudget: function() {

             // calculate total income and expenses
             calculateTotal('exp');
             calculateTotal('inc');

            // calculate total budget: income - expenses
            data.budget = data.total.inc - data.total.exp;

            // calculate the percentage of income that we spent
            if(data.total.inc > 0) {
                data.percentage = Math.round((data.total.exp / data.total.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function() {
           data.allItems.exp.forEach(function(item) {
               item.calcPercentages(data.total.inc);
           });
        },

        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(item) {
                return item.getPercentage();
            });
            return allPerc;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.total.inc,
                totalExp: data.total.exp,
                percentage: data.percentage
            };
        },

        testing: function() {
            console.log(data);
        }

    };

})();

/**************************************************************** */

//View
var budgetViewer = (function() {

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        itemPercentage: '.item__percentage',
        timeLabel: '.budget__title--month'
    };

    var   formatNumber = function(num,type) {
        //formating the number into a string like 23500 to '23,500.00'
            
        var numSplit,int,dec;

        num = Math.abs(num); // Returns absoloute value
        num = num.toFixed(2); //Returns a string representing a number in fixed-point notation.

        numSplit = num.split('.');
        int = numSplit[0];
        dec = numSplit[1];

       if(int.length > 3) {
            int = int.substr(0,int.length -3) + ',' + int.substr(int.length - 3, 3);
       }

       return (type === 'exp' ? '-' : '+') + int + '.' + dec;

    };

    var nodeListForEach = function(list,callback) {
        for(var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                descrption: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        getDOMstrings: function() {
            return DOMstrings;
        },

        addListItem: function(newItem, type) {
            var html, newHtml, element;
            // Create HTML string with placeholder text
            
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', newItem.id);
            newHtml = newHtml.replace('%description%', newItem.description);
            newHtml = newHtml.replace('%value%', formatNumber( newItem.value, type) );
            
            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function(selectorId) {
            var el = document.getElementById(selectorId);
            el.parentNode.removeChild(el);
        },

        clearFields: function() {
            var fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            var fildsArray = Array.prototype.slice.call(fields);
            fildsArray.forEach(cur => {
                cur.value = "";
            });
            
            // After all fileds clear, the mouse back to description
            fildsArray[0].focus();
        },

        displayBudget: function(budg) {
            var type;
            budg.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(budg.budget,type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(budg.totalInc,type);
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(budg.totalExp,type);
            
            if(budg.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = budg.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';

            }
        },

        displayPercentages: function(perc) {
           
            var fields = document.querySelectorAll(DOMstrings.itemPercentage);
            
            nodeListForEach(fields, function(current, index) {
                
               if(perc[index] > 0) {
                current.textContent = perc[index] + '%';
               }else {
                   current.textContent = '---'
               }
                
            });
        },

        displayDate: function() {

            var now,year,month;
            now = new Date();

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];


            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.timeLabel).textContent = months[month] + ' ' + year;
        }, 

        changedType: function() {
            
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);
            
            nodeListForEach(fields, function(cur) {
               cur.classList.toggle('red-focus'); //each time the type changes we want the class to change
            });
            
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red'); // same thing in here but here only the v btn
            
        },
    };

    
})();

/****************************************************************** */
 // GLOBAL APP CONTROLLER
var controller = (function(budgetModule,budgetViewer) {

    var setupEventListner = function() {

        var DOM = budgetViewer.getDOMstrings();
       
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function(event) {
    
            if(event === 13 || event.which === 13) {
                console.log("Enter was pressed");
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', budgetViewer.changedType);
    }; 

    var updateBudget = function() {

        // 1. Calculate the budget
        budgetModule.calculateBudget();
     
        // 2. Ruturn the budget
        var budget = budgetModule.getBudget();
       console.log(budget);
        // 3. Display the budget on the UI
        budgetViewer.displayBudget(budget);

    };

    var updatePercentage = function() {

        // 1. Calculating percentages
        budgetModule.calculatePercentages();

        // 2. Read percentages from the budget controller
        var percentages = budgetModule.getPercentages();

        // 3. Update the UI with the new percentages
        console.log(percentages);
        budgetViewer.displayPercentages(percentages);

    }


    var ctrlAddItem = function() {
         // 1. Get the filed input data
        console.log("add item check");
        var input = budgetViewer.getInput();
        if(input.descrption !== "" && !isNaN(input.value) && input.value > 0) {
             
        // 2. Add the item to the budget controller
        var newItem = budgetModule.addItem(input.type,input.descrption,input.value);
        console.log(newItem);

        // 3. Add the item to the UI
        budgetViewer.addListItem(newItem,input.type);

        // 4. Clear fields
        budgetViewer.clearFields();

        // 5. Calculate & update budget
        updateBudget();

        // 6. Calculate and update percentages
        updatePercentage();
        }

    };

    var ctrlDeleteItem = function(event) {
        var itemID,splitId,id,type;

        itemID = (event.target.parentNode.parentNode.parentNode.parentNode.id);
        if(itemID) {

            // inc-1
            splitId = itemID.split('-');
            type = splitId[0];
            id = parseInt(splitId[1]); 
            
            // 1. Delete the item from the data structure
            budgetModule.deleteItem(type,id);
           
            // 2. Delete the item from the UI
            budgetViewer.deleteListItem(itemID);

            // 3. Update and show the new budget
            updateBudget();

            // 4. Calculate and update percentages
            updatePercentage();
        }
    }

    return {
        init: function() {
            console.log('Application has started.');
            budgetViewer.displayDate();
            budgetViewer.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0
            });
            setupEventListner();
        }
    }

})(budgetModule, budgetViewer);

controller.init();

