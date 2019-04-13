const version = "0.0.1";
console.log("Loading APP version", version);

var app = new Vue({
  el: '#app',
  data: {
    demographics: [
      { name: 'gender', active: false },
      { name: 'age', active: false },
      // { name: 'city_rural', active: false },
      // { name: 'smoke', active: false }
    ],
    surveys: [
      { title: 'Survey 1', demographics_needed: ["gender", "city_rural"], unlocked: false },
      { title: 'Survey 2', demographics_needed: ["gender", "city_rural"], unlocked: false },
      { title: 'Survey 3', demographics_needed: ["gender", "smoke"], unlocked: false },
      { title: 'Survey 4', demographics_needed: ["gender", "age"], unlocked: false },
    ]
  },
  methods: {
    start: function() {
      console.log("start");

      this.step(this.demographics);
    },

    calculate: function() {
      var states = _.map(this.demographics, function(e){ return e.active } );
      console.log("calculate", states);
    },

    step: function(demographics) {
      console.log("step", demographics.length);
      console.log("step", _.map(demographics, function(e){ return e.name } ));

      var self = this;

      _.each(demographics, function(demographic) {
        _demographics = demographics.filter(function(e){ return e != demographic });

        self.calculate();
        demographic.active = true;
        self.calculate();

        demographic.active = false;
        self.step(_demographics);
      });
    }
  }
})
