const version = "0.0.1";
console.log("Loading APP version", version);

var app = new Vue({
  el: "#app",
  data: {
    maxStoredCombinations: 10,
    demographics: [],
    surveys: [
      { id: "1", title: "Survey 1", demographics: ["GENDER", "ETHNICITY"], unlocked: false },
      { id: "2", title: "Survey 2", demographics: ["GENDER", "ETHNICITY"], unlocked: false },
      { id: "3", title: "Survey 3", demographics: ["GENDER", "AGE"], unlocked: false },
      { id: "4", title: "Survey 4", demographics: ["GENDER", "AGE", "happy"], unlocked: false },
      { id: "5", title: "Survey 1", demographics: ["GENDER", "ETHNICITY"], unlocked: false }
    ],
    combinations: []
  },
  created: function() {
    console.log("create");

    var _self = this;
    $.getJSON("./demographics_small.json", function (json) {
      json.forEach((demographicName) => {
        _self.demographics.push({
          name: demographicName,
          active: false
        })
      });
    });
  },
  computed: {
    combinationsLength: function() {
      return this.combinations.length;
    },
    numOfCombinations: function() {
      console.log("maxNumberOfCombinations");
      var binaryMatrix = _.map(this.demographics, () => { return "1" }).join("");
      var maxNumberOfCombinations = parseInt(binaryMatrix, 2) + 1

      return maxNumberOfCombinations;
    },
    minSurveysUnlockedInStoredCombinations: function() {
      console.log("minSurveysUnlockedInStoredCombinations");
      return _.min(_.map(this.combinations, "numSurveysUnlocked"));
    },
  },
  methods: {
    start: function() {
      console.log("start");

      this.resetSurveyStates();

      var _self = this;

      _.times(10, function() {
        for (var i = 0; i < _self.numOfCombinations; i++) {
          setTimeout((i) => { _self.calculateCombination(i) }, 0, i);
        }
      });

    },

    calculateCombination: function(index) {
      console.log("calculateCombination", index);
      var binaryMatrix = index.toString(2);
      binaryMatrix = binaryMatrix.padStart(this.demographics.length, "0");
      this.setDemographicStates(binaryMatrix);
      this.calculate();
      this.storeCombination();
    },

    resetSurveyStates: function() {
      this.surveys.forEach((survey) => {
        survey.unlocked = false;
      })
    },

    setDemographicStates(binaryMatrix){
      console.log("setDemographicStates", binaryMatrix)
      for (var i = 0; i < binaryMatrix.length; i++) {
        var value = binaryMatrix[i] == "1";
        this.demographics[i].active = value;
      }
    },

    calculate: function() {
      var states = _.map(this.demographics, function(e){ return e.active } );
      console.log("calculate", states);

      this.surveys.forEach((survey) => {
        this.calculateSurvey(survey);
      })

    },

    calculateSurvey: function(survey) {
      var demographics_active = _.filter(this.demographics, function(e) { return e.active });
      var demographics_active_names = _.map(demographics_active, function(e) { return e.name });

      var survey_unlocked = _.difference(survey.demographics, demographics_active_names).length == 0;

      survey.unlocked = survey_unlocked;
      // survey.unlocked = (Math.floor(Math.random() * 2) == 0);

      console.log("survey", survey.title, survey.unlocked);
    },

    storeCombination: function() {
      console.log("storeCombination");
      var numSurveysUnlocked = this.surveysUnlocked().length;

      console.log("numSurveysUnlocked", numSurveysUnlocked);
      console.log("this.minSurveysUnlockedInStoredCombinations", this.minSurveysUnlockedInStoredCombinations);
      console.log("this.combinations.length", this.combinations.length);

      if((this.combinations.length >= this.maxStoredCombinations) && (numSurveysUnlocked > this.minSurveysUnlockedInStoredCombinations)) {
        console.log("combinations.pop()", numSurveysUnlocked);
        this.combinations.pop();
      }

      if(this.combinations.length < this.maxStoredCombinations){
        var combination = {
          demographicsActive: _.map(this.demographicsActive(), "name"),
          surveysUnlocked: _.map(this.surveysUnlocked(), "id"),
          numSurveysUnlocked: numSurveysUnlocked
        }

        this.combinations.push(combination);
        this.combinations = _.sortBy(this.combinations, (combination) => { return -combination.numSurveysUnlocked });
      }
    },

    demographicsActive: function() {
      return _.select(this.demographics, (demographic) => { return demographic.active });
    },

    surveysUnlocked: function () {
      return _.select(this.surveys, (survey) => { return survey.unlocked });
    },

    renderDemographics: function (combination) {
      console.log("renderDemographics", combination.demographicsActive);

      return _.map(this.demographics, (demographic) => {
        return {
          name: demographic.name,
          active: _.contains(combination.demographicsActive, demographic.name)
        }
      });
    }
  }
})
