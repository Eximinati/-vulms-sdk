export const ASPNET_SELECTORS = {
  VIEWSTATE: 'input#__VIEWSTATE',
  EVENTVALIDATION: 'input#__EVENTVALIDATION',
  VIEWSTATEGENERATOR: 'input#__VIEWSTATEGENERATOR',
  PREVIOUSPAGE: 'input#__PREVIOUSPAGE',
} as const;

export const ROOT_FORM_SELECTORS = {
  VIEWSTATE: 'input[name="__VIEWSTATE"]',
  VIEWSTATEGENERATOR: 'input[name="__VIEWSTATEGENERATOR"]',
  EVENTVALIDATION: 'input[name="__EVENTVALIDATION"]',
  RECAPTCHA_RESPONSE: 'input[name="g-recaptcha-response"]',
} as const;
