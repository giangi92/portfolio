export type iconName = "user" | "studies" | "experience" | "book" | "contacts";

export const getIconByName = (name: iconName) => {
  switch (name) {
    case "user":
      return "bi bi-person-circle";
    case "studies":
      return "bi bi-mortarboard-fill";
    case "book":
      return "bi bi-book-half";
    case "experience":
      return "bi bi-briefcase-fill";
    case "contacts":
      return "bi bi-telephone-fill";
  }
};
