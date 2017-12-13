define(
  []
, function() {

    function isValidNumber(num) {
      return (/^[+]?([0-9]+(?:[\.][0-9]*)?|\.[0-9]+)$/).test(num)
    }

    return {
      isValidNumber: isValidNumber
    }
  }
)