<p align="center"><img src="brand/logo-horizontal.svg" width="440" alt="Steedly"></p>

# **Software Requirements Specification (SRS) and Software Development Plan (SDP)
for Steedly — a horse health and care platform**

> Visual identity guide and corporate colors: [`brand/BRAND.md`](brand/BRAND.md)

---

## **1. Software Requirements Specification (SRS)**

### **1.1. Introduction**
This document describes the requirements of a comprehensive horse-related information, services and online shop system. The system has two main parts:
- **PWA for iOS and web**
- **Dedicated Android application**

### **1.2. Overall project goals**
- Create a comprehensive information reference on horse types in the form of a blog
- Provide veterinarian and horse transporter dispatch services
- Online shop for horse accessories, medicines and supplements
- Announcing domestic and international horse competitions

### **1.3. Description of functional requirements**

#### **1.3.1. Blog module**
- Ability to display articles with a headline, suitable image and structured content
- Categorization by breed, use, geography, etc.
- Advanced search system in articles
- Ability to save articles for offline reading (PWA)
- Display of multimedia content (image, video, gallery)

#### **1.3.2. Dispatch services module**
- Veterinarian profile registration form (name, specialty, region, contact, resume, image)
- Horse transporter profile registration form (transport information, equipment, area of activity)
- Online service booking system
- Tracking the status of the service request
- Rating and review system for service providers

#### **1.3.3. Shop module**
- Display of products (equipment, medicines, supplements)
- Product categories
- Shopping cart and online payment
- Order tracking
- Inventory management

#### **1.3.4. Competitions module**
- Calendar of domestic and international competitions
- Filter by competition type (racing, jumping, dressage, ...)
- Competition reminder notifications
- Complete competition information (location, time, prizes, entry conditions)
- Results of past competitions

### **1.4. Non-functional requirements**
- Responsive design compatible with mobile and desktop
- Page load time under 3 seconds
- Offline support for the PWA
- User data security
- Compatibility with modern browsers and Android 8 and above

### **1.5. Technical platform requirements**

#### **1.5.1. PWA (iOS and web)**
- Technology Stack: React.js / Next.js + TypeScript
- Service Worker for offline operation
- Web App Manifest
- Installable on the home screen of iOS devices and desktop
- Push Notifications

#### **1.5.2. Android application**
- Technology Stack: Kotlin + Jetpack Compose
- MVVM architecture
- Offline support
- Use of Android notification systems
- Publishing on the Google Play Store

#### **1.5.3. Backend and API**
- Framework: Node.js + Express or Django
- Database: PostgreSQL + Redis for cache
- RESTful API or GraphQL
- File storage: AWS S3 or an Iranian equivalent
- Server: Linux

---

## **2. Software Development Plan (SDP)**

### **2.1. Development phases**

#### **Phase 1: Research and design (4 weeks)**
- Complete research on horse content (breeds, diseases, equipment)
- UX/UI design
- Creating the database design
- Defining API Endpoints
- Choosing technologies

#### **Phase 2: Backend development (6 weeks)**
- Setting up the server and database
- Developing the users and authentication module
- Developing the blog module (article CRUD)
- Developing the services module
- Developing the shop module
- Developing the competitions module

#### **Phase 3: PWA frontend development (8 weeks)**
- Building base components
- Implementing the blog page
- Implementing service pages
- Implementing the shop
- Implementing the competition calendar
- Adding PWA features

#### **Phase 4: Android application development (6 weeks)**
- Creating the Android project
- Implementing the user interface
- Connecting to the backend API
- Testing and debugging

#### **Phase 5: Testing and deployment (4 weeks)**
- Integration testing
- Performance testing
- Security testing
- Releasing the initial version
- Collecting feedback

### **2.2. Development team structure**
- Project manager: 1 person
- UX/UI designer: 1 person
- Backend developer: 2 people
- PWA frontend developer: 2 people
- Android developer: 2 people
- Content specialist (horses): 1 person
- Tester: 1 person

### **2.3. Overall project timeline**
- Total project time: **28 weeks** (~7 months)
- Start: month 1
- MVP delivery: end of month 5
- Final delivery: end of month 7

### **2.4. Estimated budget**
| Section | Estimated cost |
|------|--------------|
| Design and research | 40 million Toman |
| Backend development | 120 million Toman |
| PWA development | 160 million Toman |
| Android development | 120 million Toman |
| Content production | 60 million Toman |
| Testing and deployment | 40 million Toman |
| **Total** | **540 million Toman** |

### **2.5. Risks and mitigations**
| Risk | Probability | Impact | Mitigation |
|------|---------|--------|--------------|
| Shortage of horse content specialists | Medium | High | Cooperation with related associations |
| Online payment problems | Low | Medium | Use reputable gateways |
| Lack of user uptake | Medium | High | Targeted marketing |
| Large volume of content | High | Medium | Prioritization in content production |

### **2.6. Success criteria**
- Attract 5000 active users in the first month
- Publish 200 specialized articles in the first 6 months
- 100 service orders per month
- 50 million Toman in sales in the shop's first month
- Rating of 4+ in the stores

---

## **3. Sample blog content table**

### **Main article categories:**
1. **Horse breeds**
   - Arabian horse
   - Turkmen
   - English
   - Friesian
   - ...

2. **Diseases and health**
   - Digestive diseases
   - Hoof problems
   - Dental care
   - Vaccination

3. **Equipment and supplies**
   - Saddle and tack
   - Nutritional supplements
   - Care supplies

4. **Equestrian sports**
   - Dressage
   - Show jumping
   - Polo
   - Horse racing

5. **History and culture**
   - The horse in Iranian history
   - The horse in literature
   - Horse museums around the world

---

**Prepared and compiled by:**
The comprehensive horse platform development team
Date: 2024/04/03

*This document will be updated periodically.*
