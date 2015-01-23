define(function(require) {

    var Adapt = require('coreJS/adapt');
    var AssessmentResultsView = require('extensions/adapt-contrib-assessment/js/adapt-contrib-assessment-resultsView');


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
            var isPass = false;
            this.setFeedbackMessage();
            this.model.set({
                'feedbackTitle': this.model.get('_assessment')._completionMessage.title, 
                'score': isPercentageBased ? scoreAsPercent + '%' : score
            });

            // decide how to show feedback here
            //Adapt.trigger('questionView:showFeedback', this);

            if (isPercentageBased) {
                isPass = (scoreAsPercent >= scoreToPass) ? true : false; 
            } else {
                isPass = (score >= scoreToPass) ? true : false;
            }

            Adapt.trigger('assessment:complete', {isPass: isPass, score: score, scoreAsPercent: scoreAsPercent});


            var alertObject = {
                title: this.model.get('_assessment')._completionMessage.title,
                body: this.model.get('_assessment')._completionMessage.message,
                confirmText: this.model.get('_assessment')._showResultsButton,
                _callbackEvent: "assessmentresults:showresults",
                _showIcon: false
            };
            // SHOW ALERT TO RESULST VIEW
            Adapt.trigger('notify:alert', alertObject);



        },

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
        },

        //RESULTS VIEW FUNCTIONS
        results: {
            show: function(callback) {
                //CHANGE ROLLAY VIEW TO RESULTS VIEW
                Adapt.rollay.model.set("forceShow", true);
                Adapt.rollay.setCustomView( new AssessmentResultsView() );
                
                //RESHOW ROLLAY
                //Adapt.rollay.hide(0);
                Adapt.rollay.render();
                Adapt.rollay.show(function() {
                    Adapt.trigger("assessmentresults:resultsopened");
                    if (typeof callback == "function") callback();
                });
                //
                //Adapt.bottomnavigation.render();
            },
            hide: function(callback) {
                Adapt.rollay.hide(function() {
                    Adapt.trigger("assessmentresults:resultsclosed");
                    if (typeof callback == "function") callback();
                });
                //
                //Adapt.bottomnavigation.render();
            }
        },

        
    });
    
    //AssessmentView = new AssessmentView();

    //AssessmentView.views['results'] = new AssessmentResultsView();
    //AssessmentView.views['results'].parent = AssessmentView;

    //back button clicked
    Adapt.on("navigation:backButton",  function () { 
        if (Adapt.rollay.model.get("forceShow")) return;
        Adapt.rollay.hide.call(Adapt.rollay); 
        console.log('hi rollay here');
    });

    Adapt.on('articleView:postRender', function(view) {
        if (view.model.get('_assessment') && view.model.get('_assessment')._isEnabled) {
            new AssessmentView({model:view.model});
        }
    });

    Adapt.on('assessmentresults:showresults', function(view) {
        //HIDE PAGELEVELPROGRESS NAV
            //AssessmentView.pagelevelprogress.hide(0);

            //MOVE BACK TO MAIN MENU
            //var parentId = Adapt.findById(AssessmentView.views['assessment'].model.get("_parentId")).get("_parentId");
            //Backbone.history.navigate("#/id/" + parentId, {trigger: true, replace: true});

            //SHOW THE RESULTS
            //AssessmentView.results.show();



            //CHANGE ROLLAY VIEW TO RESULTS VIEW
            Adapt.rollay.model.set("forceShow", false);
            Adapt.rollay.setCustomView( new AssessmentResultsView() );
            
            //RESHOW ROLLAY
            //Adapt.rollay.hide(0);
            Adapt.rollay.render();
            Adapt.rollay.show(function() {
                Adapt.trigger("assessmentresults:resultsopened");
                if (typeof callback == "function") callback();
            });
            //
            //Adapt.bottomnavigation.render();

            //SHOW ASSIST LEARN NAV
            //AssessmentView.navigation.show();
    });

//return AssessmentView;

});