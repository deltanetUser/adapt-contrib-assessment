define(function(require) {

  var Adapt = require('coreJS/adapt');
  var Backbone = require('backbone');


  var AssessmentResultsModel= Backbone.Model.extend(
    {
      defaults: {
        data: {},
        settings: {},
        associatedLearning: [
        ],
        options: {
          questions: {},
          banks: {},
          associatedLearning: {},
          interactionEventsAttached: false,
        },
        isComplete: false,
        isResultsShown: false,
        isInReview: false
      },
      reset: function() {
        var options = this.get('options');
        options.associatedLearning = {};
        var model = $.extend(true, {}, JSON.parse(JSON.stringify(this.defaults)));
        model.associatedLearning = [];
        model.settings = Adapt.course.get("_learnerassistant");
        this.set(model);
      },
      setup: function(data) {
        this.reset();
        this.update(data);
      },
      update: function(data) {
        var model = this.get("data");
        $.extend(true, model, JSON.parse(JSON.stringify(data)));
        this.set('data', model);

        
      }

      
    }
  );

  return AssessmentResultsModel;
})