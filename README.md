# FastFeet Domain

An API for controlling orders from a fictitious carrier, FastFeet.

## Domain

- User Context
  - admin
  - courier

## Subdomains

### Delivery (Core)

- Entities
  - Courier
  - Order
  - Recipient

- Use Cases
  - [x] It must be possible to perform CRUD operations for couriers
    - [x] It must be possible to create a new courier
    - [x] It must be possible to update an existing courier
    - [x] It must be possible to delete an existing courier
  - [x] It must be possible to perform CRUD operations for orders
    - [x] It must be possible to create a new order
    - [x] It must be possible to update an existing order
    - [x] It must be possible to delete an existing order
  - [x] It must be possible to perform CRUD operations for recipient
    - [x] It must be possible to create a new recipient
    - [x] It must be possible to update an existing recipient
    - [x] It must be possible to delete an existing recipient
  
  - [x] It must be possible to mark an order as "waiting" (Available for pickup).
  - [x] It must be possible to pick up an order.
  - [x] It must be possible to mark an order as delivered.
  - [x] It must be possible to mark an order as returned.
  - [x] It must be possible to list orders with delivery addresses near the courier's location.

- Business Rules
 - [x] To mark an order as delivered, a photo must be provided.
 - [x] Only the courier who picked up the order can mark it as delivered.
 - [x] A courier must not be able to list another courier's orders.

### User

- Entities
  - User

- Use Cases
  - [x] It must be possible to log in using CPF and password.
  - [x] It must be possible to change a user's password.
  - [x] It must be possible to list a user's deliveries.

- Business Rules
  - [x] The application must have two types of users: courier and/or admin. 
  - [x] Only **admin** users can perform CRUD operations for orders. 
  - [x] Only **admin** users can perform CRUD operations for couriers. 
  - [x] Only **admin** users can perform CRUD operations for recipients.
  - [x] Only the admin can change a user's password.

### Notification

- Entities
  - Notification

- Use Cases
  - [x] It must be possible to notify the recipient whenever the order's status changes.


