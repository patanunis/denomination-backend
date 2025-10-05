let empCounter = 1;
let admCounter = 1;

function generateEmployeeID(role) {
  if (role === 'Employee') {
    return `EMP00${empCounter++}`;
  } else {
    return `ADM00${admCounter++}`;
  }
}

module.exports = generateEmployeeID;
