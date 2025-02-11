# Peekaboo
## Structure Générale
```mermaid
sequenceDiagram
participant  Web  Interface  Admin
participant  IoT
participant  Backend
participant  FrontEnd (Mobile)

Backend->>+FrontEnd (Mobile): GPS
FrontEnd (Mobile)->>+Backend: Action "Perte de l'Oiseau"
IoT->>+Backend: GPS
Web  Interface  Admin->>+Backend: Accès Gestion
```

## Modélisation des données

```mermaid
classDiagram
    class User {
        +int id
        +string email
        +string password
        +array roles
        +getId(): int
        +getEmail(): string
        +setEmail(email: string): self
        +getPassword(): string
        +setPassword(password: string): self
        +getRoles(): array
        +setRoles(roles: array): self
    }

    class Bird {
        +int id
        +string name
        +string gpsId
        +getId(): int
        +getName(): string
        +setName(name: string): self
        +getGpsId(): string
        +setGpsId(gpsId: string): self
        +getOwner(): User
        +setOwner(owner: User): self
    }

    class LocationHistory {
        +int id
        +float latitude
        +float longitude
        +DateTime timestamp
        +getId(): int
        +getLatitude(): float
        +setLatitude(latitude: float): self
        +getLongitude(): float
        +setLongitude(longitude: float): self
        +getTimestamp(): DateTime
        +setTimestamp(timestamp: DateTime): self
        +getBird(): Bird
        +setBird(bird: Bird): self
    }

    User "1" -- "0..*" Bird : owns
    Bird "1" -- "0..*" LocationHistory : has

```
## Fonctions Principales

### Création du profil et Suivi de l'oiseau GPS

```mermaid
sequenceDiagram
participant  Web  Interface  Pro
participant  IoT
participant  Backend
participant  FrontEnd (Mobile)


Web  Interface  Pro->>+Backend: Vétérinaire inscris l'oiseau
Backend-->>Backend: Création de la bague, QR Code et Compte
FrontEnd (Mobile)->>+Backend: Activation de la bague par le propriétaire de l'oiseau
Backend-->>IoT: Activation de la bague par le propriétaire de l'oiseau
IoT->>+Backend: GPS
Backend-->>FrontEnd (Mobile): GPS
```

### Perte de l'Oiseau
```mermaid
sequenceDiagram
participant  Web  Interface  Pro
participant  FrontEnd (Mobile)
participant  Backend
participant  IoT
participant  User Lambda

FrontEnd (Mobile)->>+Backend: Action "Perte de l'Oiseau"
Backend-->>FrontEnd (Mobile): GPS
IoT-->>Backend: GPS
User Lambda->>+IoT: Scan du Flashcode
IoT-->>User Lambda: Infos / Coordonées Véténinaire Oiseau
IoT-->>FrontEnd (Mobile): Notifcation de scan du QR Code ??
Web  Interface  Pro->>+Backend: Accède au Profil du propriétaire de l'oiseau
Backend-->>FrontEnd (Mobile): Avertie le propriétaire de l'oiseau
```
Le Vétérinaire appelle l'utilisateur ou notifiaction sur le QR Code lors du SCan par l'User Lambda.
L' utlisateur va récupérer son oiseau.



