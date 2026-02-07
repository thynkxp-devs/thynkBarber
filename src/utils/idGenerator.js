function pad4(n) {
  return String(n).padStart(4, "0");
}

function makePlanCode(seq) {
  return `PLN-${pad4(seq)}`;
}

function makeRoleKey(seq) {
  return `ROLE_PLN_${pad4(seq)}`;
}

module.exports = { pad4, makePlanCode, makeRoleKey };
