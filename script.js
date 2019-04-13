const version = "0.0.1";
console.log("Loading APP version", version);

var app = new Vue({
  el: '#app',
  data: {
    demographics: [],
    surveys: [
      { title: 'Survey 1', demographics: ["gender", "city_rural"], unlocked: false },
      { title: 'Survey 2', demographics: ["gender", "city_rural"], unlocked: false },
      { title: 'Survey 3', demographics: ["gender", "smoke"], unlocked: false },
      { title: 'Survey 4', demographics: ["gender", "age", "happy"], unlocked: false },
      { title: 'Survey 1', demographics: ["gender", "city_rural"], unlocked: false }
    ],
    combinations: []
  },
  created: function() {
    console.log("create");

    var _self = this;
    $.getJSON('./demographics_small.json', function (json) {
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
    }
  },
  methods: {
    start: function() {
      console.log("start");

      this.resetSurveyStates();

      // setInterval(this.calculate, 1);

      var _self = this;
      // iterate over all the combinations
      _.times(1, function() {
        for (var i = 0; i <= _self.maxNumberOfCombinations(); i++) {
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
      // this.storeCombination();
    },

    resetSurveyStates: function() {
      this.surveys.forEach((survey) => {
        survey.unlocked = false;
      })
    },
    // Calculating the num of binary combinations using binary numbers
    maxNumberOfCombinations: function(){
      console.log("maxNumberOfCombinations");
      var binaryMatrix = _.map(this.demographics, function() { return "1" }).join("");
      var binaryMatrixToDecimal = parseInt(binaryMatrix, 2)

      console.log("maxNumberOfCombinations", binaryMatrixToDecimal);

      return binaryMatrixToDecimal
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
      var combination = {
        demographicsActive: _.clone(this.demographicsActive()),
        surveysUnlocked: _.clone(this.surveysUnlocked())
      }

      this.combinations.unshift(combination);
    },

    demographicsActive: function() {
      return _.select(this.demographics, (demographic) => { return demographic.active });
    },

    surveysUnlocked: function () {
      return _.select(this.surveys, (survey) => { return survey.unlocked });
    }
  }
})
