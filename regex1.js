// https://html.spec.whatwg.org/multipage/input.html#email-state-(type=email)
function isValidEmail(email) {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
}

console.log(isValidEmail("....binh.nguyen@journeyh.io"))
console.log(isValidEmail("binh .nguyen@journeyh.ffeo"))
console.log(isValidEmail("binh.nguyen@journeyh.ffeo"))