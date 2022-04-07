function isValidEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,3}$/;
  return emailRegex.test(email);
}

console.assert(isValidEmail("binh.nguyen@journeyh.io") === true)
console.assert(isValidEmail("binh.nguyen@journeyh.ffeo") === false)