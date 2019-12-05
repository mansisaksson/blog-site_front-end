// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  backendAddr: 'http://story-site-backend.mansisaksson.com:3000',
  //backendAddr: 'http://localhost:3000',
  userNameRegex: '^[A-Za-z0-9_-]{4,15}$',
  userPasswordRegex: '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$'
}
