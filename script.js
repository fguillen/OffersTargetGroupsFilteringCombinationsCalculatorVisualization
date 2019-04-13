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

      // iterate over all the combinations
      for (var i = 0; i <= this.max_number_of_combinations(); i++) {
        var binary_matrix = i.toString(2);
        binary_matrix = binary_matrix.padStart(this.demographics.length, "0");
        this.set_demographic_states(binary_matrix);
        this.calculate()
      }

    },
    // Calculating the num of binary combinations using binary numbers
    max_number_of_combinations: function(){
      var binary_matrix = _.map(this.demographics, function() { return "1" }).join("");
      var binary_matrix_to_decimal = parseInt(binary_matrix, 2)

      return binary_matrix_to_decimal
    },

    set_demographic_states(binary_matrix){
      for (var i = 0; i < binary_matrix.length; i++) {
        var value = binary_matrix[i] == "1";
        this.demographics[i].active = value;
      }
    },

    calculate: function() {
      var states = _.map(this.demographics, function(e){ return e.active } );
      console.log("calculate", states);
    }
  }
})
