/*global d3, pym */
(function() {
  "use strict";

  d3.csv("data/timeline.csv", function (data) {
    var pymChild = new pym.Child();

    data = data.filter(function (d) {
      return d.cause.length > 1 && d.cause.length < 20;
    });

    console.log(data);

    var next = d3.select(".next-question");
    var numberOfChoices = 4;
    // var dataCollection = d3.select(".incidents");
    // var data = incidentCollection.selectAll(".sumtext");
    // var incidents = [];
    var questionContainer = d3.select(".impact-summary");
    // var questions = d3.select(".hidden").selectAll(".effect");
    var answerContainers = d3.select(".answers");
    // var answers = [d3.select(".hidden").selectAll(".cause")];
    // var answersUsed = d3.select(".hidden").selectAll(".cause-used");
    // var wrongQuestion = d3.select(".wrong");
    var performance = {"attempted": 0, "correct": 0, "incorrect": 0};
    var used = [];
    var totalQuestions = data.length;

    console.log("answerContainers: " + answerContainers);
    // console.log("answers: " + answers);
    console.log(next);
    console.log(answerContainers);
    // console.log(answers);

    // data.forEach(function (datum) {
    //   var el = d3.select(datum);
    //   var incident = {};

    //   incident.seen = false;
    //   incident.answeredCorrect = false;
    //   incident.cause = el.select(".cause");
    //   incident.effect = el.select(".effect");
    // });

    // console.log(incidents);


    function score (nCorrect, nQuestions) {
      var answersWord = nCorrect === 1 ? "answer" : "answers";
      return "You got <span class=\"correct-answers\">" + nCorrect + "</span> " +
        "correct " + answersWord + " out of " + nQuestions + " questions";
    }

    next.on("click", function () {
      if ( !answerContainers.selectAll(".incorrect").empty() || !answerContainers.selectAll(".correct").empty() ) {
        resetBoard();
      }
    });

    // answerContainers.selectAll(".answer").on("click", function (d,i) {
      
    //   console.log(i);
    //   console.log(d);
      
    // //   console.log("Answer clicked");
    // //   console.log(answerContainers);

    // //   var clicked = d3.select(this); 
    // //   // var effect = questionContainer.select(".effect");

    // //   // console.log(incidents[i].effect);
    // //   console.log(effect);
    // //   if (d3.select(answers[0][i].parentNode).select(".effect")[0][0] !== null) {
    // //     if (d3.select(answers[0][i].parentNode).select(".effect")[0][0].innerText == effect[0][0].innerText) {
    // //       clicked.classed("correct", true);
    // //       clicked.classed("selected", true);
    // //       clicked.html("");
    // //       clicked.append(function () {
    // //         return answers[0][i].parentNode;
    // //       })

    // //       questionContainer.classed("correct",true);
    // //     }
    // //     else {
    // //       clicked.classed("incorrect", true);
    // //     }
    // //   }
    // //   else {
    // //     clicked.classed("incorrect", true);
    // //   }


    // //   /*
    // //   answerContainers.html("");
    // //   answerContainers.append(function (d,i) {
    // //     console.log(i);d
    // //     console.log(answers);
    // //     return answers[0][i].parentNode;
    // //     //return answers[0][i];
    // //   });
    // // */

    // });

    function resetBoard () {
      
      console.log("Board reset");

      answerContainers.selectAll(".answer").classed("correct",false);
      questionContainer.classed("correct",false);
      answerContainers.selectAll(".answer").classed("incorrect",false);

      d3.select(".question-counter")
        .text((performance.attempted + 1) + " of " + totalQuestions);

      // console.log(data[0]);
      shuffle(data);
      // console.log(data[0]);

      getNewQuestion();
      getNewAnswers(numberOfChoices);
      pymChild.sendHeight();
    }

    function getNewQuestion () {
      
      var randIndex = getRandomInt(0,data.length);
      var randQuestion = data[randIndex];
      // console.log(d3.select(randQuestion.parentNode).select(".cause")[0][0]);
      // console.log(answers[0].indexOf(d3.select(randQuestion.parentNode).select(".cause")[0][0]));
      // var ansOldIndex = answers[0].indexOf(d3.select(randQuestion.parentNode).select(".cause")[0][0]);
      arrayMove(data, randIndex, getRandomInt(0,numberOfChoices - 1));
      //randQuestion.parentNode.select(".cause")

      // console.log(answers[0].indexOf(d3.select(randQuestion.parentNode).select(".cause")[0][0]));

      questionContainer.html("");

      questionContainer.append("h3")
        .classed("failure-hed", true)
        .text(randQuestion.Headline);

      questionContainer.append("div")
        .classed("effect", true)
        .text(randQuestion["Impact - Raw"]);

      return;
    }

    function getNewAnswers (num) {
      console.log(num);

      // console.log(data.slice(0,num));
      // // for(var i = 0; i < num; i++) {
      // //   for(var j = 0; j < num; j++) {
      // //     if ( data[i].cause === data[j].cause && data[i]["Impact - Raw"] !== questionContainer.select(".effect").text() ) {
      // //       data.push(data.splice(i,1));
      // //       i = -1; j = -1; continue;
      // //     }
      // //   }
      // // }
      // console.log(data.slice(0,num));

      // function uniqBy(a, key) {
      //     var seen = {};
      //     return a.filter(function(item) {
      //         var k = key(item);
      //         return seen.hasOwnProperty(k) ? false : (seen[k] = true);
      //     });
      // }

      
      // answerContainers.html("");
      var answers = answerContainers.selectAll(".answer")
        .data(function() {
          var used = {};
          var slice = [];

          for(var i = 0; slice.length < num; i++) {
            if ( i === data.length ) {
              console.log("break");
              break;
            }
            var match = data[i].cause.toLowerCase().replace(/(a |[^a-z])/g,"");
            console.log(used);
            console.log(slice);
            console.log(used[match]);
            if ( used[match] === undefined ) {
              used[match] = i;
              slice.push(data[i]);
            }
            else if ( data[i]["Impact - Raw"] === questionContainer.select(".effect").text() ) {
              console.log(slice);
              slice.splice(used[match], 1);
              used[match] = i;
              slice.push(data[i]);
              console.log(slice);
            }
            else {
              console.log("didn't add");
            }
          }
          console.log(used);
          return slice;
        }, function (d) { return d.Headline + d.formattedDate; });
      
      

      answers.enter()
        .append("li")
          .attr("class", "answer clickable");

      answers.selectAll("*").remove();

      answers.append("span")
        .attr("class", "cause")  
        .text(function(d) {
          return d.cause;
        });

      console.log(answers.enter().size());

      answers.exit().remove();

      answers.selectAll(".selected")
        .classed("selected", false);

      answers.on("click", function (d,i) {
        
        console.log(i);
        console.log(d);

        var clicked = d3.select(this);

        if ( answers.filter(".incorrect").empty() && answers.filter(".correct").empty() ) {
          performance.attempted++; 
        }
        // var effect = questionContainer.select(".effect");

        // console.log(incidents[i].effect);
        // console.log(effect);

        if (d["Impact - Raw"] === questionContainer.select(".effect").text()) {
          clicked.classed("correct", true);
          clicked.classed("selected", true);
          clicked.html("");
          clicked.append("div")
            .classed("sumtext", true)
            .text(d.sumtext);

          // questionContainer.insert("h3")
          //   .text(d.Headline);

          // questionContainer.append(questionContainer.select(".effect").remove());

          questionContainer.node().appendChild(questionContainer.select(".effect").node());

          var links = clicked.select(".sumtext").selectAll(".readmore")
              .data(function(d) { return d.url.split("; "); });

          clicked.select(".sumtext").append("br").attr("class", "sources hidden");

          clicked.select(".sumtext").append("span").attr("class", "sources hidden").text("Read More:");
            // .style("color", "#ddd");

          links.enter().append("a")
            .attr("class", "readmore")
            .attr("href", function(d) { return d; })
            .attr("target", "_blank")
            .html(function(d,i) {
              if ( links.size() === 1 ) {
                clicked.selectAll(".sources").classed("hidden", true);
                return "Read&nbsp;More";
              }
              else {
                clicked.selectAll(".sources").classed("hidden", false);
                return "["+ (i + 1) +"]";
              }
            });

          questionContainer.classed("correct",true);
          if( answers.filter(".incorrect").empty() ) {
            performance.correct++;
          }

          used.push(data.splice(i,1));
          console.log(used);
          console.log(data.length);
        }
        else {
          clicked.classed("incorrect", true);
          performance.incorrect++;
        }

        d3.select(".score").html(score(performance.correct, performance.attempted));

        pymChild.sendHeight();

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
      
      return Math.floor(Math.random() * (max - min)) + min;
    }

    function shuffle(array) {
      
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
      
      var element = arr[fromIndex];
      arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, element);
    }

    resetBoard();

  });
})();