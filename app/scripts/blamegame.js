/*global d3, pym */

var next = d3.select(".next-question");
var numberOfChoices = 4;
var questionContainer = d3.select(".impact-summary");
var questions = d3.select(".hidden").selectAll(".effect");
var answerContainers = d3.selectAll(".answer");
var answers = d3.select(".hidden").selectAll(".cause");
var answersUsed = d3.select(".hidden").selectAll(".cause-used");
var wrongQuestion = d3.select(".wrong");

console.log("answerContainers: " + answerContainers);
console.log("answers: " + answers);
console.log(next);
console.log(answerContainers);
console.log(answers);

next.on("click", function () {
  "use strict";
  resetBoard();
});

answerContainers.on("click", function (d,i) {
  "use strict";
  console.log(i);
  //console.log(d);
  

  console.log("Answer clicked");
  console.log(answerContainers);

  var clicked = d3.select(this); 
  var effect = questionContainer.select(".effect");

  console.log(d3.select(answers[0][i].parentNode).select(".effect"));
  console.log(effect);
  if (d3.select(answers[0][i].parentNode).select(".effect")[0][0] !== null) {
    if (d3.select(answers[0][i].parentNode).select(".effect")[0][0].innerText == effect[0][0].innerText) {
      clicked.classed("correct", true);
      clicked.classed("selected", true);
      clicked.html("");
      clicked.append(function () {
        return answers[0][i].parentNode;
      })

      questionContainer.classed("correct",true);
    }
    else {
      clicked.classed("incorrect", true);
    }
  }
  else {
    clicked.classed("incorrect", true);
  }


  /*
  answerContainers.html("");
  answerContainers.append(function (d,i) {
    console.log(i);d
    console.log(answers);
    return answers[0][i].parentNode;
    //return answers[0][i];
  });
*/

});

function resetBoard () {
  "use strict";
  console.log("Board reset");

  answerContainers.classed("correct",false);
  questionContainer.classed("correct",false);
  answerContainers.classed("incorrect",false);

  shuffle(answers[0]);
  console.log(answers);

  getNewQuestion();
  getNewAnswers(numberOfChoices - 1);
}

function getNewQuestion () {
  "use strict";
  var randIndex = getRandomInt(0,questions[0].length);
  var randQuestion = questions[0][randIndex];
  console.log(answers[0]);
  console.log(d3.select(randQuestion.parentNode).select(".cause")[0][0]);
  console.log(answers[0].indexOf(d3.select(randQuestion.parentNode).select(".cause")[0][0]));
  var ansOldIndex = answers[0].indexOf(d3.select(randQuestion.parentNode).select(".cause")[0][0]);
  arrayMove(answers[0], ansOldIndex, getRandomInt(0,numberOfChoices - 1));
  //randQuestion.parentNode.select(".cause")

  console.log(answers[0].indexOf(d3.select(randQuestion.parentNode).select(".cause")[0][0]));

  questionContainer.html("");
  questionContainer.append(function () {
    return randQuestion.cloneNode(true);
  });


  return;
}

function getNewAnswers (num) {
  "use strict";
  answerContainers.html("");
  answerContainers.append(function (d,i) {
    console.log(i);
    console.log(answers[0][i]);
    return answers[0][i].cloneNode(true);
  });
  /*
  var answerArray = [];
  for(i=0;i<num;i++) {
    var index = getRandomInt(0,answers[0].length);
    console.log(index);
    var newAnswer = answers[0][index];
    answerArray.push
    
    d3.select(answerContainers[0][i]).html(newAnswer.toString());
  }
  */
  return;
}

function getRandomInt(min, max) {
  "use strict";
  return Math.floor(Math.random() * (max - min)) + min;
}

function shuffle(array) {
  "use strict";
  var m = array.length, t, i;

  // While there remain elements to shuffle…
  while (m) {

    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
}

function arrayMove(arr, fromIndex, toIndex) {
  "use strict";
  var element = arr[fromIndex];
  arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, element);
}

resetBoard();