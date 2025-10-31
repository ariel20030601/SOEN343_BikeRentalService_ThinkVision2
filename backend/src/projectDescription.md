BikeShare System
Introduction
A bike-sharing system promotes low-cost mobility, exercise, and low-emission transportation by
making a variety of bikes and electric bikes (e-bikes) available to occasional riders. Although
simple to use, it comprises several components that are divided into modules: a dashboard, a
payment system, and a panel to view past rides

The BikeShare management system coordinates docks, bikes/e-bikes, riders, and operators
across a city. It exposes APIs and UIs to find, reserve, unlock, ride, and return bikes.
The operator dashboard represents stations on a map along with bike counts and actions
(rebalancing, returning, reserving). The BikeShare application provides a graphical way to
represent stations on a map, bike counts, and events (rides, rebalancing), while exercising core
software-design topics: modularity, interfaces (contracts), state & invariants, event-driven
architecture, permission, and fault handling.
Of course, we won’t have physical docks and bikes, but the model will allow executing the main
actions via its user interface.

Acronyms and Definitions
● Docking Station (Station): Location with N docks.
● Dock: Locking point for one bike.
○ States: empty | occupied | out_of_service
● Bike: Physical asset.
○ Types: standard | e-bike.
○ State: available | reserved | on_trip | maintenance.
● BMS: BikeShare Core/Management Service.
● Rebalancing: Moving bikes between stations using trucks.
● Reservation Hold: Short-term hold before unlock (e.g., 5 minutes).
Details of the system
Users and Profiles
We have three different user profiles:
● Rider (Registered): Can register, reserve/unlock/ride/return, view charges.
● Operator (Predefined): Can rebalance stations, mark bikes/stations out-of-service, and
view system messages.
● Guest User (non-registered user): Can view pricing/membership plans, station map, and
occupancy, access general information such as “About”, “How it works”, and related
information on the DASH.
● The operator and rider can also access everything a guest user can (not mandatory, but
implicit)
Mandatory modules
● LOGIN - Registration and Login management (user registration, role assignment,
login to the system).
● BMS – Core & Station Control (states, docking logic; identity/permissions).
● DASHBOARD – UI (map + tabs per module; event console; controls).
● PRC – Pricing & Billing (plans, fares, payments ledger).
● HIST – Ride history retrieval (logging, database, search by ID or name)
Interactions (Example Scenarios)
1. Happy Path Ride: Rider reserves at Station A, unlocks, rides, returns at Station B, bill
   computed, receipt sent.
2. Station Full: Return attempt at full station triggers overflow credit.
3. Reservation Expiry: Reservation hold time lapses; bike state changes to available;
   notification sent.
4. Rebalancing: Morning rush empties downtown stations → operator gets an alert and
   rebalances stations.
   System Modules
   Registration and Login Management
   Goal: Provide services for riders to log in to the system once registration is complete. Allow
   operators and riders to log in to the system.
   This module allows registration and login to the system. It provides the role of a user to the
   dashboard UI so that it can display the correct actions.
   It keeps track of the following user information:
   ● Full name
   ● Address
   ● Payment information
   ● Role
   ● Username
   ● Email
   Operators are pre-loaded to the database with their user information set. This can be done via a
   configuration file.
   Requirements:
   ● R-LOGIN-01 - A new user shall be able to register to the system.
   ● R-LOGIN-02 - Operator role needs to be predefined in the system. Users cannot select
   their own role.
   ● R-LOGIN-03 - Users shall be required to select a username and a password.
   ● R-LOGIN-04 - The username shall be unique.
   ● R-LOGIN-05 - Users shall be required to enter their address.
   ● R-LOGIN-06 - Riders shall be required to enter their payment information.
   ● R-LOGIN-07 - Users shall be required to enter a valid email address.
   BMS Core and Station Control
   Goal: Maintain correct station occupancy and bike states while providing simple commands to
   check out, return, move, and toggle station status.
   The BMS module is the authoritative core of the system. It maintains the state of stations,
   docks, and bikes, and ensures the rules of the system are respected.
   In particular, the BMS:
   ● Keeps track of station occupancy, ensuring bikes never exceed capacity and counts
   cannot go negative.
   ● Manages bike lifecycle (available, reserved, on trip, maintenance) and dock state
   (empty, occupied, out of service).
   ● Validates permissions (Rider vs. Operator) for actions initiated from the dashboard.
   ● Updates a simple read view that the dashboard uses to render the map, labels, and
   per-dock availability.
   ● Surfaces clear messages when an action cannot be completed (for example, checking
   out from an empty station or returning to a full station).
   From the user’s perspective, BMS behaviour is immediate and turn-based: after each action, the
   map and panels reflect the new state.
   Responsibilities
   ● Sanity checking: no negative bikes, no over-capacity, valid state transitions.
   ● Own the lifecycle of Bike (available | reserved | on_trip | maintenance)
   and Dock (empty | occupied | out_of_service).
   ● Emit domain events for the UI/read model and other modules (e.g., pricing).
   ● Load docks and bikes from a configuration file and display them on a map.
   Core Functionality
   ● Occupancy accounting: bikesAvailable == count(occupied docks);
   freeDocks == capacity − bikesAvailable.
   ● Checkout: choose an available bike at a station → transition to on_trip; decrement
   count.
   ● Return: place a bike into any free dock at a station → transition to available;
   increment count.
   ● Manual move: operator moves a bike from A→B (atomic decrement/increment).
   ● Station status: active | out_of_service (OOS blocks checkout/return).
   ● Reservation: soft hold with expiresAfterMinutes.
   Requirements:
   ● R-BMS-01 - BMS shall be able to load a configuration file, including docking station and
   bikes, and display the information on the map:
   ○ Docking station
   ■ Docking station name
   ■ Status (empty | occupied | full | out_of_service)
   ■ Lat/long position
   ■ Street address
   ■ Capacity (# of bikes)
   ■ Number of bikes docked
   ■ Bikes: List of bikes docked
   ■ Reservation hold time (expiresAfterMinutes)
   ○ Bike
   ■ Id
   ■ Status (available | reserved | on_trip | maintenance)
   ■ Type: (standard | e-bike)
   ■ Reservation expiry (date and time) if applicable, otherwise empty
   ● R-BMS-02 - BMS shall prevent undocking from an empty station and docking to a full
   station.
   ● R-BMS-03 - BMS shall enforce reservation expiry, based on expiresAfterMinutes.
   ● R-BMS-04 - BMS shall record all state transitions with the event ID.
   ● R-BMS-05 - BMS shall block bike returns, checkouts, and reservations for a dock that is
   out of service.
   ● R-BMS-06 - BMS shall make options available only in certain states:
   ○ Return bike: only available if a bike is reserved
   ○ Reserve bike: only available if no other bike is reserved (one bike can be
   reserved at a time)
   Events:
   ● R-BMS-06 - BMS shall emit an event when a bike’s status changes (returned, in
   maintenance, reserved, on trip).
   ● R-BMS-07 - BMS shall emit an event when a dock is full, empty, or out of service.
   ● R-BMS-08 - BMS shall emit an event when a trip has started and when a trip has ended.
   ● R-BMS-09 - BMS shall emit an event when a reservation expires (hold time before
   undocking).
   DASHBOARD - Main UI
   Goal: Present a city map with station markers and per-dock availability, and provide simple
   controls to check out, return, and manually move bikes.
   The Dashboard is the main user interface where riders and operators interact with the
   BikeShare system. It shows the current city state.
   More specifically, the dashboard contains the following elements:
   ● A tab bar for the modules (Dashboard with map, Pricing, Billing, Ride History).
   ● An information area showing:
   ○ the currently selected role (Rider or Operator) and username
   ○ the selected station name and quick stats (bikes, capacity, free docks)
   ○ a reset action to restore the initial scenario
   ● An output console that lists important system messages (e.g., successful
   checkouts/returns, validation errors).
   ● A Map view: a 2D city map with station markers. Each marker shows:
   ○ a color indicating station fullness (balanced/at-risk/empty-or-full)
   ○ an optional label “Name · bikes/capacity”
   ○ Clicking a marker opens a details panel with a per-dock grid (one square per
   dock; dark = occupied; “E” marks e-bikes) and quick actions.
   Requirements:
   ● DM-01 Display available actions depending on the role:
   ○ Operator only actions: move a bike from one station to another; mark a station or
   bike as out of service/maintenance; restore the initial system state.
   ○ Rider: check out a bike from a station; return a bike to a station; view a short trip
   summary.
   ● DM-02 Render all stations as markers positioned by lat/long within the current dataset
   bounds.
   ● DM-03 Station fullness shall be encoded with three levels: empty/full (red), almost full
   (yellow), balanced (green).
   ○ Thresholds: red at 0 or 100%;
   ○ yellow <25% or >85%;
   ○ else green.
   ● DM-04 Clicking on a docking station shall open a details panel which shall include:
   ○ A grid showing the docks and the following information:
   ■ Dock name
   ■ Address
   ■ Indication of the type of bike, for each docked bike (standard |
   e-bike)
   ■ Occupancy vs Capacity
   ○ Rider actions:
   ■ Reserve a bike, if a rider has no reserved bikes
   ■ Return a bike, if a bike is currently reserved
   ○ Operator actions:
   ■ Move a bike, which will allow selecting the destination station
   ■ Send a bike to maintenance, which will change the status of the bike
   ● DM-05 Checkout shall be disabled for a station if bikesAvailable==0 or station
   out_of_service.
   ● DM-06 Return shall trigger an event if the station has freeDocks==0 or is
   out_of_service. An error message will be displayed to the rider, indicating that it
5. should instead return to another nearby station.
   ● DM-07 Move a bike shall be disabled for operators if source has no bikes, destination
   has no free docks, or source==destination.
   ● DM-08 A legend shall be provided, explaining colors and e-bike marking.
   ● DM-09 Empty map shall be handled gracefully (show placeholder panel; no errors).
   PRC - Pricing and Billing
   Goal: The PRC module includes two separate functionalities: pricing and billing. Billing
   calculates trip cost using a small, transparent set of rules. Pricing is visible to all, while billing is
   only available for riders.
   Pricing provides:
   ● Details about available plans plan (e.g., base fee + per-minute rate, with an optional
   e-bike surcharge).
   Billing provides:
   ● A trip summary, including the computed cost.
   ● A lightweight ledger or list of past trips and charges for inspection.
   ● An interface to an external payment service.
   Requirements:
   ● R-PRC-01 - PRC shall display pricing options to all, with no need to login to the system.
   ● R-PRC-02 - PRC shall compute cost deterministically from plan rules and trip facts.
   ● R-PRC-03 - PRC shall provide a trip summary after a return.
   ● R-PRC-04 - PRC shall maintain a log of all trips and charges.
   ● R-PRC-05 - PRC shall provide billing history, including start date and time, bike id, origin
   station, arrival station, and a summary of charges.
   HIST - Ride History Retrieval
   Goal: Let users quickly find and review past rides using a simple search (by trip ID),
   lightweight storage, and a clear, drill-down view of trip details and charges.
   The Ride History module is a tab where riders and operators browse completed rides. It reads
   from the system’s datastore and updates immediately after trips end.
   More specifically, the Ride History tab contains the following elements:
   ● A search bar that accepts a Trip ID
   ● When a rider is logged in, only their own history is shown (by rider name)
   ● The ability to see past bills.
   A filter row with:
   ● Date range (start/end)
   ● Bike type (standard/e-bike)
   A results table showing, per ride:
   ● Trip ID, Rider, Start → End station
   ● Bike type and Cost
   ● Pagination or “Load more” for longer lists
   ● No results state with a hint to clear filters
   Requirements:
   ● R-RH-01 - The module shall accept a Trip ID in the search bar and show the matching
   ride or a clear “Not found” message.
   ● R-RH-02 - When a rider is logged in, the module shall show only that rider’s rides.
   Operators may view all rides.
   ● R-RH-03 - The module shall provide a filter row with:
   ○ Date range (start/end, inclusive). If only one bound is set, filter from/to that
   bound.
   ○ Bike type (standard/e-bike). Clearing filters shall restore the full (allowed) set.
   ● R-RH-04 - The results view shall display, per ride: Trip ID, Username, Start → End
   station, Bike type, Cost. Default sort shall be the most recent end time first.
   ● R-RH-05 - When no rides match, the module shall show a friendly error message to
   clear filters or check the Trip ID.
   ● R-RH-06 - Selecting a ride shall open a details view showing: Trip ID, Rider, Start/End
   stations and times, Duration (min), Bike type, and Cost breakdown (base, per-minute,
   e-bike surcharge), plus a short event timeline (checkout → return).
   ● R-RH-07 - The details view shall include the computed bill/charge exactly as priced by
   the system (read-only).
   ● R-RH-08 - A ride shall appear in the list as soon as it ends (after the system records
   the trip).
   ● R-RH-09 - The module shall validate Trip ID format and date ranges and display concise
   error messages (e.g., “End date is before start date”)