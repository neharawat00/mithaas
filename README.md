# Mithaas Digital Hearth

MASTER PROMPT — BUILD A NEXT-GENERATION RESTAURANT WEBSITE FOR “MITHAAS”

Build a fully functional, production-quality, high-end restaurant website and digital ordering platform for a restaurant brand named:

MITHAAS

Tagline:

“Where Every Bite Feels Like Home.”

The website should be significantly more advanced than a traditional restaurant website.

Do NOT create a simple static restaurant landing page.

Build a complete digital restaurant ecosystem including:

Restaurant website

Online food ordering

Table reservations

Digital menu

Food customization

Cart and checkout

Online payments

Live order tracking

Customer accounts

Loyalty/rewards

Offers and coupons

AI food recommendation assistant

Restaurant admin dashboard

Kitchen order management

Delivery/order management

Reviews and ratings

Analytics

Fully responsive mobile experience

The final product should feel like a premium modern restaurant technology platform, suitable for a real restaurant business.

1. BRAND IDENTITY

Brand:

MITHAAS

Positioning:

A premium Indian restaurant and sweets/food brand combining:

Traditional Indian Taste + Modern Dining Experience + Technology

Suggested tagline:

“Where Every Bite Feels Like Home.”

Alternative supporting line:

“Authentic Flavours. Modern Experience.”

Create a sophisticated Indian-inspired visual identity.

Do NOT copy the exact design, branding, logo, content, images, or UI of any existing restaurant.

Create a completely original design.

2. DESIGN DIRECTION

The website should look:

Premium

Elegant

Modern

Warm

Indian-inspired

High-tech

Luxurious

App-like

Visually immersive

Combine:

Luxury restaurant design + modern SaaS UI + Indian heritage aesthetics

Use:

Elegant typography

Premium food photography

Subtle gradients

Glassmorphism where appropriate

Soft shadows

Rounded cards

Beautiful spacing

Micro-interactions

Smooth animations

Interactive food cards

Premium navigation

Cinematic hero section

Avoid making the website look overly traditional or outdated.

The design should appeal to:

Families

Young professionals

Students

Couples

Food lovers

Corporate customers

Tourists

3. RESPONSIVE DESIGN — EXTREMELY IMPORTANT

The website MUST work perfectly on:

Mobile

Small mobile

Large mobile

Tablet

Laptop

Desktop

Large monitors

Touchscreen devices

Minimum width:

320px

Maximum supported width:

2560px+

There must be:

No horizontal scrolling

No overlapping components

No broken grids

No clipped text

No overflowing buttons

No unusable forms

Desktop and mobile should feel intentionally designed rather than simply scaled down.

4. TECHNOLOGY STACK

Use:

Frontend

React

Vite

TypeScript

Tailwind CSS

shadcn/ui

Framer Motion

Lucide React

Backend

Supabase

Database

PostgreSQL

Authentication

Supabase Auth

Storage

Supabase Storage

Charts

Recharts

Use clean reusable components and scalable architecture.

5. HOME PAGE

Create a visually stunning homepage.

Hero section:

Use a cinematic high-quality food/restaurant visual.

Headline:

“A Taste Worth Coming Back For.”

Subheading:

“Discover authentic flavours, handcrafted with passion and served with a modern touch.”

Primary buttons:

Order Now

Reserve a Table

Secondary:

Explore Menu

6. SMART BOOKING / ORDER WIDGET

Place a prominent interactive widget below the hero.

Options:

🍽️ Dine In

🥡 Takeaway

🛵 Delivery

Users can quickly choose:

Location

Date

Time

Number of guests

or:

Delivery address

Delivery time

7. NAVIGATION

Desktop navigation:

MITHAAS logo

Home
Menu
Order Online
Reservations
Our Story
Offers
Gallery
Contact

Right side:

🔍 Search

🎁 Rewards

🛒 Cart

👤 Account

Primary CTA:

Order Now

Make navigation sticky.

Add subtle animation when scrolling.

8. MOBILE NAVIGATION

Create a premium mobile experience.

Bottom navigation:

🏠 Home
🍽️ Menu
🛒 Cart
📦 Orders
👤 Profile

Include floating:

Order Now

button when appropriate.

9. MENU PAGE

Create:

/menu

This should be one of the most important pages.

Categories:

Starters

Chaat

North Indian

South Indian

Chinese

Main Course

Biryani

Breads

Desserts

Mithai

Beverages

Combos

Kids Menu

Specialties

Add category navigation.

10. ADVANCED FOOD SEARCH

Create intelligent search.

Users can search:

“Paneer”

“Biryani”

“Sweet”

“Spicy”

“Vegetarian”

“Dessert”

Search should show instant results.

Add autocomplete.

Show:

Recent searches

Popular dishes

Trending dishes

11. FOOD CARD DESIGN

Each food item should display:

High-quality image

Dish name

Short description

Price

Rating

Vegetarian/non-vegetarian indicator

Spice level

Bestseller badge

Chef special badge

Preparation time

Calories where available

Add button

Example:

Paneer Tikka

Char-grilled cottage cheese marinated in aromatic spices.

⭐ 4.8

₹299

Add +

12. FOOD DETAILS

When users click a food item, open an elegant product details page/modal.

Display:

Large image

Ingredients

Description

Price

Nutritional information

Spice level

Allergens

Preparation time

Reviews

Customization:

Spice level

Quantity

Extra cheese

Extra paneer

Extra sauce

Add-ons

Add special instructions:

“Add cooking instructions…”

Button:

Add to Cart

13. ONLINE ORDERING

Create a complete ordering system.

Flow:

Browse menu

Select food

Customize

Add to cart

Review cart

Login/continue as guest

Enter address

Select delivery/takeaway

Apply coupon

Choose payment

Place order

Order confirmation

Track order

This must actually work.

14. CART

Create:

/cart

Display:

Food items

Quantity

Customizations

Price

Remove

Increase/decrease quantity

Order summary:

Subtotal
Discount
Taxes
Delivery fee
Grand total

Coupon field:

Apply Coupon

Primary button:

Proceed to Checkout

15. CHECKOUT

Create a modern multi-step checkout.

Step 1:

Customer details

Step 2:

Delivery / takeaway / dine-in

Step 3:

Address or table information

Step 4:

Payment

Step 5:

Confirmation

Payment options:

UPI

Credit Card

Debit Card

Net Banking

Wallet

Cash on Delivery / Pay at Restaurant where appropriate

For development, implement a realistic test/sandbox payment flow if live payment credentials are unavailable.

Never store raw card information.

16. ORDER CONFIRMATION

After successful order:

Show beautiful confirmation animation.

Display:

“Your order is on its way to delicious.”

Include:

Order ID

Estimated time

Items

Amount

Payment status

Delivery address

Buttons:

Track Order

View Order

Continue Ordering

17. LIVE ORDER TRACKING

Create:

/track-order/:id

Show a real-time style tracking timeline:

✓ Order Received

✓ Confirmed

✓ Being Prepared

✓ Ready

🚴 Out for Delivery

✓ Delivered

Show:

Estimated delivery time

Restaurant information

Delivery address

Order summary

If live delivery APIs are unavailable, create a realistic simulated status system that can later be connected to a real delivery API.

18. TABLE RESERVATION

Create:

/reservations

Users can select:

Date

Time

Guests

Seating preference

Special occasion

Seating options:

Indoor

Outdoor

Family

Couple

Private dining

Display available time slots dynamically.

After reservation:

Generate:

Reservation ID

QR code

Date

Time

Guests

Table information

Allow cancellation/rescheduling.

19. DIGITAL TABLE EXPERIENCE

Create a modern digital dining feature.

Each table can have a QR code.

When scanned:

User sees:

Mithaas Digital Menu

They can:

Browse menu

Order from table

Request waiter

Request water

Request bill

Call service

Leave feedback

Create a beautiful mobile-first table ordering interface.

20. AI FOOD ASSISTANT

Create a floating AI assistant named:

Mithaas AI

It should help customers discover food.

Examples:

User:

“I want something spicy under ₹400.”

AI recommends dishes.

User:

“What should I order for 4 people?”

AI creates a meal recommendation.

User:

“I am vegetarian and don't like very spicy food.”

AI filters the menu.

User:

“Suggest a dessert after paneer tikka.”

AI recommends desserts.

Create a beautiful conversational interface.

Add quick prompts:

“What should I eat?”

“Bestsellers”

“Under ₹300”

“Family meal”

“Healthy options”

“Dessert recommendations”

21. SMART MEAL BUILDER

Create:

/meal-builder

Users choose:

Number of people:

1 / 2 / 4 / 6 / 10+

Budget:

₹500 / ₹1,000 / ₹2,000 / ₹5,000+

Preference:

Vegetarian

Non-vegetarian

Jain

Spicy

Mild

Healthy

Family

Romantic

The system generates a recommended meal.

Display:

Starter
Main course
Bread/Rice
Side
Dessert
Beverage

Show:

Estimated total

Save Meal

Add All to Cart

22. OFFERS PAGE

Create:

/offers

Sections:

Today's Offers

Weekend Specials

Combo Deals

Family Deals

Student Offers

Festival Specials

First Order Offer

Coupon system should actually validate coupons.

Example:

MITHAAS10

Show:

Discount

Minimum order

Expiry

Applicable categories

23. LOYALTY PROGRAM

Create:

Mithaas Rewards

Users earn points for:

Orders

Reservations

Reviews

Referrals

Birthday rewards

Membership levels:

🥉 Sweet Starter

🥈 Mithaas Member

🥇 Mithaas Elite

💎 Mithaas Royal

Dashboard should show:

Current points

Points earned

Points redeemed

Available rewards

Progress to next tier

24. USER PROFILE

Create:

/profile

Sections:

Personal information

Saved addresses

Saved payment methods

Favourite dishes

Order history

Reservations

Rewards

Reviews

Notifications

Preferences

25. ORDER HISTORY

Create:

/orders

Tabs:

Active

Completed

Cancelled

Each order displays:

Order ID

Date

Items

Amount

Status

Reorder button

Add:

Reorder

button that adds the previous items back to cart.

26. FAVOURITES

Users can favourite:

Dishes

Restaurants/locations

Offers

Create:

/favorites

Allow one-click add to cart.

27. RESTAURANT LOCATIONS

Create:

/locations

Display all Mithaas branches.

Each location card:

Image

Address

Phone

Opening hours

Rating

Facilities

Map

Buttons:

Get Directions

Reserve Table

View Menu

28. INTERACTIVE MAP

Integrate Mapbox or another suitable map provider.

Show:

Mithaas locations

Nearby restaurants

Parking

Landmarks

Features:

Search

Zoom

Directions

Location filtering

29. OUR STORY

Create an immersive brand story page.

Sections:

Our Beginning

Tell the story of Mithaas.

Our Philosophy

Traditional recipes + quality ingredients + modern hospitality.

Our Kitchen

Show food preparation.

Our Ingredients

Highlight quality and freshness.

Our People

Chefs and team.

Use scroll-based animations.

30. GALLERY

Create:

/gallery

Interactive gallery with:

Food

Restaurant interiors

Events

Kitchen

Customers

Festivals

Add filters.

Create fullscreen image viewer.

31. EVENTS & CATERING

Create:

/catering

Offer:

Weddings

Birthdays

Corporate events

Parties

Festivals

Private dining

Include inquiry form:

Name
Phone
Email
Event type
Date
Guests
Budget
Message

After submission:

Show confirmation.

32. BLOG / FOOD STORIES

Create:

/stories

Content categories:

Recipes

Indian food culture

Food guides

Mithaas stories

Festival food

Chef stories

Create SEO-friendly article pages.

33. REVIEWS

Create:

/reviews

Display:

Average rating

Total reviews

Rating distribution

Customer photos

Allow verified customers to submit reviews.

Users can:

Give stars

Write review

Upload photo

Select food item

34. NOTIFICATION SYSTEM

Create notification center.

Notifications:

Order updates

Reservation reminders

Offers

Rewards

New dishes

Festival specials

Support:

Read/unread
Mark all as read

35. RESTAURANT ADMIN DASHBOARD

Create:

/admin

This must be a serious operational dashboard.

Sections:

Dashboard

Show:

Today's revenue

Orders

Reservations

Customers

Average order value

Popular dishes

Charts using Recharts.

36. ADMIN MENU MANAGEMENT

Admin can:

Add food

Edit food

Delete food

Change price

Upload image

Add category

Mark bestseller

Mark unavailable

Manage ingredients

Manage add-ons

Changes should update the customer menu.

37. KITCHEN DISPLAY SYSTEM

Create:

/kitchen

A kitchen order management screen.

Columns:

New

Preparing

Ready

Completed

Each order card:

Order ID

Items

Customizations

Customer name

Order type

Time

Priority

Kitchen staff can move orders between statuses.

Use drag-and-drop if practical.

38. ADMIN ORDER MANAGEMENT

Admin can:

View orders

Update status

Cancel orders

Refund orders

View customer information

View payment status

Search orders

Filter orders

39. ADMIN RESERVATION MANAGEMENT

Admin can:

View reservations

Approve

Cancel

Reschedule

Assign tables

Manage capacity

Block time slots

40. ADMIN CUSTOMER MANAGEMENT

Display:

Customers

Total orders

Total spending

Last order

Loyalty tier

Reviews

Allow search/filter.

41. ANALYTICS

Admin analytics:

Revenue

Orders

Average order value

Popular dishes

Peak hours

Customer retention

Repeat customers

Coupon usage

Reservation trends

Delivery vs dine-in

Monthly revenue

Use interactive charts.

42. DATABASE

Create a proper Supabase PostgreSQL database.

Tables:

users
profiles
addresses
menu_categories
menu_items
menu_item_addons
menu_item_variants
orders
order_items
order_item_customizations
payments
reservations
tables
locations
reviews
favorites
coupons
coupon_usage
rewards
reward_transactions
notifications
catering_requests
stories
ai_conversations
ai_messages

Create:

Primary keys

Foreign keys

Indexes

Timestamps

Proper relationships

Row Level Security

43. AUTHENTICATION

Implement:

Email/password signup

Login

Logout

Forgot password

Google authentication if available

Support:

Customer

Staff

Admin

Use protected routes.

Customers must not access admin pages.

44. SEARCH

Create global search.

Search:

Food

Categories

Offers

Locations

Stories

Show instant search suggestions.

45. DARK MODE

Support:

Light

Dark

System

The entire application must work correctly in both themes.

Persist preference.

46. ANIMATIONS

Use Framer Motion.

Include:

Page transitions

Food card animations

Cart animations

Add-to-cart animation

Scroll animations

Hover effects

Modal animations

Order confirmation animation

Loading animations

Keep animations smooth and professional.

Do not over-animate.

47. LOADING STATES

Every asynchronous action must have:

Skeleton loading

Spinner where appropriate

Empty state

Error state

Retry action

Never show blank screens.

48. ERROR HANDLING

Implement:

Form validation

Invalid coupon handling

Payment errors

Authentication errors

Network errors

Empty cart protection

Invalid reservation handling

Show clear messages.

49. ACCESSIBILITY

Implement:

Semantic HTML

Keyboard navigation

Proper labels

ARIA attributes

Focus states

Accessible modals

Accessible forms

Good color contrast

50. SEO

Implement:

SEO-friendly routes

Meta titles

Meta descriptions

Open Graph metadata

Restaurant structured data

Menu structured data where appropriate

Example routes:

/menu

/menu/paneer-tikka

/locations

/locations/gurugram

/offers

/stories

51. PERFORMANCE

Optimize:

Image loading

Lazy loading

Code splitting

Component rendering

Database queries

Search

Caching

Use optimized responsive images.

Target excellent Lighthouse performance.

52. SECURITY

Use:

Supabase RLS

Protected routes

Role-based authorization

Secure authentication

Environment variables

Input validation

Never expose secrets in frontend code.

Never store raw payment card information.

53. SAMPLE MENU DATA

Populate the demo website with realistic Indian dishes.

Include at least:

Starters

Paneer Tikka
Hara Bhara Kebab
Veg Seekh Kebab
Dahi Ke Kebab

Main Course

Paneer Butter Masala
Dal Makhani
Shahi Paneer
Kadhai Paneer
Chole Bhature

Rice

Veg Biryani
Jeera Rice
Biryani Special

Breads

Butter Naan
Garlic Naan
Tandoori Roti
Lachha Paratha

Desserts

Gulab Jamun
Rasmalai
Gajar Ka Halwa
Kulfi

Beverages

Lassi
Masala Chai
Cold Coffee
Fresh Lime

Add realistic prices, descriptions, ratings, preparation times and categories.

54. FESTIVAL MODE

Create seasonal promotional support.

Examples:

Diwali

Holi

Navratri

Raksha Bandhan

Christmas

New Year

Admin should be able to activate seasonal banners and offers.

55. SMART PERSONALIZATION

When logged in, personalize the homepage.

Example:

“Welcome back, Akshaj 👋”

Show:

Recently ordered

Favourite dishes

Recommended dishes

Available rewards

Current offers

Use previous order behavior for recommendations.

56. DEMO MODE

If real restaurant/payment/delivery APIs are unavailable:

Create realistic demo functionality.

The application should still allow:

Ordering

Checkout

Test payment

Reservations

Order tracking

Admin management

Kitchen management

Notifications

Clearly structure the code so real APIs can replace demo services later.

Do not claim that simulated data is real.

57. PWA / APP-LIKE EXPERIENCE

Make the website installable as a Progressive Web App where practical.

Add:

Web app manifest

App icons

Mobile-friendly splash experience

Responsive app-like navigation

The mobile experience should feel close to a native food-ordering application.

58. FINAL QUALITY STANDARD

This should NOT look like a generic AI-generated restaurant template.

It should look like a real premium restaurant technology product that could be launched commercially.

Prioritize:

Premium Design
Real Functionality
Excellent UX
Mobile-first Experience
Fast Performance
AI Features
Secure Backend
Scalable Architecture

59. TEST EVERYTHING

Before considering the project complete, audit the entire application.

Check:

Every route

Every button

Every form

Every modal

Every dropdown

Every filter

Every search

Cart

Checkout

Coupon

Payment demo

Reservation

Order tracking

Authentication

User dashboard

Admin dashboard

Kitchen dashboard

Database operations

Mobile responsiveness

Tablet responsiveness

Desktop responsiveness

Dark mode

Loading states

Error states

Fix all:

Console errors

TypeScript errors

Broken imports

UI overflow

Responsive issues

Broken links

Non-functional buttons

Do not leave core functionality as TODOs or placeholders.

60. BUILD ORDER

Build the project in this order:

Design system

Navigation

Homepage

Menu

Food details

Cart

Authentication

Checkout

Payment demo

Order tracking

Reservations

AI assistant

Smart meal builder

Offers

Rewards

User dashboard

Locations

Reviews

Catering

Admin dashboard

Kitchen dashboard

Database

Responsive optimization

Performance optimization

Security audit

Final testing

FINAL INSTRUCTION

Do not stop after creating the homepage.

Build the complete MITHAAS digital restaurant ecosystem.

The final website should be:

High-tech + Premium + Indian + Elegant + Fast + Responsive + AI-powered + Fully Functional

It should feel like a combination of:

Premium Restaurant + Swiggy/Zomato-style ordering experience + AI food assistant + modern loyalty platform + restaurant management system

while maintaining a completely original MITHAAS identity and interface.

Build it as a real product, not a visual prototype.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/3bebca3a-d56f-4e1c-ad67-d3ee0bd3639c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
