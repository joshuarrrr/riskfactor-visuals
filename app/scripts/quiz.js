/*global d3, pym */
(function() {
  "use strict";

  RegExp.escape = function(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  };

  d3.csv("data/timeline.csv", function (data) {
    var pymChild = new pym.Child();

    data = data.filter(function (d) {
      return d.cause.length > 1 && d.cause.split("\n").length < 4;
      // return d.cause.length > 1;
    });

    console.log(data.length);

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
    var questionsToComplete = 10;
    var questionsToAttempt = questionsToComplete;

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
      return "You have <span class=\"correct-answers\">" + nCorrect + "</span> " +
        "correct " + answersWord + " out of " + nQuestions + " so far";
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

      answerContainers
        .classed("attempted", false);

      next
        .classed("inactive", true);

      answerContainers.selectAll(".answer").classed("correct",false).classed("clickable", true);
      questionContainer.classed("correct",false);
      answerContainers.selectAll(".answer").classed("incorrect",false).classed("faded", false);

      d3.select(".question-counter")
        .text((performance.attempted + 1) + " of " + questionsToAttempt);

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

    function displayCorrect (target) {
      target.classed("correct", true);
      target.html("");
      target.append("div")
        .classed("sumtext", true)
        .html(function (d) { 
          console.log(d.cause);
          console.log(d.sumtext);
          var search = d.cause.split("\n").filter(function(cause) { return cause.length > 0; });
          var fullText = d.sumtext;

          console.log(search);

          search.forEach(function(cause) {
            var expanded = cause;

            console.log(cause);
            if ( cause.indexOf("...") > 0 ) {
              // console.log(cause.split("...").join(".*"));
              expanded = new RegExp(cause.split("...")
                .map(function (frag) {
                  return RegExp.escape(frag);
                })
                .join(".*"));

              console.log(expanded);
              cause = fullText.match(expanded);
              console.log(cause);
            }
            fullText = fullText
              .split(cause)
              .join("<span class=\"highlighted\">" + 
                cause + "</span>"); 
          });

          return fullText
            .split("\n")
            .filter(function(cause) { return cause.length > 0; })
            .join("<br><br>");

          // return d.sumtext.split(search).join("<span class=\"highlighted\">" + 
          //   d.cause + "</span>"); 
          });

      var links = target.select(".sumtext").selectAll(".readmore")
              .data(function(d) { return d.url.split("; "); });

      target.select(".sumtext").append("br").attr("class", "sources hidden");

      target.select(".sumtext").append("span").attr("class", "sources hidden").text("Read More:");
        // .style("color", "#ddd");

      links.enter().append("a")
        .attr("class", "readmore")
        .attr("href", function(d) { return d; })
        .attr("target", "_blank")
        .html(function(d,i) {
          if ( links.size() === 1 ) {
            target.selectAll(".sources").classed("hidden", true);
            return "Read&nbsp;More";
          }
          else {
            target.selectAll(".sources").classed("hidden", false);
            return "["+ (i + 1) +"]";
          }
        });

      answerContainers.selectAll(".answer:not(.correct):not(.incorrect)")
        .classed("faded", true);
    }

    function removeComplete () {
      var complete = d3.select(".complete");

      complete.remove();

      d3.select(".quiz-status").selectAll(".score, .counter")
        .classed("hidden", false);

      next
        .classed("hidden", false);
    }

    function resetQuiz() {
      performance = {"attempted": 0, "correct": 0, "incorrect": 0};

      removeComplete();

      d3.select(".score")
        .html("");

      resetBoard();

      next
        .classed("hidden", true);
    }

    function displayComplete (total) {
      d3.select(".quiz-status").selectAll(".score, .counter")
        .classed("hidden", true);

      var complete = d3.select(".quiz-status").append("div")
        .attr("class", "complete")
        .attr("id", "complete");

      if ( performance.correct / performance.attempted >= 0.5 ) {
        complete
          .classed("correct", true)
          .html("Congratulations! You correctly identified the causes of " + 
            performance.correct + " of " + performance.attempted + " failures."
            );
      }
      else {
        complete
          .classed("incorrect", true)
          .html("Bummer! You correctly identified the causes of " + 
            performance.correct + " of " + performance.attempted + " failures." +
            "<br>As you have discovered, many reported causes are uninformative."
            );
      }

      var buttonContainer = complete.append("div")
        .attr("class", "buttons");

      buttonContainer.append("a")
        .attr("class", "button")
        .attr("id", "continue")
        .text("Keep Going")
        .on("click", function() { 
          questionsToAttempt += questionsToComplete;

          if ( questionsToAttempt > totalQuestions ) {
            questionsToAttempt = totalQuestions;
          }

          d3.select(".question-counter")
            .text((performance.attempted) + " of " + questionsToAttempt);

          removeComplete(); 
        });

      buttonContainer.append("a")
        .attr("class", "button")
        .attr("id", "reset")
        .text("Reset Score & Start Over")
        .on("click", function() { resetQuiz(); });

      complete.append("text")
        .text("Share your score and challenge your friends:");

      var shareContainer = complete.append("div")
        .attr("class", "share-buttons");

      shareContainer.append("a")
        .attr("class", "share-fb share button")
        .style("background", "url('images/facebook.png')");

      shareContainer.append("a")
        .attr("class", "share-twtr share button")
        .style("background", "url('images/twitter.png')");

      // pymChild.sendHeight();

      shareContainer.node().scrollIntoView();

      var sharing = new Share();
      // location.hash = "#complete";
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
        .html(function(d) {
          return d.cause
            .split("\n")
            .filter(function(cause) { return cause.length > 0; })
            .join("<hr>");
        });

      console.log(answers.enter().size());

      answers.exit().remove();

      answers.selectAll(".selected")
        .classed("selected", false);

      answers.on("click", function (d,i) {
        
        console.log(i);
        console.log(d);

        var clicked = d3.select(this);

        if (!clicked.classed("clickable")) {
          return;
        }

        if ( answers.filter(".incorrect").empty() && answers.filter(".correct").empty() ) {
          performance.attempted++; 
        }

        answerContainers
          .classed("attemped", true);

        next
          .classed("inactive", false)
          .classed("hidden", false);

        answers
          .classed("clickable", false);

        // var effect = questionContainer.select(".effect");

        // console.log(incidents[i].effect);
        // console.log(effect);

        if (d["Impact - Raw"] === questionContainer.select(".effect").text()) {
          clicked.classed("selected", true);

          // clicked.classed("correct", true);
          // clicked.html("");
          // clicked.append("div")
          //   .classed("sumtext", true)
          //   .text(d.sumtext);

          // // questionContainer.insert("h3")
          // //   .text(d.Headline);

          // // questionContainer.append(questionContainer.select(".effect").remove());

          questionContainer.node().appendChild(questionContainer.select(".effect").node());

          // var links = clicked.select(".sumtext").selectAll(".readmore")
          //     .data(function(d) { return d.url.split("; "); });

          // clicked.select(".sumtext").append("br").attr("class", "sources hidden");

          // clicked.select(".sumtext").append("span").attr("class", "sources hidden").text("Read More:");
          //   // .style("color", "#ddd");

          // links.enter().append("a")
          //   .attr("class", "readmore")
          //   .attr("href", function(d) { return d; })
          //   .attr("target", "_blank")
          //   .html(function(d,i) {
          //     if ( links.size() === 1 ) {
          //       clicked.selectAll(".sources").classed("hidden", true);
          //       return "Read&nbsp;More";
          //     }
          //     else {
          //       clicked.selectAll(".sources").classed("hidden", false);
          //       return "["+ (i + 1) +"]";
          //     }
          //   });
          
          questionContainer.classed("correct", true);
          displayCorrect(clicked);
          
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

          var correct = answers
            .filter(function(d) { return d["Impact - Raw"] === questionContainer.select(".effect").text(); });

          displayCorrect(correct);  

          // console.log(correct.datum());
          // console.log(data.indexOf(correct.datum()));

          used.push(data.splice(data.indexOf(correct.datum()),1));
          console.log(used);
          console.log(data.length);
        }

        d3.select(".score").html(score(performance.correct, performance.attempted));

        // console.log(questionsToComplete % performance.attempted);
        if( (performance.attempted >= questionsToComplete && 
          performance.attempted % questionsToComplete) === 0 ||
          performance.attempted === totalQuestions ) {
          displayComplete(performance.attempted);

          next
            .classed("hidden", true);
        }

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

    var Share = function() {
      // var fbInitialized = false;
      
      function shareData() {
        var data = {
          title: "IT Failure Blame Game",
          preTitle: "Lessons from a Decade of IT Failures:",
          score: "I successfully identified " + 
            performance.correct +
            " of " +
            performance.attempted +
            " causes in the",
          url: window.parent.location.protocol + "//" + 
              window.parent.location.host +
              window.parent.location.pathname,
          // images: ,
          description: "When IT projects fail, there's plenty of blame to go around." + 
          " See how high you can score by identifying causes and excuses."
        };

        return data;
      }

      function track(label) {
        return;
        //MCP.share(label);
      }

      var that = {

        assignButtons: function() {
          $(".share-fb").on("click",that.postToFacebook);
          $(".share-twtr").on("click",that.postToTwitter);
          // $("#share-email").on("click",that.emailLink);
          // $("#share-gpls").on("click",that.postToGooglePlus);
          // $("#share-lin").on("click",that.postToLinkedIn);
        },
        
        postToFacebook: function(event) {
          event.preventDefault();
          var data = shareData();
          // data.image = $(this.parentNode).attr("data-section") !== undefined ? data.images[$(this.parentNode).attr("data-section")] : data.images.default;
          var obj = {
            app_id: "174248889578740",
            method: "feed",
            // name: data.longTitle,
            name: data.score + data.title,
            link: data.url,
            caption: data.preTitle.slice(0,-1),
            // picture: window.location.protocol + "//" + 
            //   window.location.host +
            //   window.location.pathname.split("/").slice(0,-1).join("/") +
            //   data.image,
            description: data.description
          };
          window.FB.ui(obj, function(response) {
            track("Facebook");
          });
          // pymChild.sendMessage("shareFB", JSON.stringify(obj));
        },
        
        centerPopup: function(width, height) {
          var wLeft = window.parent.screenLeft ? window.screenLeft : window.screenX;
          var wTop = window.parent.screenTop ? window.screenTop : window.screenY;
          var left = wLeft + (window.parent.innerWidth / 2) - (width / 2);
          var top = wTop + (window.parent.innerHeight / 2) - (height / 2);

          // console.log(window)
          return "width=" + width + ",height=" + height + ",top=" + top + ",left=" + left;
        },
        
        postToTwitter: function(event) {
          event.preventDefault();
          var data = shareData();
          var tweetUrl = "https://twitter.com/share?url=" + 
            encodeURIComponent(data.url) + "&text=" + 
            encodeURIComponent(data.score + " @IEEESpectrum " + data.title);
          var opts = that.centerPopup(500, 300) + "scrollbars=1";
          track("Twitter");
          window.parent.open(tweetUrl, "twitter", opts);
        },
        
      };

      that.assignButtons();
      return that;
    };

    resetBoard();

  });
})();