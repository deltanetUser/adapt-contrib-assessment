define(function(require) {

    var Adapt = require('coreJS/adapt');
    var AssessmentResultsView = require('extensions/adapt-contrib-assessment/js/adapt-contrib-assessment-resultsView');
    var AssessmentTopNavigationView = require('extensions/adapt-contrib-assessment/js/adapt-contrib-assessment-topNavigationView');

// CAN THIS BE REMOVED FROM A BACKBONE VIEW AND HAVE FUNCTIONS AT MODULE LEVEL.

    var AssessmentView = Backbone.View.extend({
        initialize: function() {
            this.listenTo(this.model, 'change:_isComplete', this.assessmentComplete);
            this.listenTo(Adapt, 'remove', this.removeAssessment);
            this.setUpQuiz();
        },

        getQuestionComponents: function() {
            var childComponents = this.model.findDescendants('components');

            // Although we retrieve all decendants of the article, regarding the assessment
            // we are only interested in questions.  Currently we check for a
            // _questionWeight attribute
            return _.filter(childComponents.models, function(component) { 
                if (component.get('_questionWeight')) {
                    return component;
                } 
            });
        },

        assessmentComplete: function() { 
            function notComplete(model) {
                return !model.get('_isComplete');
            }

            if(notComplete(this.model) || _.some(this.getQuestionComponents(), notComplete)) return;
            
            var isPercentageBased = this.model.get('_assessment')._isPercentageBased;
            var scoreToPass = this.model.get('_assessment')._scoreToPass;
            var score = this.getScore();
            var scoreAsPercent = this.getScoreAsPercent();
            var maxScore = this.getMaxScore().toString();
            var isPass = false;

            // SET MODELS FEEDBACK MESSAGE
            this.setFeedbackMessage();
            this.model.set({
                'feedbackTitle': this.model.get('_assessment')._completionMessage.title, 
                'score': isPercentageBased ? scoreAsPercent + '%' : score,
                'maxScore': isPercentageBased ? 100 + '%' : maxScore
            });

            if (isPercentageBased) {
                isPass = (scoreAsPercent >= scoreToPass) ? true : false; 
            } else {
                isPass = (score >= scoreToPass) ? true : false;
            }

            Adapt.trigger('assessment:complete', {isPass: isPass, score: score, scoreAsPercent: scoreAsPercent});

            // create the resuls top navigation view
            setupResultsNavigation();

            // results alert
            var alertObject = {
                title: this.model.get('_assessment')._completionMessage.title,
                body: this.model.get('feedbackMessage'),
                confirmText: this.model.get('_assessment')._showResultsButton,
                _callbackEvent: "assessmentresults:showresults",
                _showIcon: false
            };
            // SHOW ALERT TO RESULST VIEW
            Adapt.trigger('notify:alert', alertObject);

        },
// SETS THE FEEDBACK MESSAGE IN THE MODEL
        setFeedbackMessage: function() {
            var feedback = (this.model.get('_assessment')._completionMessage.message);

            feedback = feedback.replace("[SCORE]", this.getScore());
            feedback = feedback.replace("[MAXSCORE]", this.getMaxScore().toString());
            feedback = feedback.replace("[PERCENT]", this.getScoreAsPercent().toString());
            feedback = feedback.replace("[FEEDBACK]", this.getBandedFeedback().toString());

            this.model.set('feedbackMessage', feedback);
        },

        setUpQuiz: function() {
            this.model.get('_assessment').score = 0;
            $('.' + this.model.get('_id')).addClass('assessment');
            _.each(this.getQuestionComponents(), function(component) {
                component.set({'_isEnabledOnRevisit': false, '_canShowFeedback': false}, {pluginName: "_assessment"});
            });
        },
        
        getScore: function() {
            var score = 0;

            _.each(this.getQuestionComponents(), function(component) {
                if (component.get('_isCorrect') && component.get('_score')) {
                    score += component.get('_score');   
                }
            });

            return score;
        },
        
        getMaxScore: function() {
            var maxScore = 0;

            _.each(this.getQuestionComponents(), function(component) {
                if (component.get('_questionWeight')) {
                    maxScore += component.get('_questionWeight');
                }
            });

            return maxScore;
        },
        
        getScoreAsPercent: function() {
            return Math.round((this.getScore() / this.getMaxScore()) * 100);
        },    
        
        resetQuiz: function() {
            this.model.set('_assessment').numberOfAnsweredQuestions = 0;
            this.model.set('_assessment').score = 0;
        },
        
        getBandedFeedback: function() {
            var bands = this.model.get('_assessment')._bands;
            var percent = this.getScoreAsPercent();
            
            for (var i = (bands.length - 1); i >= 0; i--) {
                if (percent >= bands[i]._score) {
                    return bands[i].feedback;
                }
            }
        },

        removeAssessment: function() {
            this.remove();
        }

    });

    function setupResultsNavigation() {

        if (Adapt.course.get("_assessmentResults")._isResultsNavShown !== undefined) {
            Adapt.course.set("_isResultsNavShown", true)
            new AssessmentTopNavigationView();
        } else {
            console.log('error: Assessment results values not set in course.json');
        }

    }

    function showResults() {

        Adapt.rollay.render();
        Adapt.rollay.show(function() {
            if (typeof callback == "function") callback();
        });
    }

    function hideResults() {
        if (Adapt.course.get("_isResultsShown")) {
            Adapt.course.set("_isResultsShown", false);
        }
        Adapt.rollay.hide(function() {
            if (typeof callback == "function") callback();
        });
    }

    Adapt.on("navigation:backButton",  function () { 
        //if (Adapt.rollay.model.get("forceShow")) return;
        Adapt.rollay.hide.call(Adapt.rollay);
        if (Adapt.course.get("_isResultsShown")) {
            Adapt.course.set("_isResultsShown", false); 
        }
        console.log('hi rollay here, back button pressed');
    });

    Adapt.on('articleView:postRender', function(view) {
        if (view.model.get('_assessment') && view.model.get('_assessment')._isEnabled) {
            new AssessmentView({model:view.model});

            Adapt.rollay.model.set("forceShow", true);

            Adapt.rollay.setCustomView( new AssessmentResultsView({model:view.model}));

        }

    });
// IF ITS A PAGE CHECK IF WE NEED TO SHOW RESULTS LINK
    Adapt.on('router:page', function(pageModel) {
        if (Adapt.course.get("_isResultsNavShown")) {
            setupResultsNavigation();
        }
    });

    Adapt.on('assessmentresults:showresults', function() {
        showResults();
    });

    Adapt.on('assessmentresults:hideresults', function() {
        hideResults();
    });

});