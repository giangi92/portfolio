/**
 * English is the reference language: its shape defines the `Messages` type, and it is the
 * template users download to create a new translation from the dashboard.
 *
 * Every value is plain text so a catalog can be stored as JSON:
 * - `{name}` is a placeholder filled at runtime (see `format`);
 * - `**text**` is rendered in bold where the UI supports it (see `RichText`).
 */
export const en = {
  languageName: "English",
  language: "Language",

  /** Public portfolio site. */
  site: {
    aboutMe: "About Me",
    education: "Education",
    experience: "Experience",
    expertise: "Expertise",
    contacts: "Contacts",
    activities: "Activities",
    technologies: "Technologies and tools",
    loadError: "There was an error while retrieving the data",
    openMenu: "Open menu",
    profilePhoto: "Profile photo",
    switchToDark: "Switch to dark mode",
    switchToLight: "Switch to light mode",
  },

  common: {
    retry: "Retry",
    save: "Save",
    saving: "Saving…",
    saved: "Saved",
    cancel: "Discard",
    unsavedChanges: "Unsaved changes",
    loadFailed: "Could not load the data: {error}",
    showPassword: "Show password",
    hidePassword: "Hide password",
    passwordsDontMatch: "The passwords don't match",
  },

  auth: {
    setupTitle: "First access",
    setupIntro:
      "Choose the panel password. It can be set **only once**: it is stored only as an Argon2id/bcrypt hash, never in plain text.",
    newPassword: "New password",
    confirmPassword: "Confirm password",
    minLengthHint: "At least {min} characters. Use a passphrase.",
    minLength: "At least {min} characters",
    setPassword: "Set password",
    loginTitle: "Administrator login",
    password: "Password",
    login: "Log in",
    backToPortfolio: "Back to the portfolio",
  },

  nav: {
    brand: "Dashboard",
    profile: "Profile",
    about: "About Me",
    education: "Education",
    experience: "Experience",
    expertise: "Expertise",
    contacts: "Contacts",
    theme: "Theme & style",
    languages: "Languages",
    security: "Security",
    viewSite: "View site",
    logout: "Log out",
  },

  profile: {
    description: "Name, role and photo shown in the sidebar.",
    photoAlt: "Profile photo",
    uploading: "Uploading…",
    upload: "Upload new photo",
    uploadHint: "JPG, PNG or WEBP, max 5 MB. A square image works best.",
    uploaded: "Image updated",
    name: "First name",
    surname: "Last name",
    jobtitle: "Role",
  },

  content: {
    language: "Content language",
    editing: "You are editing the {language} version. Visitors who choose a language without its own version see the English text.",
    notTranslated:
      "Not translated into {language} yet: the English text is shown as a starting point. Save to create the translation.",
    deleteTranslation: "Delete {language} version",
    confirmDeleteTranslation:
      "Delete the {language} version of this section? Visitors will see the English text.",
    discardChanges: "You have unsaved changes. Discard them?",
    sharedFields: "Name, surname and photo are the same in every language: edit them in English.",
  },

  text: {
    label: "Text",
    hint: "Line breaks are kept on the site.",
  },

  list: {
    intro: "The order here is the order in which they appear on the site.",
    requiredMissing: "Fill in the required fields.",
    empty: "No items.",
    moveUp: "Move up",
    moveDown: "Move down",
    remove: "Delete",
    timePeriod: "Period",
    itemDescription: "Description",
  },

  education: {
    add: "Add education",
    newItem: "New education entry",
    confirmDelete: "Delete this education entry?",
  },

  experience: {
    add: "Add experience",
    newItem: "New experience",
    confirmDelete: "Delete this experience?",
    title: "Role / Company",
    activities: "Activities (optional)",
    technologies: "Technologies and tools (optional)",
  },

  theme: {
    description: "Colors, fonts and photo shape. The preview updates as you edit.",
    presets: "Ready-made themes",
    presetNames: {
      classic: "Classic",
      night: "Night",
      ocean: "Ocean",
      elegant: "Elegant",
    },
    colors: "Colors",
    colorLabels: {
      sidebarBackground: "Sidebar background",
      sidebarText: "Sidebar text",
      accent: "Accent color (menu links)",
      background: "Content background",
      text: "Content text",
      title: "Titles and icons",
    },
    palette: "Palette",
    paletteHint: "The site has a light and a dark version: choose which palette you are editing.",
    style: "Style",
    mode: "Default appearance",
    modeHint: "Visitors can switch between light and dark with the button at the top right of the site.",
    light: "Light",
    dark: "Dark",
    bodyFont: "Body font",
    headingFont: "Heading font",
    fontSize: "Text size",
    imageShape: "Photo shape",
    shapes: {
      square: "Square",
      rounded: "Rounded",
      circle: "Circle",
    },
    preview: "Preview",
  },

  languages: {
    description:
      "Add or update the dashboard translations by uploading a JSON file. Start from the English template: translate the values and keep the keys, the placeholders in braces (like {min}) and the ** bold markers unchanged.",
    downloadTemplate: "Download English template",
    installed: "Available languages",
    colLanguage: "Language",
    colCode: "Code",
    colCompleteness: "Translated",
    colSource: "Source",
    sourceBuiltIn: "Built-in",
    sourceUploaded: "Uploaded",
    sourceCustomized: "Built-in, customized",
    download: "Download",
    remove: "Remove",
    confirmRemove: "Remove the uploaded translation \"{name}\"?",
    loadFailed: "Could not load the uploaded translations: {error}",
    uploadTitle: "Upload a translation",
    file: "JSON file",
    code: "Language code",
    codeHint:
      "ISO code, e.g. fr, de, pt-BR. Using the code of an existing language replaces its texts.",
    invalidJson: "The file is not valid JSON.",
    notAnObject: "The file must contain a JSON object with the same structure as the template.",
    tooLarge: "The file is too large (max {max} KB).",
    invalidCode: "Invalid language code.",
    missingName: "Set \"languageName\" in the file (e.g. \"Français\").",
    nonString: "These keys must contain text: {keys}",
    summary: "{translated} of {total} texts translated.",
    missingKeys: "{count} missing texts will be shown in English.",
    unknownKeys: "{count} unknown keys will be ignored: {keys}",
    placeholderMismatch: "Check the placeholders in: {keys}",
    replaceWarning: "A translation with code \"{code}\" already exists and will be replaced.",
    submit: "Save translation",
    saved: "Translation saved",
  },

  security: {
    description:
      "The password is stored only as a hash (Argon2id, or bcrypt if the server doesn't support it). Changing it requires the current one.",
    current: "Current password",
    new: "New password",
    confirm: "Confirm new password",
    tooShort: "The new password must be at least {min} characters long",
    updated: "Password updated",
    submit: "Change password",
  },

  /** Keyed by the `code` returned by the API; placeholders are the API `params`. */
  errors: {
    unreachable: "Error {status}: API not reachable",
    passwordMissing: "Missing password",
    passwordTooShort: "The password must be at least {min} characters long",
    passwordTooLong: "Password too long",
    sessionExpired: "Session expired, please log in again",
    csrfInvalid: "Invalid security token, reload the page",
    tooManyAttempts: "Too many attempts. Try again in {minutes} min.",
    passwordNotSet: "Password not set yet",
    wrongPassword: "Wrong password",
    passwordAlreadySet: "The password has already been set",
    fieldMissing: "Missing field: {field}",
    fieldInvalid: "Invalid value: {field}",
    fieldTooLong: "Field too long: {field}",
    tooManyItems: "Too many items: {field}",
    colorInvalid: "Invalid color: {field}",
    languageCodeInvalid: "Invalid language code: {code}",
    fontSizeInvalid: "Invalid font size (12-22)",
    documentNotEditable: "This document can't be edited",
    contentInvalid: "Invalid content",
    badRequest: "Invalid request",
    imageMissing: "No image received",
    imageTooLarge: "Image too large (max 5 MB)",
    imageFormat: "Unsupported format: use JPG, PNG or WEBP",
    imageSaveFailed: "Saving the image failed",
  },
};

export type Messages = typeof en;
