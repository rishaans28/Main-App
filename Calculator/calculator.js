const display = document.getElementById("display");
var ans = null;

function appendToDisplay(input){
    display.value += input;
}

function clearDisplay(){
    display.value = "";
}

function calculate(){
    try{
        display.value = eval(display.value)
        ans = eval(display.value)
    }
    catch(error){
        display.value = "Error";
    }
}

function appendAns() {
    if (ans != null) {
        display.value += ans;
    }
}