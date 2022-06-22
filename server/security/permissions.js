const ROLE = require("../security/roles");

function refineView(requester, resources) {
  if (requester.role === ROLE.ADMIN || requester.role === ROLE.OWNER)
    return resources;
  return resources.filter((resource) => resource.id === requester.id);
}

function canView(requester, resource) {
  return (
    requester.role === ROLE.ADMIN ||
    requester.role === ROLE.OWNER ||
    resource.id === requester.id
  );
}

function canUpdate(requester, resource) {
  if (resource.role === ROLE.OWNER) {
    return false;
  }
  return requester.role === ROLE.ADMIN || requester.role === ROLE.OWNER;
}

function canDelete(requester, resource) {
  console.log("REQUESTER-ID:", requester.id, "REQUEST-ID:", resource.id);
  return requester.role === ROLE.OWNER;
}

function updateOwn(requester, resource) {
  return resource.id === requester.id;
}
function deleteOwn(requester, resource) {
  return resource.id === requester.id;
}
module.exports = {
  canView,
  refineView,
  canUpdate,
  canDelete,
  updateOwn,
  deleteOwn,
};
