
# 📘 Architecture et Modélisation des Données de Peekaboo

## 1. Relations clés

- **User ↔ Bird** : Un utilisateur peut posséder plusieurs oiseaux.
- **Bird ↔ LocationHistory** : Chaque oiseau peut avoir plusieurs points de localisation.
- **LocationHistory** : Historique des mouvements GPS, enrichi avec date/heure et coordonnées.

> Cette modélisation reflète une structure simple et extensible pour le suivi et la gestion des oiseaux.


## 2. Diagramme des classes - Structure des entités principales

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

