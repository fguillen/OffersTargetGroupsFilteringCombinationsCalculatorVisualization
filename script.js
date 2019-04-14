const version = "0.0.1";
console.log("Loading APP version", version);

var app = new Vue({
  el: "#app",
  data: {
    demographicsUrl: "demographics_small.json",
    surveysUrl: "surveys.json",
    maxTopCombinations: 40,
    demographics: [],
    surveys: [],
    topCombinations: [],
    numCombinationsDone: 0
  },
  created: function() {
    console.log("create");

    this.loadSurveys();
    this.loadDemographics();
  },
  computed: {
    progress: function() {
      return Math.round((this.numCombinationsDone / this.numCombinations) * 100);
    },
    topCombinationsLength: function() {
      return this.topCombinations.length;
    },
    numCombinations: function() {
      var binaryMatrix = _.map(this.demographics, () => "1").join("");
      var maxNumberOfCombinations = parseInt(binaryMatrix, 2) + 1

      return maxNumberOfCombinations;
    },
    minTopCombinations: function() {
      return _.min(_.map(this.topCombinations, "numSurveysUnlocked"));
    },
  },
  methods: {
    loadDemographics: function() {
      console.log("loadDemographics");

      var _self = this;
      $.getJSON(this.demographicsUrl, function (json) {
        json.forEach((demographicName) => {
          _self.demographics.push({
            name: demographicName,
            active: false,
            numSurveysContainingThisDemographic: 0
          })
        });
      });
    },


    loadSurveys: function() {
      console.log("loadSurveys");

      var _self = this;
      $.getJSON(this.surveysUrl, function (json) {
        json.forEach((survey) => {
          var demographics = survey.qualifications_supported.split(",").concat(survey.qualifications_no_supported.split(","));
          demographics = _.filter(demographics, demographic => (demographic.length > 0));

          _self.surveys.push({
            id: survey.id,
            title: survey.title,
            demographics: demographics,
            unlocked: false
          })
        });

        _self.calculateNumSurveysContainingInDemographics();
      });
    },

    start: function() {
      console.log("start");

      this.resetState();

      var _self = this;

      _.times(1, function() {
        for (var i = 0; i < _self.numCombinations; i++) {
          setTimeout((i) => { _self.calculateCombination(i) }, 0, i);
        }
      });

    },

    toggleDemographic: function(demographic) {
      console.log("toggleDemographic", demographic);
      demographic.active = !demographic.active;
      this.calculate();
    },

    calculateCombination: function(index) {
      var binaryMatrix = index.toString(2);
      binaryMatrix = binaryMatrix.padStart(this.demographics.length, "0");

      this.setDemographicStates(binaryMatrix);
      this.calculate();
      this.storeCombination();

      this.numCombinationsDone++;
    },

    resetState: function() {
      this.surveys.forEach(survey => survey.unlocked);
      this.numCombinationsDone = 0;
      this.topCombinations = [];
    },

    setDemographicStates(binaryMatrix){
      for (var i = 0; i < binaryMatrix.length; i++) {
        var value = binaryMatrix[i] == "1";
        this.demographics[i].active = value;
      }
    },

    activateCombination: function(combination) {
      console.log("activateCombination", combination);

      this.demographics = combination.demographics;
      this.calculate();
    },

    calculate: function() {
      this.surveys.forEach((survey) => {
        this.calculateSurvey(survey);
      });
    },

    calculateSurvey: function(survey) {
      var demographicsActive = _.filter(this.demographics, demographic => demographic.active);
      var demographicsActiveNames = _.map(demographicsActive, demographic => demographic.name);
      var survey_unlocked = _.difference(survey.demographics, demographicsActiveNames).length == 0;

      survey.unlocked = survey_unlocked;
    },

    storeCombination: function() {
      var numSurveysUnlocked = this.surveysUnlocked().length;
      var numDemographicsActive = this.demographicsActive().length;

      if((this.topCombinations.length >= this.maxTopCombinations) && (numSurveysUnlocked > this.minTopCombinations)) {
        this.topCombinations.pop();
      }

      if(this.topCombinations.length < this.maxTopCombinations){
        var combination = {
          demographics: this.duplicateDemographics(),
          numDemographicsActive: numDemographicsActive,
          numSurveysUnlocked: numSurveysUnlocked
        }

        this.topCombinations.push(combination);
        this.topCombinations = _.sortBy(this.topCombinations, combination => -combination.numSurveysUnlocked);
      }
    },

    // Not _.clone neither _.extend was working for me
    duplicateDemographics: function() {
      return _.map(this.demographics, (demographic) => {
        return {
          name: demographic.name,
          active: demographic.active
        }
      });
    },

    demographicsActive: function() {
      return _.select(this.demographics, demographic => demographic.active);
    },

    surveysUnlocked: function() {
      return _.select(this.surveys, survey => survey.unlocked);
    },

    calculateNumSurveysContainingInDemographics: function() {
      console.log("calculateNumSurveysContainingInDemographics");

      this.demographics.forEach((demographic) => {
        demographic.numSurveysContainingThisDemographic = this.calculateNumSurveysContainingThisDemographic(demographic);
      });
    },

    calculateNumSurveysContainingThisDemographic: function(demographic) {
      console.log("calculateNumSurveysContainingThisDemographic", demographic.name);

      var surveysCount =
        _.select(this.surveys, (survey) => {
          return _.include(survey.demographics, demographic.name);
        }).length;

      return surveysCount;
    }
  }
})
