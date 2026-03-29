# Database Schema for Personal Website

The database will use **SQL Server** (compatible with Azure SQL). Below are the key tables and their relationships:

---

## **Tables**

### **Users**


| Column       | Type         | Description                          |
| ------------ | ------------ | ------------------------------------ |
| UserID       | INT (PK)     | Unique identifier for each user      |
| Username     | VARCHAR(50)  | Display name for each of the two users |
| PasswordHash | VARCHAR(255) | Hashed password (for secure section) |


---

### **Questions**


| Column       | Type         | Description                            |
| ------------ | ------------ | -------------------------------------- |
| QuestionID   | INT (PK)     | Unique identifier for each question    |
| Text         | VARCHAR(500) | The question text                      |
| IsPredefined | BIT          | True if pre-populated, false if custom |


---

### **Answers**


| Column     | Type          | Description                       |
| ---------- | ------------- | --------------------------------- |
| AnswerID   | INT (PK)      | Unique identifier for each answer |
| QuestionID | INT (FK)      | Links to the question             |
| UserID     | INT (FK)      | Links to the user                 |
| Text       | VARCHAR(1000) | The answer text                   |
| Timestamp  | DATETIME      | When the answer was submitted     |


---

### **Feelings**


| Column    | Type          | Description                              |
| --------- | ------------- | ---------------------------------------- |
| FeelingID | INT (PK)      | Unique identifier for each feeling entry |
| UserID    | INT (FK)      | Links to the user                        |
| Feeling   | VARCHAR(50)   | The selected feeling (e.g., "Happy")     |
| Subject   | VARCHAR(100)  | Subject of the feeling                   |
| Context   | VARCHAR(1000) | Description/context                      |
| Timestamp | DATETIME      | When the feeling was submitted           |


---

### **Photos**


| Column    | Type         | Description                      |
| --------- | ------------ | -------------------------------- |
| PhotoID   | INT (PK)     | Unique identifier for each photo |
| UserID    | INT (FK)     | Links to the user                |
| ImageURL  | VARCHAR(255) | Path/URL to the photo            |
| IsSecure  | BIT          | True if in the secure section    |
| Timestamp | DATETIME     | When the photo was uploaded      |


---

### **TimelineEntries**


| Column    | Type          | Description                      |
| --------- | ------------- | -------------------------------- |
| EntryID   | INT (PK)      | Unique identifier for each entry |
| UserID    | INT (FK)      | Links to the user                |
| Title     | VARCHAR(100)  | Title of the memory              |
| Content   | VARCHAR(1000) | Description or photo reference   |
| Timestamp | DATETIME      | When the memory was added        |