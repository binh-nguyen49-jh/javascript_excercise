function isValidPassword(password) {
  const passRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!.,%*#?&])[A-Za-z\d@$!.,%*#?&]{8,}$/;
  return passRegex.test(password);
}

console.assert(isValidPassword("binh.Nguyen@journ3yh.io") === true)
console.assert(isValidPassword("binh.nguyen@journeyh.ffeo") === false)