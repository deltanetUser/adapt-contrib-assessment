define(function(require) {

	var Adapt = require('coreJS/adapt');
	var RollayView = require('extensions/adapt-rollay/js/rollayView');

	var AssessmentResultsView = RollayView.extend(
		{
			//UI
			className : "sr-results",
			template : "assessment-resultsView",

			initialize: function() {

        var assessmentResultsText = {};
        var finalFeedbackText;

        if (Adapt.course.get('_assessmentResults')) {
        	assessmentResultsText = Adapt.course.get('_assessmentResults');
        	finalFeedbackText = Adapt.course.get('_assessmentResults')._resultsPage.generalFeedback;
        };

        if (finalFeedbackText) {
          finalFeedbackText = finalFeedbackText.replace("[SCORE]", this.model.score);
          finalFeedbackText = finalFeedbackText.replace("[MAXSCORE]", this.model.maxScore);
          finalFeedbackText = finalFeedbackText.replace("[FEEDBACK]", this.model.bandedFeedback);
          finalFeedbackText = finalFeedbackText.replace("[PERCENT]", this.model.scoreAsPercent);
        };

        this.model.assessmentResultsTitle = assessmentResultsText._resultsPage.title;
        this.model.assessmentResultsInstruction = assessmentResultsText._resultsPage.instruction;
        this.model.assessmentResultsFeedback = finalFeedbackText;

			},

			postRender: function() {
				if (!Adapt.course.get("_isResultsShown") || Adapt.course.get("_isResultsShown") == undefined ) {
            Adapt.course.set("_isResultsShown", true);
        }
			},
			remove: function() {
				if (Adapt.course.get("_isResultsShown")) {
            Adapt.course.set("_isResultsShown", false);
        }
			}
		},
		{
			//INTERACTION
			events : {
				'click .sa-close': 'onCloseClick'
			},
			onCloseClick: function(event) {
				event.preventDefault();
			}
		}
	);

	return AssessmentResultsView;
});