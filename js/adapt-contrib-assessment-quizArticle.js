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

            // SET MODELS FEEDBACK MESSAGE
            this.setFeedbackMessage();
            this.model.set({
                'feedbackTitle': this.model.get('_assessment')._completionMessage.title, 
                'score': isPercentageBased ? scoreAsPercent + '%' : score
            });


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

            // show the result navigation
            topNavigationView = new TopNavigationView();

            // decide how to show feedback here
            //Adapt.trigger('questionView:showFeedback', this);

            if (isPercentageBased) {
                isPass = (scoreAsPercent >= scoreToPass) ? true : false; 
            } else {
                isPass = (score >= scoreToPass) ? true : false;
            }

            Adapt.trigger('assessment:complete', {isPass: isPass, score: score, scoreAsPercent: scoreAsPercent});

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
        },

        //RESULTS VIEW FUNCTIONS
        showResults: function(callback) {
            //CHANGE ROLLAY VIEW TO RESULTS VIEW
            Adapt.rollay.model.set("forceShow", false);
            Adapt.rollay.setCustomView( new AssessmentResultsView() );

            //RESHOW ROLLAY
            Adapt.rollay.render();
            Adapt.rollay.show(function() {
                Adapt.trigger("assessmentresults:resultsopened");
                if (typeof callback == "function") callback();
            });

            this.model.set('_assessment')._isResultsShown = true;
        },

        hideResults: function(callback) {
            Adapt.rollay.hide(function() {
                Adapt.trigger("assessmentresults:resultsclosed");
                if (typeof callback == "function") callback();
            });
            this.model.set('_assessment')._isResultsShown = false;
        },

        
    });

    var TopNavigationView = Backbone.View.extend({

        tagName: 'a',

        className: 'la-results-icon',

        initialize: function() {
            this.listenTo(Adapt, 'remove', this.remove);
            this.$el.attr('href', '#');
            this.render();
        },

        events: {
            'click .guided-learning-item a': 'onResultsClicked'
        },

        render: function() {
            var template = Handlebars.templates["assessment-topNavigationView"];
            $('.navigation-drawer-toggle-button').after(this.$el.html(template({})));
            return this;
        },

        onResultsClicked: function(event) {
            console.log(this.model.get('_assessment')._isResultsShown);
            
            event.preventDefault();
           Adapt.trigger("assessmentresults:showresults");
        }

    });

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

            //CHANGE ROLLAY VIEW TO RESULTS VIEW
            Adapt.rollay.model.set("forceShow", false);
            Adapt.rollay.setCustomView( new AssessmentResultsView() );

            this.model.set('_assessment')._isResultsShown = true;

            //RESHOW ROLLAY
            Adapt.rollay.render();
            Adapt.rollay.show(function() {
                Adapt.trigger("assessmentresults:resultsopened");
                if (typeof callback == "function") callback();
            });
    });

});