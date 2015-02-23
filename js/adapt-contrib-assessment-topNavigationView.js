define(function(require) {

  var Adapt = require('coreJS/adapt');
  var Backbone = require('backbone');

  var TopNavigationView = Backbone.View.extend({

        tagName: 'a',

        className: 'sr-results-icon',

        initialize: function() {
            this.listenTo(Adapt, 'remove', this.remove);
            this.$el.attr('href', '#');
            this.render();
        },

        events: {
            'click': 'onResultsClicked'
        },

        render: function() {
            
            var template = Handlebars.templates["assessment-topNavigationView"];
            $('.navigation-inner').append(this.$el.html(template({})));
            return this;
        },

        onResultsClicked: function(event) {

            if (Adapt.course.get("_isResultsShown") !== undefined) {
                if (Adapt.course.get("_isResultsShown")) {
                    event.preventDefault();
                    Adapt.trigger("assessmentresults:hideresults");
                } else {
                    event.preventDefault();
                    Adapt.trigger("assessmentresults:showresults");
                }
            } else {
                console.log('_isResultsShown is undefined');
                event.preventDefault();
                Adapt.trigger("assessmentresults:showresults");
            }
        }

    });

return TopNavigationView;

})