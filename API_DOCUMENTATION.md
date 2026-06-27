# 📡 API ENDPOINTS DOCUMENTATION

Complete REST API reference for PPDB Portal.

---

## 🔐 Authentication

All protected endpoints require a valid session (user must be logged in via NextAuth).

### Base URL
```
http://localhost:3000/api
```

---

## 👤 Auth Endpoints

### Get Current Session
```
GET /auth/session
Authorization: Required (any role)
```

**Response (200):**
```json
{
  "id": 1,
  "email": "admin@ppdb.test",
  "full_name": "Admin User",
  "phone_number": "081234567890",
  "role": "admin",
  "status": "active",
  "created_at": "2026-06-23T10:00:00Z",
  "last_login": "2026-06-23T14:30:00Z"
}
```

**Errors:**
- `401` - Not authenticated
- `404` - User not found

---

## 📝 Registration Endpoints

### List User Registrations
```
GET /registrations
Authorization: Required (any role)
```

**Response (200):**
```json
[
  {
    "id": 1,
    "user_id": 2,
    "nisn": "1234567890123456",
    "registration_number": "REG-123456-789",
    "full_name": "Ahmad Hidayat",
    "email": "ahmad@student.test",
    "phone": "081234567890",
    "gpa": 3.75,
    "total_score": 2.85,
    "registration_status": "submitted",
    "verification_status": "pending",
    "selection_status": "pending",
    "preferred_school_id": 1,
    "pathway_id": 2,
    "submitted_at": "2026-06-23T11:00:00Z",
    "school": { "id": 1, "name": "SMA Negeri 1 Jakarta" },
    "pathway": { "id": 2, "pathway_name": "Jalur Zonasi" }
  }
]
```

**Errors:**
- `401` - Not authenticated

---

### Create New Registration
```
POST /registrations
Authorization: Required (applicant role)
Content-Type: application/json
```

**Request Body:**
```json
{
  "nisn": "1234567890123456",
  "fullName": "Ahmad Hidayat",
  "dateOfBirth": "2008-05-15",
  "gender": "M",
  "email": "ahmad@student.test",
  "phone": "081234567890",
  "gpa": 3.75,
  "certificatePoints": 85,
  "address": "Jl. Merdeka No. 123",
  "city": "Jakarta",
  "province": "DKI Jakarta",
  "zipcode": "12345",
  "latitude": "-6.2088",
  "longitude": "106.8456",
  "preferredSchool": "1",
  "pathway": "2",
  "parentName": "Budi Santoso",
  "parentPhone": "082345678901"
}
```

**Response (201):**
```json
{
  "message": "Registration created successfully",
  "registration": {
    "id": 5,
    "registration_number": "REG-654321-123",
    "total_score": 2.85,
    "registration_status": "submitted",
    "verification_status": "pending",
    "selection_status": "pending"
  }
}
```

**Errors:**
- `400` - Missing required field(s)
- `401` - Not authenticated
- `409` - NISN already registered

---

## 📊 Rankings Endpoints

### Get Rankings
```
GET /rankings?schoolId=1&pathwayId=2&limit=50&offset=0
Authorization: Not required
```

**Query Parameters:**
- `schoolId` (optional) - Filter by school ID
- `pathwayId` (optional) - Filter by pathway ID
- `limit` (optional, default: 100, max: 1000) - Number of results
- `offset` (optional, default: 0) - Pagination offset

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "registration_id": 5,
      "school_id": 1,
      "pathway_id": 2,
      "final_rank": 1,
      "final_score": 3.85,
      "status": "accepted",
      "announcement_date": "2026-06-25T10:00:00Z",
      "registration": {
        "id": 5,
        "full_name": "Ahmad Hidayat",
        "nisn": "1234567890123456"
      },
      "school": {
        "id": 1,
        "name": "SMA Negeri 1 Jakarta"
      },
      "pathway": {
        "id": 2,
        "pathway_name": "Jalur Zonasi"
      }
    }
  ],
  "total": 150,
  "limit": 50,
  "offset": 0
}
```

---

### Recalculate Rankings (Admin Only)
```
POST /rankings
Authorization: Required (admin role only)
Content-Type: application/json
```

**Request Body:**
```json
{}
```

**Response (200):**
```json
{
  "message": "Rankings recalculated successfully",
  "totalRanked": 450
}
```

**Errors:**
- `401` - Not authenticated
- `403` - Only admins can recalculate rankings

**Algorithm:**
1. Fetches all registrations with status `verified`
2. Groups by school + pathway combination
3. Sorts by `total_score` (descending)
4. Assigns ranks: 1st rank gets `accepted` status up to pathway quota
5. Remaining applicants get `waitlist` status

---

## 🔔 Notifications Endpoints

### Get User Notifications
```
GET /notifications?limit=50&offset=0
Authorization: Required (any role)
```

**Query Parameters:**
- `limit` (optional, default: 50, max: 500)
- `offset` (optional, default: 0)

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "user_id": 2,
      "title": "Verifikasi Dokumen Berhasil",
      "message": "Dokumen Anda telah diverifikasi oleh panitia.",
      "type": "document",
      "related_registration_id": 5,
      "is_read": false,
      "sent_at": "2026-06-23T12:00:00Z",
      "read_at": null
    }
  ],
  "total": 12,
  "limit": 50,
  "offset": 0
}
```

**Notification Types:**
- `schedule` - Important dates/deadlines
- `result` - Selection results
- `document` - Document verification status
- `system` - System announcements

---

### Mark Notification as Read
```
PATCH /notifications
Authorization: Required (any role)
Content-Type: application/json
```

**Request Body:**
```json
{
  "notificationId": "1"
}
```

**Response (200):**
```json
{
  "message": "Notification marked as read",
  "notification": {
    "id": 1,
    "is_read": true,
    "read_at": "2026-06-23T14:30:00Z"
  }
}
```

**Errors:**
- `400` - Missing notificationId
- `401` - Not authenticated
- `404` - Notification not found

---

## 📄 Documents Endpoints

### Get Registration Documents
```
GET /documents?registrationId=5
Authorization: Required (applicant role - own docs only)
```

**Query Parameters:**
- `registrationId` (required) - Registration ID

**Response (200):**
```json
[
  {
    "id": 1,
    "registration_id": 5,
    "document_type": "KK",
    "file_path": "/uploads/5-KK-1687515600000-abc123.pdf",
    "file_size": 245000,
    "mime_type": "application/pdf",
    "verification_status": "approved",
    "verified_by": 1,
    "verified_at": "2026-06-23T12:00:00Z",
    "created_at": "2026-06-23T10:00:00Z"
  }
]
```

---

### Upload Document
```
POST /documents
Authorization: Required (applicant role)
Content-Type: multipart/form-data
```

**Form Data:**
- `file` (required) - PDF file, max 5MB
- `registrationId` (required) - Registration ID
- `documentType` (required) - One of: KK, Akta, Sertifikat, Raport

**Response (201):**
```json
{
  "message": "Document uploaded successfully",
  "document": {
    "id": 2,
    "registration_id": 5,
    "document_type": "Raport",
    "file_path": "/uploads/5-Raport-1687515600000-def456.pdf",
    "file_size": 187000,
    "mime_type": "application/pdf",
    "verification_status": "pending",
    "created_at": "2026-06-23T14:30:00Z"
  }
}
```

**Errors:**
- `400` - Missing required fields or invalid document type
- `401` - Not authenticated
- `404` - Registration not found
- `413` - File exceeds 5MB limit

**Valid Document Types:**
- `KK` - Kartu Keluarga (Family Card)
- `Akta` - Akta Kelahiran (Birth Certificate)
- `Sertifikat` - Sertifikat/Piagam (Certificates)
- `Raport` - Rapor (Report Card)

---

### Delete Document
```
DELETE /documents?documentId=1
Authorization: Required (applicant role - own docs only)
```

**Response (200):**
```json
{
  "message": "Document deleted successfully"
}
```

**Errors:**
- `400` - Missing documentId
- `401` - Not authenticated
- `404` - Document not found

---

## 🌍 Error Responses

### Standard Error Format
```json
{
  "error": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes
- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - No permission
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists
- `413 Payload Too Large` - File too large
- `500 Internal Server Error` - Server error

---

## 🔄 Data Scoring System

**Total Score Calculation:**
```
total_score = (gpa × 0.60) + (certificate_points × 0.40)
```

**Example:**
- GPA: 3.75 (scale 0-4)
- Certificate Points: 85 (scale 0-100)
- Total Score: (3.75 × 0.60) + (85 × 0.40) = 2.25 + 34 = 36.25

---

## 📈 Ranking Logic

1. **Grouping:** Registrations grouped by (school_id, pathway_id)
2. **Sorting:** Within each group, sorted by total_score (highest first)
3. **Ranking:** 
   - Rank 1 to Quota = "accepted"
   - Rank > Quota = "waitlist"
4. **Update:** Selection results created with final_rank and status

**Example (SMA Negeri 1, Jalur Zonasi, Quota: 50):**
- Rank 1-50: Status = "accepted" ✅
- Rank 51+: Status = "waitlist" ⏳

---

## 🧪 Testing Endpoints

### Using cURL

**Get Session:**
```bash
curl -X GET http://localhost:3000/api/auth/session \
  -H "Cookie: next-auth.session-token=<token>"
```

**Create Registration:**
```bash
curl -X POST http://localhost:3000/api/registrations \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=<token>" \
  -d '{
    "nisn": "1234567890123456",
    "fullName": "Ahmad Hidayat",
    "email": "ahmad@student.test",
    "phone": "081234567890",
    "gpa": 3.75,
    "preferredSchool": "1",
    "pathway": "2",
    "parentName": "Budi Santoso",
    "parentPhone": "082345678901"
  }'
```

**Get Rankings:**
```bash
curl -X GET "http://localhost:3000/api/rankings?schoolId=1&limit=10" \
  -H "Content-Type: application/json"
```

**Upload Document:**
```bash
curl -X POST http://localhost:3000/api/documents \
  -H "Cookie: next-auth.session-token=<token>" \
  -F "file=@./document.pdf" \
  -F "registrationId=5" \
  -F "documentType=KK"
```

---

## 🔒 Rate Limiting

Currently not implemented. In production, add rate limiting:
- 100 requests per minute per IP
- 10 file uploads per hour per user

---

## 📚 SDK Examples

### JavaScript/Node.js
```javascript
// Fetch rankings
const response = await fetch('/api/rankings?schoolId=1&limit=50');
const data = await response.json();
console.log(data);

// Create registration
const registration = await fetch('/api/registrations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nisn: "1234567890123456",
    fullName: "Ahmad Hidayat",
    // ... other fields
  })
});
```

### React Hook
```typescript
import { useEffect, useState } from 'react';

export function useRankings(schoolId?: number) {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = new URL('/api/rankings', window.location.origin);
    if (schoolId) url.searchParams.set('schoolId', schoolId.toString());

    fetch(url)
      .then(r => r.json())
      .then(data => setRankings(data.data))
      .finally(() => setLoading(false));
  }, [schoolId]);

  return { rankings, loading };
}
```

---

## 🚀 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-06-23 | Initial API implementation |

---

## 📞 Support

For API issues:
1. Check this documentation
2. Verify authentication (valid session)
3. Check request body format
4. Review error message
5. Check browser console for details

---

**Last Updated:** June 23, 2026  
**Status:** Production Ready ✅
