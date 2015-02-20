define(function(require) {

  var Adapt = require('coreJS/adapt');
  var Backbone = require('backbone');

  var TopNavigationView = Backbone.View.extend({

        tagName: 'a',

        className: 'la-results-icon',

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
            $('.navigation-drawer-toggle-button').after(this.$el.html(template({})));
            return this;
        },

        onResultsClicked: function(event) {

            if (Adapt.course.get("_isResultsShown") !== undefined) {
                if (Adapt.course.get("_isResultsShown")) {
                    console.log('close results');
                    event.preventDefault();
                    Adapt.trigger("assessmentresults:hideresults");
                } else {
                    console.log('open results');
                    event.preventDefault();
                    Adapt.trigger("assessmentresults:showresults");
                }
            } else {
                console.log('_isResultsShown is undefined');
                //event.preventDefault();
                //Adapt.trigger("assessmentresults:showresults");
            }
        }

    });

return TopNavigationView;

})