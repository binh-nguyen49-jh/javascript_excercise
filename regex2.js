function isValidPassword(password) {
  const passRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!.,%*#?&])[A-Za-z\d@$!.,%*#?&]{8,}$/;
  return passRegex.test(password);
}

console.log(isValidPassword("binh.Nguyen@journ3yh.io"))
console.log(isValidPassword("binh.nguyen@journeyh.ffeo"))