define(function(require) {

	var Adapt = require('coreJS/adapt');
	var RollayView = require('extensions/adapt-rollay/js/rollayView');

	var AssessmentResultsView = RollayView.extend(
		{
			//UI
			className : "la-results",
			template : "assessment-resultsView",

			initialize: function() {

        var assessmentResultsText = {};
        var finalFeedbackText;
        if (Adapt.course.get('_assessmentResults')) {
        	assessmentResultsText = Adapt.course.get('_assessmentResults');
        	finalFeedbackText = Adapt.course.get('_assessmentResults')._resultsPage.feedback;
        };

        if (finalFeedbackText) {
        	var finalFeedbackText = (Adapt.course.get('_assessmentResults')._resultsPage.feedback);

          finalFeedbackText = finalFeedbackText.replace("[SCORE]", this.model.get('score'));
          finalFeedbackText = finalFeedbackText.replace("[MAXSCORE]", this.model.get('maxScore'));
        };

        this.model.set('assessmentResultsTitle', assessmentResultsText._resultsPage.title);
        this.model.set('assessmentResultsInstruction', assessmentResultsText._resultsPage.instruction);
        this.model.set('assessmentResultsFeedback', finalFeedbackText);
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
				'click .la-close': 'onCloseClick'
			},
			onCloseClick: function(event) {
				event.preventDefault();
			}
		}
	);

	return AssessmentResultsView;
});