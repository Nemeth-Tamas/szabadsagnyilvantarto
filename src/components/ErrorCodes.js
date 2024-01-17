const ErrorCodes = {
    UnknownError: "This is an unknown error. Please try again later.",
    RequestNotSent: "Nem sikerült elküldeni a kérelmét. Kérjük próbálja újra később.",
    NotEnoughLeaves: "Nem sikerült elküldeni a kérelmét. Nincs elég szabadsága.",
    ServerError: "A szerver nem válaszolt. Kérjük próbálja újra később.",
    ServerErrorFailedToLoadMessages: "A szerver nem válaszolt. Nem sikerült betölteni az üzeneteket.",
    ServerErrorFailedToLoadRequests: "A szerver nem válaszolt. Nem sikerült betölteni a kérelmeket.",
    FailedToLoadUser: "Nem sikerült betölteni a felhasználót.",
    FailedToLoadUsers: "Nem sikerült betölteni a felhasználókat.",
    FailedToLoadSzabadsag: "Nem sikerült betölteni a szabadságokat.",
    UnableToCreateReport: "Nem sikerült létrehozni a jelentést.",
    ErrorWhileDeletingUser: "Hiba történt a felhasználó törlése közben.",
    ErrorWhileDeletingSinglePlan: "Hiba történt a felhasználó szabadság terve törlése közben.",
    ErrorWhileDeletingAllPlans: "Hiba történt a felhasználók szabadság tervei törlése közben.",
    UserRoleEmpty: "A felhasználói szerepkör nem lehet üres.",
    UserManagerEmpty: "A felhasználói felettese nem lehet üres.",
    PasswordsNotMatch: "A két jelszó nem egyezik.",
    EmailDomainDoesNotMatch: "Az felhasználó azonosítója nem egyezik a sajáttal.",
    EmptyField: "Nem lehetnek üres mezők.",
    UsernameOrPasswordTooShort: "A felhasználónév és a jelszó legalább 6 karakter hosszúnak kell lennie.",
    UsernameDoesNotContainAt: "A felhasználónévnek tartalmaznia kell egy @ jelet.",
    FailedToRegisterUser: "Nem sikerült regisztrálni a felhasználót. Kérjük próbálja újra később.",
    FailedToEncryptPassword: "Nem sikerült titkosítani a jelszót. Kérjük próbálja újra később.",
    FailedToSendMessage: "Nem sikerült elküldeni az üzenetet. Kérjük próbálja újra később.",
    AlreadyOnLeave: "A kijelölt időszakban már szabadságon van.",
    FailedToSavePlan: "Hiba történt a szabadság tervezet elküldése közben.",
    PlanContainsToManyDays: "Nem lehet menteni a tervezetet, mert túl sok napot tartalmaz.",
    PlanContainsToFewDays: "Nem lehet menteni a tervezetet, mert túl kevés napot tartalmaz.",
    PlanMaxNotSet: "Az évi szabadság nem került még feltöltésre. Próbálkozz később.",
}

export default ErrorCodes;