adapt-contrib-assessment
========================

A basic assessment for the Adapt Framework which attaches to an 'article' object to group various question components (such as [adapt-contrib-mcq](https://github.com/adaptlearning/adapt-contrib-mcq), [adapt-contrib-textInput](https://github.com/adaptlearning/adapt-contrib-textInput) and [adapt-contrib-matching](https://github.com/adaptlearning/adapt-contrib-matching)) and provide a score with feedback.

A [sample JSON](https://github.com/adaptlearning/adapt-contrib-assessment/blob/master/example.json) is given below which can be added to a single article block:

```json
"_assessment": {
    "_isEnabled" : true,
    "_isPercentageBased" : true,
    "_scoreToPass" : 60,
    "_completionMessage" : {
        "title" : "You have finished the assessment",
        "message": "You have scored [SCORE] out of [MAXSCORE].  [FEEDBACK]",
        "_showResultsButton" : "See results"
    },
    "_bands": [
        {
            "_score": 0,
            "feedback": "You must try harder"
        },
        {
            "_score": 25,
            "feedback": "I think you can do better than this"
        },
        {
            "_score": 50,
            "feedback": "Good effort, you're getting there..."
        },
        {
            "_score": 75,
            "feedback": "Excellent!"
        }
    ]
}
```

Further values for the overall results must be added to the course.json:

```json
"_assessmentResults": {
    "_resultsPage": {
        "title": "Welcome to your results",
        "generalFeedback": "generalFeedback": "<p>You scored [SCORE] out of [MAXSCORE] as a percentage that is [PERCENT].</p><p>[FEEDBACK]</p>",
        "instruction": "You have finished this course. Feel free to go back over the course material. If you wish to re-take the assesment please close this window and try again."
    },
    "_isResultsShown": false,
    "_isResultsNavShown": false
}
```

A description of attributes is as follows:

| Attribute        | Type| Description|
| :------------ |:-------------|:-----|
| _isPercentageBased        | bool |Set this to *true* if the assessment should work on percentages, or *false* for otherwise|
| _scoreToPass         | int      | This is the 'pass' mark for the assessment.  If _isPercentageBased is set to *true* this will be a percentage, e.g. 60 would equal 60% |
| _completionMessage            | object | An object containing *title* and *message* string values.  Note that *message* can contain the following placeholders: [SCORE], [MAXSCORE], [PERCENT] and [FEEDBACK] where [FEEDBACK] is the banded feedback for thier result taken from *_bands*.|
| _bands          | object array | An array of objects whose purpose is to define the score banding.  The attributes required for each object are _score and *feedback*

###Events

<table>
    <thead>
        <td><b>Event</b></td>
        <td><b>Description</b></td>
        <td><b>Object</b></td>        
    </thead>
    <tr valign="top">
        <td><i>assessment:complete</i></td>
        <td>Triggered when the user submits the last question component which is part of the assessment article </td>
        <td>
            <table>
                <tr>
                    <td>isPass</td>
                    <td>bool</td>
                </tr>
                <tr>
                    <td>score</td>
                    <td>int</td>
                </tr>
                <tr>
                    <td>scoreAsPercent</td>
                    <td>int</td>
                </tr>
            </table>
        
        </td>        
    </tr>
</table>
