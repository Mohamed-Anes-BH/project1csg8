# Project Architecture

## Overview
This is a Django REST API backend for a student-company matching platform.

## Key Design Decisions

### 1. App Structure
- **Modular Apps**: Each feature is isolated in its own Django app
- **apps/ Directory**: All apps are organized under apps/ for clarity
- **Separation of Concerns**: Models, serializers, views, and services are clearly separated

### 2. Authentication & Authorization
- JWT-based authentication using djangorestframework-simplejwt
- Custom user model with role-based access (Student/Company)
- Permission classes for fine-grained access control

### 3. Data Model
- **Academic App**: Critical for specialty-based targeting
- **Offers App**: Core business logic with M2M relationships
- **Applications App**: Workflow management with status tracking

### 4. Targeting System
- Universities can target specific universities and specialties
- Visibility rules implemented in services layer
- Matching algorithm for student-offer compatibility

### 5. Testing Strategy
- Unit tests per app
- Integration tests for critical workflows
- Factory Boy for test data generation

## Critical Components

### Offers Targeting
The `offers.services.is_visible_for_student()` function determines if an offer should be visible to a student based on:
- Student's university
- Student's specialty
- Student's skills

### Application Workflow
Status transitions are managed via `applications.services.update_status()` with validation and notifications.

## Future Enhancements
- Real-time notifications (WebSockets)
- Advanced matching algorithm with ML
- Recommendation system
