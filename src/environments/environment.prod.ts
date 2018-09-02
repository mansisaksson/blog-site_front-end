export const environment = {
  production: true,
  backendAddr: 'http://mansisaksson.com:3000',
  userNameRegex: '^[A-Za-z0-9_-]{4,15}$',
  userPasswordRegex: '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$'
}

/*
  At least one upper case English letter, (?=.*?[A-Z])
  At least one lower case English letter, (?=.*?[a-z])
  At least one digit, (?=.*?[0-9])
  Minimum eight in length .{8,} (with the anchors)
*/