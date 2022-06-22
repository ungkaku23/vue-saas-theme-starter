//Method To Check If Value is Null Or Empty
function isEmpty(value) {
  return !value || !value.trim();
}
// Method Take Word and Capitalize It
function capitalize(word) {
  return word.charAt(0).toUpperCase();
}
module.exports.isEmpty = isEmpty;
module.exports.capitalize = capitalize;
